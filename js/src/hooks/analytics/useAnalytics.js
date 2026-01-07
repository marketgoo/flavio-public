import { useCallback } from 'react';
import { capture, identify, reset, EVENTS } from '@/lib/events';

/**
 * Custom hook for accessing analytics functions
 *
 * Provides a convenient interface for tracking events within components.
 *
 * @returns {Object} Analytics controls
 * @returns {Function} track - Capture an event
 * @returns {Function} identifyUser - Identify the current user
 * @returns {Function} resetSession - Reset analytics session
 * @returns {Object} EVENTS - Event taxonomy constants
 *
 * @example
 * const { track, EVENTS } = useAnalytics();
 * track(EVENTS.TASK_APPLY_CLICK, { task_name: 'SSL' });
 */
const useAnalytics = () => {
	const track = useCallback((eventName, properties = {}) => {
		capture(eventName, properties);
	}, []);

	const identifyUser = useCallback((distinctId, properties = {}) => {
		identify(distinctId, properties);
	}, []);

	const resetSession = useCallback(() => {
		reset();
	}, []);

	return {
		track,
		identifyUser,
		resetSession,
		EVENTS,
	};
};

export default useAnalytics;
