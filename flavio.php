<?php

/**
 * Plugin Name: Flavio
 * Plugin URI: 
 * Description: Make your life easy and grow with us.
 * Version: 1.0.0
 * Author: 
 * Author URI: 
 * License: GPLv2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: flavio
 */

if (!defined('ABSPATH')) {
	exit;
}

include_once 'vendor/autoload.php';

// Make sure we don't expose any info if called directly
if (!function_exists('add_action')) {
    echo "Hi there!  I\'m just a plugin, not much I can do when called directly.";
    exit;
}

// Base consts.
define('FLAVIO_PLUGIN_NAME_BASE_DIR', plugin_dir_path(__FILE__));
define('FLAVIO_PLUGIN_NAME_URL', plugin_dir_url(__FILE__));
define('FLAVIO_PLUGIN_NAME_PATH', plugin_dir_path(__FILE__));
define('FLAVIO_PLUGIN_NAME_BASE_NAME', plugin_basename(__FILE__));


// Load .env using vlucas/phpdotenv when available
// Using createUnsafeImmutable to make vars available via getenv()
try {
    if (class_exists('Dotenv\\Dotenv')) {
        if (is_file(FLAVIO_PLUGIN_NAME_BASE_DIR . '.env')) {
            Dotenv\Dotenv::createUnsafeImmutable(FLAVIO_PLUGIN_NAME_BASE_DIR, ['.env'])->safeLoad();
        }
    }
} catch (Throwable $e) {
    // Silently ignore env loading issues to avoid breaking the plugin in production
}

define('FLAVIO_LOGIN_URL', getenv('FLAVIO_LOGIN_URL') ?: 'https://flavio.marketgoo.com/login');
define('FLAVIO_API_ENDPOINT', getenv('FLAVIO_API_ENDPOINT') ?: 'https://flavio.marketgoo.com/api');
define('FLAVIO_SENTRY_DSN', getenv('FLAVIO_SENTRY_DSN') !== false ? getenv('FLAVIO_SENTRY_DSN') : 'https://e9d7881c297cf95f9ee9822bff251689@o16566.ingest.us.sentry.io/4510421050130432');
define('FLAVIO_SENTRY_ENV', getenv('FLAVIO_SENTRY_ENV') ?: 'production');
define('FLAVIO_POSTHOG_KEY', getenv('FLAVIO_POSTHOG_KEY') !== false ? getenv('FLAVIO_POSTHOG_KEY') : 'phc_LUwMXJe7IKUW3CewoLNmwBwGJHjgXjp8lixmvjO7GoU');
define('FLAVIO_POSTHOG_HOST', getenv('FLAVIO_POSTHOG_HOST') ?: 'https://eu.i.posthog.com');

// Sometimes we need the main plugin file for WP reasons.
include_once('main.php');

use Flavio\Menu;
use Flavio\AssetsManager;
use Flavio\Signature;
use Flavio\ActivationCode;
use Flavio\User;
use Flavio\SiteManager;
use Flavio\Suggestions;
use Flavio\Optimizations;
use Flavio\ProgressReporting;
use Flavio\Scan;
use Flavio\Data;
use Flavio\Tasks;
use Flavio\Tasks\Sitemap;
use Flavio\Tasks\RobotsTxt;
use Flavio\Tasks\No404;
use Flavio\Tasks\NoIndex;
use Flavio\Tasks\FriendlyUrl;
use Flavio\Tasks\StructuredDataHome;

/**
 * Main plugin class
 */
class Flavio
{

    /**
     * Constructor
     */
    public function __construct()
    {
        add_action('init', array($this, 'init'));
    }

    /**
     * Initialize plugin
     */
    public function init()
    {
        // Initialize admin menu and assets manager
        if (is_admin()) {
            new Menu();
            new AssetsManager();
        }

        // Initialize REST API endpoints
        new Signature();
        new ActivationCode();
        new User();
        new SiteManager();
        new Suggestions();
        new Optimizations();
        new ProgressReporting();
        new Scan();
        new Data();

        // Initialize tasks
        new Tasks();
        new Sitemap();
        new RobotsTxt();
        new No404();
        new NoIndex();
        new FriendlyUrl();
        new StructuredDataHome();
    }
}

new Flavio();
