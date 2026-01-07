<?php
declare(strict_types=1);

namespace Flavio;

use Exception;
use Flavio\Traits\Cache;

/**
 * CTAs class for handling CTAs information
 */
class CTAs {
	use Cache;

	/**
	 * @var ApiConnector API connector instance
	 */
	protected ApiConnector $api_connector;

	/**
	 * @var string Cache key for CTAs information
	 */
	private const CACHE_KEY = 'ctas_info';

	/**
	 * @var int Cache duration in seconds (30 min)
	 */
	private const CACHE_DURATION = 1800;

	/**
	 * Constructor
	 */
	public function __construct() {
		$this->api_connector = new ApiConnector();
	}

	/**
	 * Get CTAs information from the API
	 *
	 * Fetches CTAs info from api/accounts/:account_id/ctas endpoint
	 * Results are cached for 30 minutes
	 *
	 * @return array CTAs information or empty array on error
	 */
	public function get(): array {
		try {
			$account_id = $this->api_connector->getUuid();

			if (empty($account_id)) {
				// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log -- Intentional error logging
				error_log('Flavio: No account ID found');
				return [];
			}

			// Check cache first
			$cached_data = $this->cache_get(self::CACHE_KEY);
			if (false && $cached_data !== null) {
				return $cached_data;
			}

			// Call the API
			$uri = "/accounts/{$account_id}/ctas";
			$response = $this->api_connector->call($uri, 'GET');

			// Check if the response was successful
			if (!isset($response->data['success']) || !$response->data['success']) {
				// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log -- Intentional error logging
				error_log('Flavio: Failed to fetch CTAs info');
				return [];
			}

			// Cache the response
			$ctas_data = $response->data['data'] ?? [];
			$this->cache_set(self::CACHE_KEY, $ctas_data, self::CACHE_DURATION);

			return $ctas_data;

		} catch (Exception $e) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log -- Intentional error logging
			error_log('Flavio: Error fetching CTAs info: ' . $e->getMessage());
			return [];
		}
	}

	/**
	 * Clear cached CTAs information
	 *
	 * @return void
	 */
	public function clear_cache(): void {
		$this->cache_clear(self::CACHE_KEY);
	}
}
