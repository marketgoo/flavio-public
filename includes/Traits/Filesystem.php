<?php
declare(strict_types=1);

namespace Flavio\Traits;

use WP_Filesystem_Base;

/**
 * Filesystem trait for handling file operations using WP_Filesystem
 *
 * This trait provides an object-oriented wrapper around WordPress filesystem
 * operations, handling the initialization and complexity of WP_Filesystem.
 */
trait Filesystem {

	/**
	 * WP_Filesystem instance
	 *
	 * @var WP_Filesystem_Base|null
	 */
	private ?WP_Filesystem_Base $filesystem = null;

	/**
	 * Initialize WP_Filesystem
	 *
	 * @return bool True on success, false on failure
	 */
	private function init_filesystem(): bool {
		if ($this->filesystem !== null) {
			return true;
		}

		global $wp_filesystem;

		if (!function_exists('WP_Filesystem')) {
			require_once ABSPATH . 'wp-admin/includes/file.php';
		}

		// Initialize WP_Filesystem
		if (!WP_Filesystem()) {
			return false;
		}

		$this->filesystem = $wp_filesystem;
		return true;
	}

	/**
	 * Check if a file or directory is writable
	 *
	 * @param string $path Path to check
	 * @return bool True if writable, false otherwise
	 */
	protected function fs_is_writable(string $path): bool {
		if (!$this->init_filesystem()) {
			return false;
		}

		return $this->filesystem->is_writable($path);
	}

	/**
	 * Write content to a file
	 *
	  * @param string $file File path
	 * @param string $contents Content to write
	 * @param int $mode Optional. File permissions. Default 0644.
	 * @return bool True on success, false on failure
	 */
	protected function fs_put_contents(string $file, string $contents, int $mode = 0644): bool {
		if (!$this->init_filesystem()) {
			return false;
		}

		return $this->filesystem->put_contents($file, $contents, $mode);
	}

	/**
	 * Read content from a file
	 *
	 * @param string $file File path
	 * @return string|false File contents on success, false on failure
	 */
	protected function fs_get_contents(string $file) {
		if (!$this->init_filesystem()) {
			return false;
		}

		return $this->filesystem->get_contents($file);
	}

	/**
	 * Check if a file exists
	 *
	 * @param string $file File path
	 * @return bool True if exists, false otherwise
	 */
	protected function fs_exists(string $file): bool {
		if (!$this->init_filesystem()) {
			return false;
		}

		return $this->filesystem->exists($file);
	}

	/**
	 * Delete a file
	 *
	 * @param string $file File path
	 * @param bool $recursive Optional. Delete recursively if directory. Default false.
	 * @return bool True on success, false on failure
	 */
	protected function fs_delete(string $file, bool $recursive = false): bool {
		if (!$this->init_filesystem()) {
			return false;
		}

		return $this->filesystem->delete($file, $recursive);
	}

	/**
	 * Get current date/time in UTC (WordPress compliant)
	 *
	 * @param string $format Date format. Default 'Y-m-d H:i:s'.
	 * @return string Formatted date/time in UTC
	 */
	protected function fs_get_utc_datetime(string $format = 'Y-m-d H:i:s'): string {
		return gmdate($format);
	}
}
