/**
 * Console Logger with Colors and Formatting
 *
 * Provides rich, colorful console output for debugging.
 * Uses CSS styling in console.log for better readability.
 * Integrates with error monitoring for production error tracking.
 */

import { captureException } from '@/lib/errorMonitoring';

// Console styles (CSS)
const styles = {
	// Base styles
	error: 'color: #ef4444; font-weight: bold; font-size: 14px;',
	warning: 'color: #f59e0b; font-weight: bold; font-size: 14px;',
	info: 'color: #3b82f6; font-weight: bold; font-size: 14px;',
	success: 'color: #10b981; font-weight: bold; font-size: 14px;',
	muted: 'color: #6b7280; font-size: 12px;',
	highlight: 'color: #8b5cf6; font-weight: bold;',

	// Error type specific
	api: 'color: #ec4899; font-weight: bold; font-size: 14px;',
	network: 'color: #f97316; font-weight: bold; font-size: 14px;',
	react: 'color: #06b6d4; font-weight: bold; font-size: 14px;',

	// Special
	badge: 'background: #1f2937; color: #f3f4f6; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 11px;',
};

/**
 * Get style based on error type
 *
 * @param {Error} error - Error object
 * @returns {string} CSS style string
 */
const getErrorStyle = (error) => {
	const name = error.name || '';

	if (
		name.includes('Network') ||
		name.includes('Timeout') ||
		name.includes('Connection')
	) {
		return styles.network;
	}

	if (name.includes('Api') || error.statusCode) {
		return styles.api;
	}

	if (
		name.includes('Component') ||
		name.includes('Render') ||
		name.includes('Hook')
	) {
		return styles.react;
	}

	return styles.error;
};

/**
 * Get icon based on error type
 *
 * @param {Error} error - Error object
 * @returns {string} Emoji icon
 */
const getErrorIcon = (error) => {
	const name = error.name || '';

	if (
		name.includes('Network') ||
		name.includes('Timeout') ||
		name.includes('Connection')
	) {
		return '📡';
	}

	if (name.includes('Api')) {
		return '🌐';
	}

	if (name.includes('Component') || name.includes('Render')) {
		return '⚛️';
	}

	if (name.includes('Unauthorized')) {
		return '🔒';
	}

	if (name.includes('Forbidden')) {
		return '🚫';
	}

	if (name.includes('NotFound')) {
		return '❓';
	}

	if (name.includes('Server')) {
		return '💥';
	}

	if (name.includes('Validation')) {
		return '✏️';
	}

	return '🚨';
};

/**
 * Format component stack for better readability
 * Removes verbose URLs and formats cleanly
 *
 * @param {string} componentStack - Raw component stack from React
 * @returns {string} Formatted component stack
 */
const formatComponentStack = (componentStack) => {
	if (!componentStack) return '';

	return componentStack
		.split('\n')
		.filter((line) => line.trim()) // Remove empty lines
		.map((line) => {
			// Extract: "ComponentName@http://...file.jsx?t=...:line:col"
			// Output: "  ComponentName (file.jsx:line)"
			const match = line.match(
				/([A-Z]\w+)@.*\/([^/?]+\.jsx)(?:\?[^:]*)?:(\d+)/
			);
			if (match) {
				const [, componentName, file, lineNum] = match;
				return `  ${componentName} (${file}:${lineNum})`;
			}
			return `  ${line.trim()}`;
		})
		.join('\n');
};

/**
 * Clean context object by removing internal/redundant keys
 *
 * @param {Object} context - Context object
 * @returns {Object} Cleaned context
 */
const cleanContext = (context) => {
	const cleaned = { ...context };

	// Remove internal/redundant keys
	delete cleaned.componentStackLength;
	delete cleaned.firstLine;
	delete cleaned.hasComponentStack;

	return cleaned;
};

/**
 * Log error to console with colors and formatting
 *
 * @param {Error} error - Error object to log
 * @param {Object} context - Additional context information
 */
export const logError = (error, context = {}) => {
	const isDev = import.meta.env.DEV;

	// Send to error monitoring in production (or if forced)
	if (!isDev || context.forceLog) {
		captureException(error, context);
	}

	// In production, only log to console if forced
	if (!isDev && !context.forceLog) {
		return;
	}

	const icon = getErrorIcon(error);
	const errorStyle = getErrorStyle(error);
	const cleanedContext = cleanContext(context);

	// Main error group
	console.group(`%c${icon} Error: ${error.name}`, errorStyle);

	// Error message
	console.log(`%c${error.message}`, styles.error);

	// Status code (for API errors)
	if (error.statusCode) {
		console.log(`%cStatus Code: ${error.statusCode}`, styles.muted);
	}

	// Endpoint (for API errors)
	if (error.endpoint) {
		console.log(
			`%cEndpoint: ${error.method || 'GET'} ${error.endpoint}`,
			styles.muted
		);
	}

	// Context (if provided and not empty after cleaning)
	if (Object.keys(cleanedContext).length > 0) {
		console.group('%c📋 Context', styles.info);
		console.table(cleanedContext);
		console.groupEnd();
	}

	// Validation errors (for ValidationError)
	if (error.errors && error.errors.length > 0) {
		console.group('%c❌ Validation Errors', styles.warning);
		error.errors.forEach((err, index) => {
			console.log(`%c${index + 1}. ${err}`, styles.muted);
		});
		console.groupEnd();
	}

	// Timestamp
	console.log(
		`%c🕐 ${error.timestamp || new Date().toISOString()}`,
		styles.muted
	);

	// Component stack (for React errors) - PRIORITY
	if (error.componentStack) {
		console.group('%c⚛️  Component Stack', styles.react);
		const formatted = formatComponentStack(error.componentStack);
		console.log(`%c${formatted}`, styles.highlight);
		console.groupEnd();
	}

	// JavaScript stack trace (collapsible, less important)
	if (error.stack) {
		console.groupCollapsed('%c📚 JavaScript Stack Trace', styles.muted);
		console.log(error.stack);
		console.groupEnd();
	}

	// Serialized error (dev only, collapsed by default)
	if (isDev && error.toJSON) {
		console.groupCollapsed('%c📦 Serialized Error (dev)', styles.muted);
		console.log(JSON.stringify(error.toJSON(), null, 2));
		console.groupEnd();
	}

	console.groupEnd();
};

/**
 * Log info message
 *
 * @param {string} message - Info message
 * @param {*} data - Optional data to log
 */
export const logInfo = (message, data) => {
	if (import.meta.env.DEV) {
		console.log(`%cℹ️  ${message}`, styles.info, data || '');
	}
};

/**
 * Log success message
 *
 * @param {string} message - Success message
 * @param {*} data - Optional data to log
 */
export const logSuccess = (message, data) => {
	if (import.meta.env.DEV) {
		console.log(`%c✅ ${message}`, styles.success, data || '');
	}
};

/**
 * Log warning
 *
 * @param {string} message - Warning message
 * @param {*} data - Optional data to log
 */
export const logWarning = (message, data) => {
	if (import.meta.env.DEV) {
		console.warn(`%c⚠️  ${message}`, styles.warning, data || '');
	}
};

/**
 * Log debug message (only in dev)
 *
 * @param {string} message - Debug message
 * @param {*} data - Optional data to log
 */
export const logDebug = (message, data) => {
	if (import.meta.env.DEV) {
		console.log(`%c🐛 ${message}`, styles.muted, data || '');
	}
};
