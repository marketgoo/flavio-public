<?php

namespace Flavio;

use Exception;
use Flavio\Traits\Cache;
use WP_REST_Request;
use WP_REST_Response;

/**
 * SiteManager class for handling site update endpoint
 */
class SiteManager {

    use Cache;

	/**
	 * @var string Cache key for progress reporting
	 */
	private const CACHE_KEY = 'site_business_info';

    /**
     * @var ApiConnector
     */
    private $api_conector;

    /**
     * Constructor
     */
    public function __construct() {
        $this->api_conector = new ApiConnector();
        add_action('rest_api_init', [$this, 'register_routes']);
    }

    /**
     * Register REST API routes
     */
    public function register_routes(): void
    {
        register_rest_route('flavio/v1', '/site-business-info', [
            [
                'methods' => 'GET',
                'callback' => [$this, 'get_site_business_info'],
                'permission_callback' => [$this, 'check_admin_permissions'],
            ],
            [
                'methods' => 'POST',
                'callback' => [$this, 'update_site_business_info'],
                'permission_callback' => [$this, 'check_admin_permissions'],
            ]
        ]);
    }

    /**
     * Check if a user has admin permissions
     *
     * @return bool
     */
    public function check_admin_permissions(): bool
    {
        return current_user_can('manage_options');
    }

    /**
     * Get site business information (internal method)
     *
     * @return array|null Returns the site business info data or null on error
     */
    public function fetch_site_business_info(): ?array
    {
        try {
            // Get account ID from JWT
            $account_id = $this->api_conector->getUuid();

            if (empty($account_id)) {
                return null;
            }

            // Check cache first
            $cached_data = $this->cache_get(self::CACHE_KEY);

            if ($cached_data !== null) {
                return $cached_data;
            }

            // Build the API URI
            $uri = "/accounts/{$account_id}/site-business-info";

            // Call the external API
            $response = $this->api_conector->call(
                $uri,
                'GET',
                '', // no cache
                'en'
            );

            // Cache and return data only if successful
            if ($response->status >= 200 && $response->status < 300 && !empty($response->data)) {
                $this->cache_set(self::CACHE_KEY, $response->data, 7 * DAY_IN_SECONDS);
                return $response->data;
            }

            return null;

        } catch (Exception $e) {
            return null;
        }
    }

    /**
     * Get site business information via API (endpoint)
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function get_site_business_info(WP_REST_Request $request): WP_REST_Response
    {
        $data = $this->fetch_site_business_info();

        if ($data === null) {
            return new WP_REST_Response([
                'success' => false,
                'message' => 'Error getting site business info.'
            ], 500);
        }

        return new WP_REST_Response($data, 200);
    }

    /**
     * Update site information via API bridge
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function update_site_business_info(WP_REST_Request $request): WP_REST_Response
    {
        try {
            // Get all parameters from request
            $params = $request->get_params();

            // Get account ID from JWT
            $account_id = $this->api_conector->getUuid();

            if (empty($account_id)) {
                return new WP_REST_Response([
                    'success' => false,
                    'message' => 'Account ID not found. Please authenticate first.'
                ], 400);
            }

            // Build the API URI
            $uri = "/accounts/{$account_id}/site-business-info";

            // Call the external API with all received parameters
            $response = $this->api_conector->call(
                $uri,
                'POST',
                '', // no cache
                'en',
                $params
            );

            // Invalidate cache after successful update
            if ($response->status >= 200 && $response->status < 300) {
                $this->cache_clear(self::CACHE_KEY);
            }

            return $response;

        } catch (Exception $e) {
            return new WP_REST_Response([
                'success' => false,
                'message' => 'Error updating site: ' . $e->getMessage()
            ], 500);
        }
    }
}
