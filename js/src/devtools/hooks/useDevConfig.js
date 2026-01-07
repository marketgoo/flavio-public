/**
 * DevTools Configuration Hook
 *
 * Manages runtime overrides for flavioData during development.
 * Persists overrides to localStorage and merges them with original config.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';

const DEV_OVERRIDES_KEY = 'flavio_dev_overrides';

// Store original flavioData once at module level
if (!window._originalFlavioData && window.flavioData) {
	window._originalFlavioData = JSON.parse(JSON.stringify(window.flavioData));
}

/**
 * Hook for managing flavioData overrides in development
 *
 * @returns {Object} DevConfig controls
 * @returns {Object} overrides - Current override values
 * @returns {Object} effectiveConfig - Merged config (original + overrides)
 * @returns {Function} updateOverride - Update a single override value
 * @returns {Function} resetOverrides - Clear all overrides
 */
const useDevConfig = () => {
	const [overrides, setOverrides] = useState(() => {
		try {
			return JSON.parse(localStorage.getItem(DEV_OVERRIDES_KEY) || '{}');
		} catch {
			return {};
		}
	});

	// Compute effective config synchronously (no useEffect timing issues)
	const effectiveConfig = useMemo(() => {
		const original = window._originalFlavioData || window.flavioData || {};
		return deepMerge(JSON.parse(JSON.stringify(original)), overrides);
	}, [overrides]);

	// Sync to window.flavioData for other parts of the app
	useEffect(() => {
		window.flavioData = effectiveConfig;
	}, [effectiveConfig]);

	/**
	 * Update a single override value using dot notation path
	 *
	 * @param {string} path - Dot notation path (e.g., 'manageAccounts' or 'user.email')
	 * @param {*} value - New value
	 */
	const updateOverride = useCallback((path, value) => {
		setOverrides((prev) => {
			const newOverrides = setNestedValue({ ...prev }, path, value);
			localStorage.setItem(
				DEV_OVERRIDES_KEY,
				JSON.stringify(newOverrides)
			);
			return newOverrides;
		});
	}, []);

	/**
	 * Remove a single override
	 *
	 * @param {string} path - Dot notation path to remove
	 */
	const removeOverride = useCallback((path) => {
		setOverrides((prev) => {
			const newOverrides = removeNestedValue({ ...prev }, path);
			localStorage.setItem(
				DEV_OVERRIDES_KEY,
				JSON.stringify(newOverrides)
			);
			return newOverrides;
		});
	}, []);

	/**
	 * Clear all overrides and restore original config
	 */
	const resetOverrides = useCallback(() => {
		setOverrides({});
		localStorage.removeItem(DEV_OVERRIDES_KEY);
		if (window._originalFlavioData) {
			window.flavioData = JSON.parse(
				JSON.stringify(window._originalFlavioData)
			);
		}
	}, []);

	/**
	 * Get the original config (without overrides)
	 *
	 * @returns {Object} Original configuration
	 */
	const getOriginalConfig = useCallback(() => {
		return window._originalFlavioData || window.flavioData || {};
	}, []);

	/**
	 * Check if a path has an override
	 *
	 * @param {string} path - Dot notation path
	 * @returns {boolean} True if path is overridden
	 */
	const hasOverride = useCallback(
		(path) => {
			return getNestedValue(overrides, path) !== undefined;
		},
		[overrides]
	);

	return {
		overrides,
		effectiveConfig,
		updateOverride,
		removeOverride,
		resetOverrides,
		getOriginalConfig,
		hasOverride,
	};
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Deep merge two objects
 */
function deepMerge(target, source) {
	for (const key in source) {
		if (
			source[key] &&
			typeof source[key] === 'object' &&
			!Array.isArray(source[key])
		) {
			if (!target[key]) target[key] = {};
			deepMerge(target[key], source[key]);
		} else {
			target[key] = source[key];
		}
	}
	return target;
}

/**
 * Set a nested value using dot notation
 */
function setNestedValue(obj, path, value) {
	const keys = path.split('.');
	let current = obj;

	for (let i = 0; i < keys.length - 1; i++) {
		if (!current[keys[i]] || typeof current[keys[i]] !== 'object') {
			current[keys[i]] = {};
		}
		current = current[keys[i]];
	}

	current[keys[keys.length - 1]] = value;
	return obj;
}

/**
 * Get a nested value using dot notation
 */
function getNestedValue(obj, path) {
	const keys = path.split('.');
	let current = obj;

	for (const key of keys) {
		if (current === undefined || current === null) return undefined;
		current = current[key];
	}

	return current;
}

/**
 * Remove a nested value using dot notation
 */
function removeNestedValue(obj, path) {
	const keys = path.split('.');
	let current = obj;

	for (let i = 0; i < keys.length - 1; i++) {
		if (!current[keys[i]]) return obj;
		current = current[keys[i]];
	}

	delete current[keys[keys.length - 1]];

	// Clean up empty parent objects
	cleanEmptyObjects(obj);

	return obj;
}

/**
 * Remove empty objects recursively
 */
function cleanEmptyObjects(obj) {
	for (const key in obj) {
		if (obj[key] && typeof obj[key] === 'object') {
			cleanEmptyObjects(obj[key]);
			if (Object.keys(obj[key]).length === 0) {
				delete obj[key];
			}
		}
	}
}

export default useDevConfig;
