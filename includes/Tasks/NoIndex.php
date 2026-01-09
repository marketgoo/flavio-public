<?php
declare(strict_types=1);

namespace Flavio\Tasks;

use Flavio\Data;
use WP_REST_Request;
use WP_REST_Response;

/**
 * NoIndex class for handling noindex meta tags
 */
class NoIndex {

	/**
	 * @var Data
	 */
	private $data;

	/**
	 * Constructor
	 */
	public function __construct() {
		$this->data = new Data();
		add_action('rest_api_init', [$this, 'register_routes']);

		// Register filter if it has been activated before
		if (get_option('flavio_noindex_filter_enabled', false)) {
			add_filter('wp_robots', [$this, 'force_index_wp_robots'], 999);
			add_action('wp_head', [$this, 'remove_noindex_actions'], 1);
		}
	}

	/**
	 * Register REST API routes
	 */
	public function register_routes(): void {
		register_rest_route('flavio/v1', '/tasks/noindex', [
			[
				'methods' => 'GET',
				'callback' => [$this, 'get_noindex_pages'],
				'permission_callback' => [$this, 'check_admin_permissions'],
			],
			[
				'methods' => 'POST',
				'callback' => [$this, 'fix_noindex_pages'],
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
	 * Get pages with noindex from noindex task
	 *
	 * @param WP_REST_Request $request
	 * @return WP_REST_Response
	 */
	public function get_noindex_pages(WP_REST_Request $request): WP_REST_Response {
		try {
			// Get task data
			$task = $this->data->getTask('noindex');

			if (!$task) {
				return new WP_REST_Response([
					'success' => false,
					'message' => 'Task noindex not found'
				], 404);
			}

			// Extract noindex pages from metadata
			$noindex_pages = $this->extract_noindex_pages($task);

			return new WP_REST_Response([
				'success' => true,
				'data' => $noindex_pages
			], 200);

		} catch (\Exception $e) {
			return new WP_REST_Response([
				'success' => false,
				'message' => 'Error getting noindex pages: ' . $e->getMessage()
			], 500);
		}
	}

	/**
	 * Fix noindex pages from noindex task
	 *
	 * @param WP_REST_Request $request
	 * @return WP_REST_Response
	 */
	public function fix_noindex_pages(WP_REST_Request $request): WP_REST_Response {
		try {
			// Enable the noindex filter
			update_option('flavio_noindex_filter_enabled', true, false);

			return new WP_REST_Response([
				'success' => true,
				'message' => 'Noindex filter enabled successfully'
			], 200);

		} catch (\Exception $e) {
			return new WP_REST_Response([
				'success' => false,
				'message' => 'Error enabling noindex filter: ' . $e->getMessage()
			], 500);
		}
	}

	/**
	 * Force index for WordPress core robots
	 *
	 * @param array $robots
	 * @return array
	 */
	public function force_index_wp_robots(array $robots): array {
		$robots['noindex'] = false;
		$robots['nofollow'] = false;
		return $robots;
	}

	/**
	 * Remove actions that add noindex meta tags and inject our own robots tag
	 */
	public function remove_noindex_actions(): void {
		// Remove WordPress core noindex action
		remove_action('wp_head', 'wp_robots', 1);
		remove_action('wp_head', 'noindex', 1);

		// Remove common actions that might add noindex
		remove_action('wp_head', 'wp_no_robots');

		// Add our own robots meta tag that forces indexing
		// This runs at priority 1 to ensure it's added early
		add_action('wp_head', [$this, 'print_robots_meta_tag'], 1);
	}

	/**
	 * Print a robots meta tag that forces indexing
	 */
	public function print_robots_meta_tag(): void {
		echo '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />' . "\n";
	}

	/**
	 * Extract noindex pages from task metadata
	 *
	 * @param array $task
	 * @return array
	 */
	private function extract_noindex_pages(array $task): array {
		$noindex_pages = [];

		// Check if metadata exists
		if (!isset($task['metadata']) || !is_array($task['metadata'])) {
			return $noindex_pages;
		}

		$metadata = $task['metadata'];

		// Check if pending_items exists
		if (!isset($metadata['pending_items']) || !is_array($metadata['pending_items'])) {
			return $noindex_pages;
		}

		// Iterate through pending items (pages)
		foreach ($metadata['pending_items'] as $page) {
			if (!isset($page['url'])) {
				continue;
			}

			$noindex_pages[] = [
				'page_url' => $page['url'],
				'page_title' => $page['title'] ?? '',
			];
		}

		return $noindex_pages;
	}
}
