<?php
declare(strict_types=1);

namespace Flavio\Tasks;

use WP_REST_Request;
use WP_REST_Response;

/**
 * FriendlyUrl class for handling permalink structure
 */
class FriendlyUrl {

	/**
	 * Constructor
	 */
	public function __construct() {
		add_action('rest_api_init', [$this, 'register_routes']);
	}

	/**
	 * Register REST API routes
	 */
	public function register_routes(): void {
		register_rest_route('flavio/v1', '/tasks/friendlyurl', [
			[
				'methods' => 'GET',
				'callback' => [$this, 'get_permalink_structure'],
				'permission_callback' => '__return_true', // Public endpoint
			],
			[
				'methods' => 'POST',
				'callback' => [$this, 'fix_permalink_structure'],
				'permission_callback' => [$this, 'check_admin_permissions'],
			],
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
	 * Get current permalink structure
	 *
	 * @param WP_REST_Request $request
	 * @return WP_REST_Response
	 */
	public function get_permalink_structure(WP_REST_Request $request): WP_REST_Response {
		try {
			$permalink_structure = get_option('permalink_structure');

			return new WP_REST_Response([
				'success' => true,
				'data' => [
					'permalink_structure' => $permalink_structure ?: ''
				]
			], 200);

		} catch (\Exception $e) {
			return new WP_REST_Response([
				'success' => false,
				'message' => 'Error getting permalink structure: ' . $e->getMessage()
			], 500);
		}
	}

	/**
	 * Set permalink structure to /%postname%/
	 *
	 * @param WP_REST_Request $request
	 * @return WP_REST_Response
	 */
	public function fix_permalink_structure(WP_REST_Request $request): WP_REST_Response {
		try {
			// Set permalink structure to postname
			update_option('permalink_structure', '/%postname%/');

			// Flush rewrite rules to apply changes
			flush_rewrite_rules();

			return new WP_REST_Response([
				'success' => true,
				'message' => 'Permalink structure updated to postname successfully'
			], 200);

		} catch (\Exception $e) {
			return new WP_REST_Response([
				'success' => false,
				'message' => 'Error updating permalink structure: ' . $e->getMessage()
			], 500);
		}
	}
}
