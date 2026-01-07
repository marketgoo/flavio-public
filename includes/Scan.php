<?php

namespace Flavio;

use Exception;
use WP_REST_Request;
use WP_REST_Response;

/**
 * Scan class for handling scan endpoint
 */
class Scan {

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
        register_rest_route('flavio/v1', '/scan', [
            'methods' => 'POST',
            'callback' => [$this, 'post_scan'],
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
     * Post scan via API (endpoint)
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function post_scan(WP_REST_Request $request): WP_REST_Response
    {
        try {
            $account_id = $this->api_conector->getUuid();

            if (empty($account_id)) {
                return new WP_REST_Response([
                    'success' => false,
                    'message' => 'Account ID not found. Please authenticate first.'
                ], 400);
            }

            $params = $request->get_params();
            $uri = "/accounts/{$account_id}/scan";

            // Call the external API with POST method
            $response = $this->api_conector->call(
                $uri,
                'POST',
                '', // no cache
                'en',
                $params
            );

            // Return the response as is
            return $response;

        } catch (Exception $e) {
            return new WP_REST_Response([
                'success' => false,
                'message' => 'Error posting scan: ' . $e->getMessage()
            ], 500);
        }
    }
}
