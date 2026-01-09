<?php

namespace Flavio;

use Exception;
use WP_REST_Request;
use WP_REST_Response;

/**
 * Signature class for handling signature and token endpoints
 */
class Signature
{

    /**
     * Constructor
     */
    public function __construct()
    {
        add_action('rest_api_init', [$this, 'register_routes']);
    }

    /**
     * Register REST API routes
     */
    public function register_routes(): void
    {
        // Private endpoint for signature generation - requires admin authentication
        register_rest_route('flavio/v1', '/signature', [
            'methods' => 'POST',
            'callback' => [$this, 'generate_signature'],
            'permission_callback' => [$this, 'check_admin_permissions'],
        ]);

        // Private endpoint to check authentication status
        register_rest_route('flavio/v1', '/status', [
            'methods' => 'GET',
            'callback' => [$this, 'check_auth_status'],
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
     * Generate and store a random signature
     *
     * Also generates a nonce for the OAuth callback verification.
     *
     * @param WP_REST_Request $request
     * @return \WP_REST_Response
     */
    public function generate_signature(WP_REST_Request $request): WP_REST_Response
    {
        try {
            // Generate a random token (signature)
            $signature = wp_generate_password(32, false, false);

            // Store the signature in wp_options
            update_option('flavio_signature', $signature);

            // Generate a nonce for the OAuth callback
            // This nonce will be verified when the user returns from the external auth server
            $callback_nonce = wp_create_nonce('flavio_oauth_callback');

            return new \WP_REST_Response([
                'success' => true,
                'signature' => $signature,
                'callback_nonce' => $callback_nonce
            ], 200);
        } catch (Exception $e) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Error generating signature: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check if the plugin is authenticated with Flavio
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function check_auth_status(WP_REST_Request $request): WP_REST_Response
    {
        $token = get_option('flavio_token');
        $api_domain = get_option('flavio_api_domain');
        $plan_uuid = get_option('flavio_plan_uuid');

        $is_authenticated = !empty($token) && !empty($api_domain) && !empty($plan_uuid);

        return new \WP_REST_Response([
            'authenticated' => $is_authenticated,
        ], 200);
    }
}
