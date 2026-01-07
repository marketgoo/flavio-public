<?php
declare(strict_types=1);

namespace Flavio\Tasks;

use Flavio\Traits\Filesystem;
use WP_REST_Request;
use WP_REST_Response;
use WP_Query;

/**
 * Sitemap class for generating sitemap.xml
 */
class Sitemap {
	use Filesystem;

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
		register_rest_route('flavio/v1', '/tasks/sitemap', [
			[
				'methods' => 'GET',
				'callback' => [$this, 'get_sitemap_content'],
				'permission_callback' => [$this, 'check_admin_permissions'],
			],
			[
				'methods' => 'POST',
				'callback' => [$this, 'create_sitemap'],
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
	 * Get sitemap content (preview)
	 *
	 * @param WP_REST_Request $request
	 * @return WP_REST_Response
	 */
	public function get_sitemap_content(WP_REST_Request $request): WP_REST_Response {
		$sitemap_content = $this->build_sitemap_xml();

		return new WP_REST_Response([
			'success' => true,
			'content' => $sitemap_content
		], 200);
	}

	/**
	 * Create sitemap.xml file
	 *
	 * @param WP_REST_Request $request
	 * @return WP_REST_Response
	 */
	public function create_sitemap(WP_REST_Request $request): WP_REST_Response {
		// Get WordPress root directory
		$wordpress_root = ABSPATH;

		// Check if we have write permissions in WordPress root
		if (!$this->fs_is_writable($wordpress_root)) {
			return new WP_REST_Response([
				'success' => false,
				'message' => 'Write permissions are required in the WordPress root directory to complete this task.'
			], 200);
		}

		// Generate sitemap content
		$sitemap_content = $this->build_sitemap_xml();

		// Write sitemap.xml file
		$sitemap_path = $wordpress_root . 'sitemap.xml';
		$result = $this->fs_put_contents($sitemap_path, $sitemap_content);

		if ($result === false) {
			return new WP_REST_Response([
				'success' => false,
				'message' => 'Failed to write sitemap.xml file.'
			], 500);
		}

		return new WP_REST_Response([
			'success' => true,
			'message' => 'Sitemap generated successfully.',
			'file' => 'sitemap.xml'
		], 200);
	}

	/**
	 * Build sitemap XML content
	 *
	 * @return string
	 */
	private function build_sitemap_xml(): string {
		$xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
		$xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

		// Add homepage
		$xml .= $this->add_url_entry(home_url('/'), get_lastpostmodified('gmt'), '1.0', 'daily');

		// Add posts
		$posts = get_posts([
			'post_type' => 'post',
			'post_status' => 'publish',
			'numberposts' => -1,
			'orderby' => 'modified',
			'order' => 'DESC'
		]);

		foreach ($posts as $post) {
			$xml .= $this->add_url_entry(
				get_permalink($post->ID),
				$post->post_modified_gmt,
				'0.8',
				'weekly'
			);
		}

		// Add pages
		$pages = get_pages([
			'post_status' => 'publish'
		]);

		foreach ($pages as $page) {
			$xml .= $this->add_url_entry(
				get_permalink($page->ID),
				$page->post_modified_gmt,
				'0.6',
				'monthly'
			);
		}

		// Add custom post types
		$post_types = get_post_types([
			'public' => true,
			'_builtin' => false
		], 'names');

		foreach ($post_types as $post_type) {
			$custom_posts = get_posts([
				'post_type' => $post_type,
				'post_status' => 'publish',
				'numberposts' => -1
			]);

			foreach ($custom_posts as $custom_post) {
				$xml .= $this->add_url_entry(
					get_permalink($custom_post->ID),
					$custom_post->post_modified_gmt,
					'0.7',
					'weekly'
				);
			}
		}

		// Add categories
		$categories = get_categories([
			'hide_empty' => true
		]);

		foreach ($categories as $category) {
			$xml .= $this->add_url_entry(
				get_category_link($category->term_id),
				null,
				'0.5',
				'weekly'
			);
		}

		// Add tags
		$tags = get_tags([
			'hide_empty' => true
		]);

		foreach ($tags as $tag) {
			$xml .= $this->add_url_entry(
				get_tag_link($tag->term_id),
				null,
				'0.4',
				'monthly'
			);
		}

		$xml .= '</urlset>';

		return $xml;
	}

	/**
	 * Add URL entry to sitemap
	 *
	 * @param string $url
	 * @param mixed $lastmod
	 * @param string $priority
	 * @param string $changefreq
	 * @return string
	 */
	private function add_url_entry(string $url, mixed $lastmod, string $priority, string $changefreq): string {
		$xml = "\t<url>\n";
		$xml .= "\t\t<loc>" . esc_url($url) . "</loc>\n";

		if ($lastmod) {
			$xml .= "\t\t<lastmod>" . gmdate('c', strtotime($lastmod)) . "</lastmod>\n";
		}

		$xml .= "\t\t<priority>" . $priority . "</priority>\n";
		$xml .= "\t\t<changefreq>" . $changefreq . "</changefreq>\n";
		$xml .= "\t</url>\n";

		return $xml;
	}
}
