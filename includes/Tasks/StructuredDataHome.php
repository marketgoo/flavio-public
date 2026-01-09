<?php
declare(strict_types=1);

namespace Flavio\Tasks;

use WP_REST_Request;
use WP_REST_Response;

/**
 * StructuredDataHome class for generating structured data for homepage
 */
class StructuredDataHome {

	/**
	 * Constructor
	 */
	public function __construct() {
		add_action('rest_api_init', [$this, 'register_routes']);
		add_action('wp_head', [$this, 'output_structured_data']);
	}

	/**
	 * Register REST API routes
	 */
	public function register_routes(): void {
		register_rest_route('flavio/v1', '/tasks/structured-data-home', [
			[
				'methods' => 'GET',
				'callback' => [$this, 'get_structured_data'],
				'permission_callback' => [$this, 'check_admin_permissions'],
			],
			[
				'methods' => 'POST',
				'callback' => [$this, 'activate_structured_data'],
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
	 * Get structured data content (preview)
	 *
	 * @param WP_REST_Request $request
	 * @return WP_REST_Response
	 */
	public function get_structured_data(WP_REST_Request $request): WP_REST_Response {
		$structured_data = $this->build_structured_data();

		return new WP_REST_Response([
			'success' => true,
			'data' => $structured_data
		], 200);
	}

	/**
	 * Activate structured data for homepage
	 *
	 * @param WP_REST_Request $request
	 * @return WP_REST_Response
	 */
	public function activate_structured_data(WP_REST_Request $request): WP_REST_Response {
		// Update option to activate structured data
		update_option('flavio_structured_data_home_active', true);

		return new WP_REST_Response([
			'success' => true,
			'message' => 'Structured data activated successfully for homepage.'
		], 200);
	}

	/**
	 * Build structured data for homepage
	 *
	 * @return array
	 */
	private function build_structured_data(): array {
		$site_name = get_bloginfo('name');
		$site_description = get_bloginfo('description');
		$site_url = home_url('/');
		$logo_url = get_site_icon_url();

		// Organization Schema
		$organization = [
			'@context' => 'https://schema.org',
			'@type' => 'Organization',
			'name' => $site_name,
			'url' => $site_url,
			'description' => $site_description,
		];

		if ($logo_url) {
			$organization['logo'] = [
				'@type' => 'ImageObject',
				'url' => $logo_url,
			];
		}

		// WebSite Schema
		$website = [
			'@context' => 'https://schema.org',
			'@type' => 'WebSite',
			'name' => $site_name,
			'url' => $site_url,
			'description' => $site_description,
			'potentialAction' => [
				'@type' => 'SearchAction',
				'target' => [
					'@type' => 'EntryPoint',
					'urlTemplate' => $site_url . '?s={search_term_string}',
				],
				'query-input' => 'required name=search_term_string',
			],
		];

		return [
			'organization' => $organization,
			'website' => $website,
		];
	}

	/**
	 * Output structured data in the head if active and is homepage
	 */
	public function output_structured_data(): void {
		// Only output on homepage
		if (!is_front_page()) {
			return;
		}

		// Check if structured data is active
		if (!get_option('flavio_structured_data_home_active', false)) {
			return;
		}

		$structured_data = $this->build_structured_data();

		// Output Organization Schema
		if (isset($structured_data['organization'])) {
			echo '<script type="application/ld+json">' . "\n";
			echo wp_json_encode($structured_data['organization']);
			echo "\n" . '</script>' . "\n";
		}

		// Output WebSite Schema
		if (isset($structured_data['website'])) {
			echo '<script type="application/ld+json">' . "\n";
			echo wp_json_encode($structured_data['website']);
			echo "\n" . '</script>' . "\n";
		}
	}
}
