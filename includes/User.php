<?php
declare(strict_types=1);

namespace Flavio;

use Exception;
use Flavio\Traits\Cache;
use WP_REST_Request;
use WP_REST_Response;

/**
 * User class for handling user information
 */
class User {
	use Cache;

	/**
	 * @var ApiConnector API connector instance
	 */
	protected ApiConnector $api_connector;

	/**
	 * @var string Cache key for user information
	 */
	private const CACHE_KEY = 'user_info';

	/**
	 * @var int Cache duration in seconds (30 min)
	 */
	private const CACHE_DURATION = 1800;

	/**
	 * @var string Cache key for trial information
	 */
	private const TRIAL_CACHE_KEY = 'trial_info';

	/**
	 * @var int Cache duration for trial info in seconds (24 hours)
	 */
	private const TRIAL_CACHE_DURATION = 86400;

	/**
	 * Constructor
	 */
	public function __construct() {
		$this->api_connector = new ApiConnector();
		add_action('rest_api_init', [$this, 'register_routes']);
	}

	/**
	 * Register REST API routes
	 */
	public function register_routes(): void {
		register_rest_route('flavio/v1', '/user/disconnect', [
			'methods' => 'POST',
			'callback' => [$this, 'disconnect'],
			'permission_callback' => [$this, 'check_admin_permissions'],
		]);
	}

	/**
	 * Check if a user has admin permissions
	 *
	 * @return bool
	 */
	public function check_admin_permissions(): bool {
		return current_user_can('manage_options');
	}

	/**
	 * Get user information from the API
	 *
	 * Fetches user info from api/accounts/:account_id/user endpoint
	 * Results are cached for one week
	 *
	 * @return array User information or empty array on error
	 */
	public function info(): array {
		try {
			$account_id = $this->api_connector->getUuid();

			if (empty($account_id)) {
				// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log -- Intentional error logging
				error_log('Flavio: No account ID found');
				return [];
			}

			// Check cache first
			$cached_data = $this->cache_get(self::CACHE_KEY);
			if ($cached_data !== null) {
				return $cached_data;
			}

			// Call the API
			$uri = "/accounts/{$account_id}/user";
			$response = $this->api_connector->call($uri, 'GET');

			// Check if the response was successful
			if (!isset($response->data['success']) || !$response->data['success']) {
				// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log -- Intentional error logging
				error_log('Flavio: Failed to fetch user info');
				return [];
			}

			// Cache the response
			$user_data = $response->data['data']['attributes'];
			$this->cache_set(self::CACHE_KEY, $user_data, self::CACHE_DURATION);

			return $user_data;

		} catch (Exception $e) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log -- Intentional error logging
			error_log('Flavio: Error fetching user info: ' . $e->getMessage());
			return [];
		}
	}

	/**
	 * Get trial information from the API
	 *
	 * Fetches trial info from api/accounts/:account_id/trial-info endpoint
	 * Results are cached for 24 hours
	 *
	 * @return array Trial information with is_trial and days_trial_left or empty array on error
	 */
	public function trial_info(): array {
		try {
			$account_id = $this->api_connector->getUuid();

			if (empty($account_id)) {
				// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log -- Intentional error logging
				error_log('Flavio: No account ID found');
				return [];
			}

			// Check cache first
			$cached_data = $this->cache_get(self::TRIAL_CACHE_KEY);
			if ($cached_data !== null) {
				return $cached_data;
			}

			// Call the API
			$uri = "/accounts/{$account_id}/trial-info";
			$response = $this->api_connector->call($uri, 'GET');

			// Check if the response was successful
			if (!isset($response->data['success']) || !$response->data['success']) {
				// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log -- Intentional error logging
				error_log('Flavio: Failed to fetch trial info');
				return [];
			}

			// Get attributes directly from the response
			$trial_data = $response->data['data']['attributes'];

			// Cache the response for 24 hours
			$this->cache_set(self::TRIAL_CACHE_KEY, $trial_data, self::TRIAL_CACHE_DURATION);

			return $trial_data;

		} catch (Exception $e) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log -- Intentional error logging
			error_log('Flavio: Error fetching trial info: ' . $e->getMessage());
			return [];
		}
	}

	/**
	 * Disconnect user by removing authentication data
	 *
	 * Removes token, api_domain, and uuid from database and clears cache
	 *
	 * @param WP_REST_Request $request
	 * @return WP_REST_Response
	 */
	public function disconnect(WP_REST_Request $request): WP_REST_Response {
		try {
			// Remove authentication options stored by check_auth_status
			delete_option('flavio_token');
			delete_option('flavio_api_domain');
			delete_option('flavio_plan_uuid');

			// Also remove site_domain if it exists
			delete_option('flavio_site_domain');

			// Clear the user info cache
			$this->cache_clear();

			return new WP_REST_Response([
				'success' => true,
				'message' => 'User disconnected successfully'
			], 200);

		} catch (Exception $e) {
			return new WP_REST_Response([
				'success' => false,
				'message' => 'Error disconnecting user: ' . $e->getMessage()
			], 500);
		}
	}
}
