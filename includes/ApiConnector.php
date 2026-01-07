<?php

declare(strict_types=1);

namespace Flavio;

use Flavio\Traits\Cache;
use WP_REST_Response;

class ApiConnector
{
	use Cache;

	/**
	 * @var false|mixed|null JWT token
	 */
	protected $token;

	/**
	 * @var false|mixed|null Plan UUID from JWT
	 */
	protected $uuid;

	protected string $endpoint;

	public function __construct()
	{
		// Get JWT token
		$this->token = get_option('flavio_token');

		// Get parsed JWT metadata
		$this->uuid = get_option('flavio_plan_uuid');

		$this->endpoint = $this->resolve_endpoint();
	}

	private function resolve_endpoint() {
		// 1. Check WordPress option (from JWT iss field)
		$api_domain = get_option('flavio_api_domain');

		if ($api_domain == 'mktgoo_frontend_1') {
			return 'http://mktgoo_frontend_1/api';
		}

		if ($api_domain) {
			return 'https://' . $api_domain . '/api';
		}

		// 2. Use constant (already handles env fallback in flavio.php)
		return FLAVIO_API_ENDPOINT;
	}

	/**
	 * @return false|mixed|null
	 */
	public function getUuid()
	{
		return $this->uuid;
	}

	/**
	 * @param string $uri
	 *   The uri to call.
	 * @param string $method
	 *   The http method to call.
	 * @param string $cache_key
	 *   The cache key if needed. Set false to no cache this call.
	 * @param string $lang
	 *   The language.
	 * @param array<string,mixed> $body_params
	 *   Extra params to the api call.
	 * @param string|false $token
	 *   The token to make the api call.
	 * @param array<string,mixed> $query_params
	 * @param array<string,string> $extra_headers
	 *   Extra headers to include/override in the request.
	 *
	 * @return WP_REST_Response
	 */
	public function call(string $uri, string $method, string $cache_key = '', string $lang = 'en', array $body_params = [], $token = false, array $query_params = [], array $extra_headers = []): WP_REST_Response
	{

		// First, try to get the info from the cache if it's a cacheable call.
		if (!empty($cache_key)) {
			$cached = $this->cache_get($cache_key);

			if ($cached !== null) {
				return new WP_REST_Response(array_merge(['success' => true], $cached), 200);
			}
		}

		// We compose the endpoint and body before to make the debug process easier.
		$endpoint = $this->endpoint . $uri;
		$token = $token ?: $this->token;
		$headers = [
			'Accept' => 'application/json',
			'accept-language' => $lang,
			'Content-Type' => 'application/json',
			'Authorization' => 'Bearer ' . $token
		];

		// Merge extra headers (can override defaults like Authorization)
		if (!empty($extra_headers)) {
			$headers = array_merge($headers, $extra_headers);
		}

		$content_body = [
			'method' => strtoupper($method),
			'timeout' => 20,
			'headers' => $headers
		];

		if (!empty($body_params)) {
			$content_body['body'] = json_encode($body_params);
		}

		if (!!$query_params) {
			$endpoint .= '?' . http_build_query($query_params);
		}

		$response = wp_remote_request($endpoint, $content_body);
		$code = wp_remote_retrieve_response_code($response);

		// Check if error, in this case manage it and return.
		if (is_wp_error($response) || !in_array($code, [200, 201, 202, 204])) {
			// This structure is to maintain the old structure and avoid break the API.
			// $response can be a WP_ERROR or an array ¬¬ (wp sucks).
			if (is_array($response)) {
				$errors = json_decode($response['body'], true) ?: [];
			} else {
				$errors = [
					'errors' => [[
						'status' => $code,
						'title' => $response->get_error_message(),
						'detail' => '',
					]]
				];
			}

			return new WP_REST_Response(array_merge(['success' => false], $errors), 500);
		}

		// Success case - Save in cache if required.
		$body = json_decode(wp_remote_retrieve_body($response), true);

		if (!empty($cache_key)) {
			$this->cache_set($cache_key, $body);
		}

		$headers = [];
		foreach (wp_remote_retrieve_headers($response) as $key => $value) {
			if (!is_array($value)) {
				$headers[] = "$key: $value";
			} else {
				foreach ($value as $v)
					$headers[] = "$key: $v";
			}
		}
		return new WP_REST_Response(array_merge(['success' => true], $body ?: []), $code);
	}

	/**
	 * @param string $uri
	 * @param string $cache_key
	 * @param string $lang
	 * @param array<string,mixed> $params
	 * @param string|false $token
	 * @return array<string, mixed>
	 */
	public function data_get(string $uri, string $cache_key = '', string $lang = 'en', array $params = [], $token = false): array
	{
		$data = $this->call($uri, 'get', $cache_key, $lang, $params, $token);

		if ($data->data['success']) {
			return $data->data;
		}

		return [];
	}

	/**
	 * Clear the flavio data saved in cache.
	 *
	 * @param string $cache_key
	 * @return void
	 */
	public function clear_cache(string $cache_key): void
	{
		$this->cache->clear_cache($cache_key);
	}
}
