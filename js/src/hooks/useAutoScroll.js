import { useRef, useEffect } from 'react';

/**
 * Custom hook for auto-scrolling to an element when dependencies change
 *
 * Automatically scrolls to the referenced element whenever the provided
 * dependencies change. Commonly used for chat interfaces to scroll to
 * the bottom when new messages are added.
 *
 * @param {Array} dependencies - Array of values to watch for changes
 * @param {Object} [options={}] - Scroll behavior options
 * @param {('smooth'|'auto'|'instant')} [options.behavior='smooth'] - Scroll animation style
 * @param {('start'|'center'|'end'|'nearest')} [options.block='nearest'] - Vertical alignment
 * @param {number} [options.delay=0] - Delay before scrolling (ms). Useful when content needs to render first.
 * @returns {React.RefObject} Ref to attach to the scroll target element
 *
 * @example
 * // Basic usage - scroll to bottom when messages change
 * const scrollRef = useAutoScroll([messages]);
 * return <div ref={scrollRef} />;
 *
 * @example
 * // With custom options and delayed scroll
 * const scrollRef = useAutoScroll([messages], {
 *   behavior: 'smooth',
 *   block: 'nearest',
 *   delay: 250
 * });
 */
export const useAutoScroll = (dependencies = [], options = {}) => {
	const { behavior = 'smooth', block = 'nearest', delay = 0 } = options;
	const scrollRef = useRef(null);

	useEffect(() => {
		const scroll = () => {
			scrollRef.current?.scrollIntoView({ behavior, block });
		};

		if (delay > 0) {
			const timeoutId = setTimeout(scroll, delay);
			return () => clearTimeout(timeoutId);
		} else {
			scroll();
		}
	}, dependencies);

	return scrollRef;
};

export default useAutoScroll;
