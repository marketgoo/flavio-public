import * as Sentry from '@sentry/react';
import { getWordPressConfig } from '@/api/client';

let isInitialized = false;

/**
 * Initialize Sentry for error tracking
 *
 * Should be called once at application startup.
 * Reads configuration from window.flavioData via getWordPressConfig().
 *
 * @example
 * // In main.jsx
 * initSentry();
 */
export const initSentry = () => {
	if (isInitialized) return;

	const config = getWordPressConfig();
	const { dsn, environment } = config.errorMonitoring || {};

	// Only initialize if DSN is provided
	if (!dsn) {
		return;
	}

	isInitialized = true;

	Sentry.init({
		dsn,
		environment: environment || 'production',

		// Integrations
		integrations: [
			Sentry.browserTracingIntegration(),
			Sentry.replayIntegration({
				maskAllText: true,
				blockAllMedia: true,
			}),
		],

		// Performance Monitoring
		tracesSampleRate: environment === 'production' ? 0.1 : 1.0, // 10% in prod, 100% in dev

		// Session Replay
		replaysSessionSampleRate: 0.1, // 10% of sessions
		replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

		// Filter out known non-critical errors
		beforeSend(event, hint) {
			const error = hint.originalException;

			// Don't send network errors in development
			if (import.meta.env.DEV && error?.name?.includes('Network')) {
				return null;
			}

			return event;
		},
	});
};

/**
 * Capture an exception in Sentry
 *
 * @param {Error} error - Error object
 * @param {Object} [context={}] - Additional context
 *
 * @example
 * captureException(error, {
 *   action: 'fetch_data',
 *   component: 'MyComponent'
 * });
 */
export const captureException = (error, context = {}) => {
	if (!Sentry.isInitialized()) {
		return;
	}

	Sentry.captureException(error, {
		contexts: {
			custom: context,
		},
		tags: {
			action: context.action,
			component: context.component,
		},
	});
};

/**
 * Identify a user in Sentry
 *
 * @param {string} id - User ID
 * @param {Object} [userData={}] - Additional user data
 *
 * @example
 * identify('user-123', {
 *   email: 'user@example.com',
 *   username: 'johndoe'
 * });
 */
export const identify = (id, userData = {}) => {
	if (!Sentry.isInitialized()) {
		return;
	}

	Sentry.setUser({
		id,
		...userData,
	});
};

/**
 * Clear user context (e.g., on logout)
 */
export const clearUser = () => {
	if (!Sentry.isInitialized()) {
		return;
	}

	Sentry.setUser(null);
};

/**
 * Add breadcrumb for debugging
 *
 * @param {string} message - Breadcrumb message
 * @param {Object} [data={}] - Additional data
 * @param {('default'|'debug'|'info'|'navigation'|'http'|'error'|'user')} [level='info'] - Breadcrumb level
 *
 * @example
 * addBreadcrumb('User clicked button', { buttonId: 'submit' }, 'user');
 */
export const addBreadcrumb = (message, data = {}, level = 'info') => {
	if (!Sentry.isInitialized()) {
		return;
	}

	Sentry.addBreadcrumb({
		message,
		level,
		data,
	});
};

export default {
	init: initSentry,
	captureException,
	identify,
	clearUser,
	addBreadcrumb,
};
