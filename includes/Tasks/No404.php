<?php
declare(strict_types=1);

namespace Flavio\Tasks;

use Flavio\Data;
use WP_REST_Request;
use WP_REST_Response;

/**
 * No404 class for handling 404 errors
 */
class No404 {

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
	}

	/**
	 * Register REST API routes
	 */
	public function register_routes(): void {
		register_rest_route('flavio/v1', '/tasks/no404', [
			[
				'methods' => 'GET',
				'callback' => [$this, 'get_broken_links'],
				'permission_callback' => [$this, 'check_admin_permissions'],
			],
			[
				'methods' => 'POST',
				'callback' => [$this, 'fix_broken_links'],
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
	 * Get broken links from no404 task
	 *
	 * @param WP_REST_Request $request
	 * @return WP_REST_Response
	 */
	public function get_broken_links(WP_REST_Request $request): WP_REST_Response {
		try {
			// Get task data
			$task = $this->data->getTask('no404');

			if (!$task) {
				return new WP_REST_Response([
					'success' => false,
					'message' => 'Task no404 not found'
				], 404);
			}

			// Extract broken links from metadata
			$broken_links = $this->extract_broken_links($task);

			return new WP_REST_Response([
				'success' => true,
				'data' => $broken_links
			], 200);

		} catch (\Exception $e) {
			return new WP_REST_Response([
				'success' => false,
				'message' => 'Error getting broken links: ' . $e->getMessage()
			], 500);
		}
	}

	/**
	 * Fix broken links from no404 task
	 *
	 * @param WP_REST_Request $request
	 * @return WP_REST_Response
	 */
	public function fix_broken_links(WP_REST_Request $request): WP_REST_Response {
		try {
			// Get task data
			$task = $this->data->getTask('no404');

			if (!$task) {
				return new WP_REST_Response([
					'success' => false,
					'message' => 'Task no404 not found'
				], 404);
			}

			// Extract broken links from metadata
			$broken_links = $this->extract_broken_links($task);

			if (empty($broken_links)) {
				return new WP_REST_Response([
					'success' => true,
					'message' => 'No broken links to fix',
					'fixed' => 0
				], 200);
			}

			$fixed_count = 0;
			$errors = [];

			// Group broken links by page_url for efficient processing
			$links_by_page = [];
			foreach ($broken_links as $link) {
				$page_url = $link['page_url'];
				if (!isset($links_by_page[$page_url])) {
					$links_by_page[$page_url] = [];
				}
				$links_by_page[$page_url][] = $link['broken_link_url'];
			}

			// Process each page
			foreach ($links_by_page as $page_url => $broken_urls) {
				$post_id = url_to_postid($page_url);

				if (!$post_id) {
					$errors[] = "Could not find post/page for URL: {$page_url}";
					continue;
				}

				$post = get_post($post_id);

				if (!$post) {
					$errors[] = "Could not retrieve post/page with ID: {$post_id}";
					continue;
				}

				$content = $post->post_content;
				$original_content = $content;

				// Remove each broken link from content
				foreach ($broken_urls as $broken_url) {
					$content = $this->remove_link_from_content($content, $broken_url);
				}

				// Update post if content changed
				if ($content !== $original_content) {
					$result = wp_update_post([
						'ID' => $post_id,
						'post_content' => $content
					]);

					if (is_wp_error($result)) {
						$errors[] = "Failed to update post {$post_id}: " . $result->get_error_message();
					} else {
						$fixed_count++;
					}
				}
			}

			return new WP_REST_Response([
				'success' => true,
				'message' => "Fixed broken links in {$fixed_count} pages",
				'fixed' => $fixed_count,
				'errors' => $errors
			], 200);

		} catch (\Exception $e) {
			return new WP_REST_Response([
				'success' => false,
				'message' => 'Error fixing broken links: ' . $e->getMessage()
			], 500);
		}
	}

	/**
	 * Remove a specific link from HTML content while preserving the link text
	 *
	 * @param string $content
	 * @param string $broken_url
	 * @return string
	 */
	private function remove_link_from_content(string $content, string $broken_url): string {
		// Escape special regex characters in the URL
		$escaped_url = preg_quote($broken_url, '/');

		// Pattern to match <a> tags with this specific href
		// This will capture the link text and replace the entire <a> tag with just the text
		$pattern = '/<a[^>]*\s+href=["\']' . $escaped_url . '["\'][^>]*>(.*?)<\/a>/i';

		// Replace the <a> tag with just the link text (captured group $1)
		$content = preg_replace($pattern, '$1', $content);

		return $content;
	}

	/**
	 * Extract broken links from task metadata
	 *
	 * @param array $task
	 * @return array
	 */
	private function extract_broken_links(array $task): array {
		$broken_links = [];

		// Check if metadata exists
		if (!isset($task['metadata']) || !is_array($task['metadata'])) {
			return $broken_links;
		}

		$metadata = $task['metadata'];

		// Check if pending_items exists
		if (!isset($metadata['pending_items']) || !is_array($metadata['pending_items'])) {
			return $broken_links;
		}

		// Iterate through pending items (pages)
		foreach ($metadata['pending_items'] as $page) {
			if (!isset($page['url']) || !isset($page['pending_items']) || !is_array($page['pending_items'])) {
				continue;
			}

			$page_url = $page['url'];
			$page_title = $page['title'] ?? '';

			// Iterate through broken links in this page
			foreach ($page['pending_items'] as $broken_link) {
				if (!isset($broken_link['url']) || !isset($broken_link['type'])) {
					continue;
				}

				$broken_links[] = [
					'page_url' => $page_url,
					'page_title' => $page_title,
					'broken_link_url' => $broken_link['url'],
				];
			}
		}

		return $broken_links;
	}
}
