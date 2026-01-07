import { useEffect } from 'react';
import useAnalytics from './useAnalytics';

/**
 * Custom hook to track an event when component mounts
 *
 * Automatically tracks the specified event with properties when the component
 * mounts. Useful for impression tracking, page views, and other mount-time events.
 *
 * @param {string} eventName - Event name from EVENTS constant
 * @param {Object} [properties={}] - Event properties
 *
 * @example
 * // Track page view
 * useTrackOnMount(EVENTS.PAGE_VIEW, { page: 'dashboard' });
 *
 * @example
 * // Track card impression
 * useTrackOnMount(EVENTS.SUGGESTION_CARD_VIEW, { task_name: title });
 *
 * @example
 * // Track with dynamic properties
 * useTrackOnMount(EVENTS.FEATURE_VIEW, { feature_id: id, user_type: type });
 */
const useTrackOnMount = (eventName, properties = {}) => {
	const { track } = useAnalytics();

	useEffect(() => {
		track(eventName, properties);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [track, eventName]); // Properties not in deps to avoid re-tracking on prop changes
};

export default useTrackOnMount;
