<?php
declare(strict_types=1);

namespace Flavio\Traits;

/**
 * Cache trait for handling cached data with expiration using WordPress transients
 */
trait Cache {

	/**
	 * Get cache prefix for WordPress transients
	 *
	 * @return string Cache prefix
	 */
	private function get_cache_prefix(): string {
		return 'flavio_';
	}

	/**
	 * Set a value in cache with expiration time
	 *
	 * @param string $key Cache key
	 * @param mixed $data Data to cache
	 * @param int $duration Cache duration in seconds
	 * @return void
	 */
	protected function cache_set(string $key, $data, int $duration = 0): void {
		set_transient($this->get_cache_prefix() . $key, $data, $duration);
	}

	/**
	 * Get a value from cache if it's still valid
	 *
	 * @param string $key Cache key
	 * @return mixed|null Cached data or null if not found/expired
	 */
	protected function cache_get(string $key) {
		$value = get_transient($this->get_cache_prefix() . $key);
		return $value !== false ? $value : null;
	}

	/**
	 * Check if a cache key exists and is valid
	 *
	 * @param string $key Cache key
	 * @return bool True if cache exists and is valid
	 */
	protected function cache_has(string $key): bool {
		return get_transient($this->get_cache_prefix() . $key) !== false;
	}

	/**
	 * Clear cache entries
	 *
	 * @param string|null $key Optional cache key. If provided, clears only that key.
	 *                          If null, clears all Flavio cache entries.
	 * @return void
	 */
	protected function cache_clear(?string $key = null): void {
		$cache_prefix = $this->get_cache_prefix();

		if ($key !== null) {
			// Clear specific cache entry
			delete_transient($cache_prefix . $key);
			wp_cache_delete($cache_prefix . $key, 'transient');
		} else {
			// Clear all Flavio transients
			global $wpdb;
			// phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$wpdb->query(
				$wpdb->prepare(
					"DELETE FROM {$wpdb->options} WHERE option_name LIKE %s OR option_name LIKE %s",
					$wpdb->esc_like('_transient_' . $cache_prefix) . '%',
					$wpdb->esc_like('_transient_timeout_' . $cache_prefix) . '%'
				)
			);
			// phpcs:enable WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching

			// Clear object cache for consistency
			wp_cache_flush();
		}
	}
}
