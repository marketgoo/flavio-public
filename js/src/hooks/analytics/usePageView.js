import { EVENTS } from '@/lib/events';
import useTrackOnMount from './useTrackOnMount';

/**
 * Custom hook to track page view when component mounts
 *
 * Convenience wrapper around useTrackOnMount specifically for page views.
 * Automatically tracks PAGE_VIEW event with the specified page name.
 *
 * @param {string} pageName - Name of the page being viewed
 *
 * @example
 * // In a page component
 * const DashboardPage = () => {
 *   usePageView('dashboard');
 *   return <div>...</div>;
 * };
 */
const usePageView = (pageName) => {
	useTrackOnMount(EVENTS.PAGE_VIEW, {
		$current_url: `${window.location.origin}/wp-admin/${pageName}`,
	});
};

export default usePageView;
