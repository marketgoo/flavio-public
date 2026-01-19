<?php

namespace Flavio;

/**
 * AssetsManager class for handling CSS and JS loading
 */
class AssetsManager
{

	const DEFAULT_VITE_SERV = 'http://localhost:5173';

	/**
	 * Constructor
	 */
	public function __construct()
	{
		add_action('admin_enqueue_scripts', [$this, 'enqueue_assets']);
	}

	public function enqueue_assets($hook)
	{
		$allowed_hooks = [
			'toplevel_page_flavio-page',
			'admin_page_flavio-goal-profile',
		];

		if (!in_array($hook, $allowed_hooks)) {
			return;
		}

		// Always enqueue WordPress admin overrides CSS
		$admin_css_path = FLAVIO_PLUGIN_NAME_PATH . 'css/admin-overrides.css';
		if (file_exists($admin_css_path)) {
			wp_enqueue_style(
				'flavio-admin-overrides',
				FLAVIO_PLUGIN_NAME_URL . 'css/admin-overrides.css',
				[],
				filemtime($admin_css_path)
			);
		}

		// If a build exists, we use it. Else, we try to load dev mode.
		if ($this->build_is_done()) {
			$this->enqueue_css_files();
			$this->enqueue_js_files();
		} else {
			wp_enqueue_script(
				'flavio-vite',
				self::DEFAULT_VITE_SERV . '/@vite/client',
				[],
				null,
				false
			);

			wp_enqueue_script(
				'flavio-app',
				self::DEFAULT_VITE_SERV . '/src/main.jsx',
				['flavio-vite'],
				null,
				false
			);

			// Localize script data for dev mode (attach to 'flavio-app')
			$this->localize_script_data('flavio-app');

			// Add the type="module" attribute to the script tags. necessary for vite stuff.
			// Wordpress doesn't allow to add attributes to script tags.
			add_filter('script_loader_tag', function ($tag, $handle) {
				if (in_array($handle, ['flavio-vite', 'flavio-app'], true)) {
					return str_replace('<script ', '<script type="module" ', $tag);
				}
				return $tag;
			}, 10, 2);
		}
	}

	/**
	 * Localize script data for the React app
	 */
	private function localize_script_data($handle)
	{
		$api_base = rest_url('flavio/v1/');

		// Get user information
		$user = new User();

		// Get site business information
		$site_manager = new SiteManager();
		$site_info = $site_manager->fetch_site_business_info();

		// Get CTAs information
		$ctas = new CTAs();
		$ctas_info = $ctas->get();

		// Token for authenticated URLs
		$flavio_token = get_option('flavio_token');

		$script_data = [
			'nonce' => wp_create_nonce('wp_rest'),

			// Current page identifier for React routing
			'currentPage' => $this->get_current_page(),

			// Base URLs
			'apiUrl' => $api_base,
			'siteUrl' => get_site_url(),
			'adminUrl' => admin_url(),
			'pluginUrl' => FLAVIO_PLUGIN_NAME_URL,

			// External URLs
			'flavioLoginUrl' => FLAVIO_LOGIN_URL,

			// Flavio token
			'flavioToken' => $flavio_token,

			// Pre-built authenticated URLs for Copilot navigation
			'flavioAuthenticatedUrls' => [
				'connections' => $this->build_authenticated_url($flavio_token, '/growth/connections'),
				'manageSubscription' => $this->build_authenticated_url($flavio_token, '/growth/manage-subscription?nextUrl=' . urlencode(admin_url('admin.php?page=flavio-page'))),
				'account' => $this->build_authenticated_url($flavio_token, '/growth/account'),
			],

			// Admin pages
			'adminPageSlug' => 'flavio-page',
			'tokenPageSlug' => 'flavio-code-page',
			'goalProfilePageSlug' => 'flavio-goal-profile',
			'adminPageUrl' => admin_url('admin.php?page=flavio-page'),
			'tokenPageUrl' => admin_url('admin.php?page=flavio-code-page'),
			'goalProfilePageUrl' => admin_url('admin.php?page=flavio-goal-profile'),

			// API Endpoints (complete URLs)
			'endpoints' => [
				'status' => rest_url('flavio/v1/status'),
				'signature' => rest_url('flavio/v1/signature'),
				'activate' => rest_url('flavio/v1/activate'),
			],

			// User information
			'user' => $user->info(),

			// Plan information
			'planInfo' => $user->trial_info(),

			// Site business information
			'siteInfo' => $site_info,

			// CTAs information
			'ctas' => $ctas_info,

			// The dealer has users.
			'manageAccounts' => true,

			// Error monitoring configuration
			'errorMonitoring' => [
				'dsn' => FLAVIO_SENTRY_DSN,
				'environment' => FLAVIO_SENTRY_ENV,
			],

			// Analytics configuration
			'analytics' => [
				'key' => FLAVIO_POSTHOG_KEY,
				'host' => FLAVIO_POSTHOG_HOST,
			],
		];

		wp_localize_script($handle, 'flavioData', $script_data);
	}

