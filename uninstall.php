<?php
/**
 * Uninstall script for Flavio plugin
 *
 * This file is executed when the plugin is uninstalled.
 * It removes all Flavio data from the WordPress database.
 */

// If uninstall not called from WordPress, exit
if (!defined('WP_UNINSTALL_PLUGIN')) {
	exit;
}

// Remove all Flavio options
$flavio_options = [
	'flavio_signature',
	'flavio_token',
	'flavio_api_domain',
	'flavio_site_domain',
	'flavio_plan_uuid',
];

foreach ($flavio_options as $flavio_option) {
	delete_option($flavio_option);
}

// Remove all Flavio transients (cache)
global $wpdb;
// phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
$wpdb->query(
	$wpdb->prepare(
		"DELETE FROM {$wpdb->options} WHERE option_name LIKE %s OR option_name LIKE %s",
		$wpdb->esc_like('_transient_flavio_') . '%',
		$wpdb->esc_like('_transient_timeout_flavio_') . '%'
	)
);
// phpcs:enable WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
