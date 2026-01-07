import { getWordPressConfig } from '@/api/client';

/**
 * Event Taxonomy
 */
export const EVENTS = {
	// Lifecycle
	ONBOARDING_SUCCESSFUL: 'onboarding_successful',

	// Navigation / Views
	PAGE_VIEW: '$pageview',
	SUGGESTION_CARD_VIEW: 'suggestion_card_view',

	// Interactions
	TASK_APPLY_CLICK: 'task_apply_now_click',
	TASK_REVIEW_CLICK: 'task_review_click',
	TASK_POSTPONE_CLICK: 'task_postpone_click',
	CHAT_BUTTON_CLICK: 'chat_button_click',
	REFRESH_PLAN_CLICK: 'refresh_plan_click',
	UPGRADE_CTA_CLICK: 'upgrade_cta_click',
};

let isInitialized = false;
let eventQueue = [];
let posthog = null; // Will be loaded dynamically
let loadFailed = false; // Track if loading failed

// DevTools event listeners and history (only used in development)
const eventListeners = new Set();
const eventHistory = [];
const MAX_EVENT_HISTORY = 50;

/**
 * Load PostHog library dynamically
 * Returns true if loaded successfully, false otherwise
 */
const loadPostHog = async () => {
	if (posthog) return true; // Already loaded
	if (loadFailed) return false; // Already failed

	try {
		const posthogModule = await import('posthog-js');
		posthog = posthogModule.default;
		return true;
	} catch {
		loadFailed = true;
		return false;
	}
};

/**
 * Initialize the events system
 *
 * Should be called only when we want to start tracking (e.g. after login).
 */
export const initEvents = async () => {
	if (isInitialized) return;

	// Try to load PostHog
	const loaded = await loadPostHog();
	if (!loaded) {
		return; // Fail gracefully
	}

	try {
		const config = getWordPressConfig();
		const { key, host } = config.events || config.analytics || {};

		if (!key) {
			return;
		}

		if (!host) {
			return;
		}

		posthog.init(key, {
			api_host: host,
			person_profiles: 'identified_only', // Optimization
			loaded: () => {
				// Flush queued events
				if (eventQueue.length > 0) {
					eventQueue.forEach(({ eventName, properties }) => {
						posthog.capture(eventName, properties);
					});
					eventQueue = [];
				}
			},
		});

		isInitialized = true;
	} catch {
		// Silent fail
	}
};

/**
 * Capture an event
 *
 * @param {string} eventName
 * @param {Object} [properties={}]
 */
export const capture = (eventName, properties = {}) => {
	// Create event object for DevTools
	const event = {
		id: Date.now() + Math.random(),
		timestamp: new Date(),
		eventName,
		properties,
	};

	// Store in history (for late subscribers like DevTools)
	eventHistory.unshift(event);
	if (eventHistory.length > MAX_EVENT_HISTORY) {
		eventHistory.pop();
	}

	// Notify active listeners
	eventListeners.forEach((listener) => listener(event));

	// Queue if not ready or blocked
	if (!isInitialized || !posthog || loadFailed) {
		return;
	}

	try {
		posthog.capture(eventName, properties);
	} catch {
		// Silent fail in production and development
	}
};

/**
 * Identify a user
 *
 * @param {string} distinctId
 * @param {Object} [properties={}]
 */
export const identify = (distinctId, properties = {}) => {
	if (!isInitialized || !posthog || loadFailed) return;

	try {
		posthog.identify(distinctId, properties);
	} catch {
		// Silent fail
	}
};

/**
 * Reset events session
 */
export const reset = () => {
	if (!isInitialized || !posthog || loadFailed) return;

	try {
		posthog.reset();
	} catch {
		// Silent fail
	}
};

// Backwards compatibility aliases
export const initAnalytics = initEvents;

/**
 * Subscribe to capture events (for DevTools)
 * Immediately receives all historical events, then live events as they happen.
 *
 * @param {Function} listener - Called with event object on each capture
 * @returns {Function} Unsubscribe function
 */
export const subscribeToEvents = (listener) => {
	// Send historical events immediately (in chronological order)
	[...eventHistory].reverse().forEach((event) => listener(event));

	// Subscribe to future events
	eventListeners.add(listener);
	return () => eventListeners.delete(listener);
};

export default {
	EVENTS,
	init: initEvents,
	capture,
	identify,
	reset,
	subscribeToEvents,
};
