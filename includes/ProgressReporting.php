<?php

namespace Flavio;

use Exception;
use Flavio\Traits\Cache;
use WP_REST_Request;
use WP_REST_Response;

/**
 * ProgressReporting class for handling progress reporting endpoint
 */
class ProgressReporting {
    use Cache;

    /**
     * @var ApiConnector
     */
    private ApiConnector $api_connector;

    /**
     * @var string Cache key for progress reporting
     */
    private const CACHE_KEY = 'progress_reporting';

    /**
     * @var int Cache duration in seconds (48 hours)
     */
    private const CACHE_DURATION = 172800;

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
    public function register_routes(): void
    {
        register_rest_route('flavio/v1', '/progress-reporting', [
            'methods' => 'GET',
            'callback' => [$this, 'get_progress_reporting'],
            'permission_callback' => [$this, 'check_admin_permissions'],
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
     * Get progress reporting via API bridge
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function get_progress_reporting(WP_REST_Request $request): WP_REST_Response
    {
        try {
            // Get account ID from JWT
            $account_id = $this->api_connector->getUuid();

            if (empty($account_id)) {
                return new WP_REST_Response([
                    'success' => false,
                    'message' => 'Account ID not found. Please authenticate first.'
                ], 400);
            }

            // Check cache first
	        $cached = $this->cache_get(self::CACHE_KEY);

            if ($cached !== null) {
                return new WP_REST_Response(array_merge(['success' => true], $cached), 200);
            }

            // Build the API URI
            $uri = "/accounts/{$account_id}/progress-reporting";

            // Call the external API without cache (we handle cache manually)
            $response = $this->api_connector->call(
                $uri,
                'GET',
                '', // no cache in ApiConnector
                'en',
                [] // empty data
            );

            // If successful, add the updated date and cache the response
            if ($response->status === 200 && isset($response->data)) {
                $response->data['updated'] = time();
                $this->cache_set(self::CACHE_KEY, $response->data, self::CACHE_DURATION);
            }

            return $response;

        } catch (Exception $e) {
            return new WP_REST_Response([
                'success' => false,
                'message' => 'Error getting progress reporting: ' . $e->getMessage()
            ], 500);
        }
    }
}
