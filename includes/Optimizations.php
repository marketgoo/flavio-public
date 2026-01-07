<?php

namespace Flavio;

use Exception;
use WP_REST_Request;
use WP_REST_Response;

/**
 * Optimizations class for handling site optimizations
 */
class Optimizations {

    /**
     * Constructor
     */
    public function __construct() {
        add_action('rest_api_init', [$this, 'register_routes']);
    }

    /**
     * Register REST API routes
     */
    public function register_routes(): void
    {
        register_rest_route('flavio/v1', '/optimizations/site-basic', [
            'methods' => 'POST',
            'callback' => [$this, 'update_site_basic'],
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
     * Update site title and tagline
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function update_site_basic(WP_REST_Request $request): WP_REST_Response
    {
        try {
            $params = $request->get_json_params();

            // Get title and tagline from request body
            $title = isset($params['title']) ? sanitize_text_field($params['title']) : '';
            $tagline = isset($params['tagline']) ? sanitize_text_field($params['tagline']) : '';

            // Validate that at least one parameter is provided
            if (empty($title) && empty($tagline)) {
                return new WP_REST_Response([
                    'success' => false,
                    'message' => 'At least one parameter (title or tagline) is required.'
                ], 400);
            }

            $updated = [];

            // Update site title if provided
            if (!empty($title)) {
                $result = update_option('blogname', $title);
                if ($result !== false) {
                    $updated['title'] = $title;
                }
            }

            // Update site tagline if provided
            if (!empty($tagline)) {
                $result = update_option('blogdescription', $tagline);
                if ($result !== false) {
                    $updated['tagline'] = $tagline;
                }
            }

            return new WP_REST_Response([
                'success' => true,
                'message' => 'Site basic information updated successfully.',
                'updated' => $updated
            ], 200);

        } catch (Exception $e) {
            return new WP_REST_Response([
                'success' => false,
                'message' => 'Error updating site basic information: ' . $e->getMessage()
            ], 500);
        }
    }
}