	/**
	 * Enqueue all CSS files from js/dist directory
	 */
	private function enqueue_css_files()
	{
		$assets_path = FLAVIO_PLUGIN_NAME_PATH . 'js/dist/assets';

		// Find all CSS files in the dist directory
		$css_files = $this->find_files_by_extension($assets_path, 'css');
		foreach ($css_files as $css_file) {
			$handle = 'flavio-' . sanitize_title(basename($css_file, '.css'));
			$file = FLAVIO_PLUGIN_NAME_URL . 'js/dist/assets/' . basename($css_file);
			wp_enqueue_style($handle, $file, [], filemtime($css_file));
		}
	}

	/**
	 * Enqueue all JS files from js/dist directory
	 */
	private function enqueue_js_files()
	{
		$assets_path = FLAVIO_PLUGIN_NAME_PATH . 'js/dist/assets';

		// Find all JS files in the dist directory
		$js_files = $this->find_files_by_extension($assets_path, 'js');

		foreach ($js_files as $js_file) {
			$handle = 'flavio-' . sanitize_title(basename($js_file, '.js'));
			$file = FLAVIO_PLUGIN_NAME_URL . 'js/dist/assets/' . basename($js_file);
			wp_enqueue_script($handle, $file, [], filemtime($js_file), true);

			// Localize script data for all JS files (production mode)
			$this->localize_script_data($handle);
		}

		// Add type="module" attribute to all Flavio scripts (production mode)
		add_filter('script_loader_tag', function ($tag, $handle) {
			if (strpos($handle, 'flavio-') === 0) {
				return str_replace('<script ', '<script type="module" ', $tag);
			}
			return $tag;
		}, 10, 2);
	}

	/**
	 * Find files by extension recursively in a directory
	 *
	 * @param string $directory The directory to search
	 * @param string $extension The file extension to look for (without dot)
	 * @return array Array of file paths
	 */
	private function find_files_by_extension($directory, $extension)
	{
		$files = [];

		if (!is_dir($directory)) {
			return $files;
		}

		$iterator = new \RecursiveIteratorIterator(
			new \RecursiveDirectoryIterator($directory, \RecursiveDirectoryIterator::SKIP_DOTS)
		);

		foreach ($iterator as $file) {
			if ($file->isFile() && $file->getExtension() === $extension) {
				$files[] = $file->getPathname();
			}
		}

		return $files;
	}

	private function build_is_done()
	{
		$distDir = FLAVIO_PLUGIN_NAME_PATH . '/js/dist';
		return is_dir($distDir);
	}

	/**
	 * Build authenticated URL with bearer token and next_url
	 *
	 * @param string $token Bearer token
	 * @param string $path Target path (e.g., '/growth/connections')
	 * @return string Complete authenticated URL
	 */
	private function build_authenticated_url($token, $path)
	{
		return add_query_arg([
			'bearer' => $token,
			'next_url' => $path,
		], FLAVIO_LOGIN_URL);
	}

	/**
	 * Get current page identifier for React routing
	 *
	 * @return string Page identifier ('default', 'goal-profile', 'page-optimization', etc.)
	 */
	private function get_current_page()
	{
		$screen = get_current_screen();

		// Check for goal-profile page
		if ($screen && $screen->id === 'admin_page_flavio-goal-profile') {
			return 'goal-profile';
		}

		// Check for subpage parameter (used for SPA routing within main Flavio page)
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		if (isset($_GET['subpage'])) {
			// phpcs:ignore WordPress.Security.NonceVerification.Recommended
			$subpage = sanitize_text_field(wp_unslash($_GET['subpage']));
			$allowed_subpages = ['page-optimization'];

			if (in_array($subpage, $allowed_subpages, true)) {
				return $subpage;
			}
		}

		return 'default';
	}
}
