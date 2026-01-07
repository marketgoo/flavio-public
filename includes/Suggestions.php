<?php

namespace Flavio;

use Exception;
use WP_REST_Request;
use WP_REST_Response;

/**
 * Suggestions class for handling AI suggestions endpoint
 */
class Suggestions {

    /**
     * @var ApiConnector
     */
    private $api_connector;

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
        register_rest_route('flavio/v1', '/ai-suggestions/site-basic', [
            'methods' => 'GET',
            'callback' => [$this, 'get_ai_suggestions_site_basics'],
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
     * Get AI suggestions for site
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function get_ai_suggestions_site_basics(WP_REST_Request $request): WP_REST_Response
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

            // Build the API URI
            $uri = "/accounts/{$account_id}/ai-suggestions/site-basic";

            // Call the external API
            $response = $this->api_connector->call(
                $uri,
                'GET',
                '', // no cache
                'en',
                [] // empty data
            );

            return $response;

        } catch (Exception $e) {
            return new WP_REST_Response([
                'success' => false,
                'message' => 'Error getting AI suggestions: ' . $e->getMessage()
            ], 500);
        }
    }
}
