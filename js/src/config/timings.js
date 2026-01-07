/**
 * Centralized timing constants for animations, delays, and transitions
 *
 * All timing values in milliseconds (ms)
 * Grouped by functionality for easy maintenance
 */

export const TIMINGS = {
	/**
	 * Chat-related delays (ConversationalChat, GuidedTaskChat)
	 */
	CHAT: {
		// Delay before showing acknowledgment/response
		RESPONSE_DELAY: 500,

		// Delay before showing next question after acknowledgment
		QUESTION_DELAY: 500,

		// Buffer time for smooth transitions
		BUFFER: 300,

		// Delay for scroll after rendering button/content
		SCROLL_DELAY: 250,
	},

	/**
	 * Typewriter animation speeds
	 */
	ANIMATION: {
		// Time per character for main content (ms/char)
		TYPEWRITER_CHAR: 15,

		// Time per character for example text (ms/char)
		TYPEWRITER_EXAMPLE: 10,
	},

	/**
	 * API call delays (for mocked/testing endpoints)
	 */
	API: {
		// Mock delay for testing API calls (1 second)
		MOCK_DELAY: 1000,

		// Delay for "mark as done" action
		MARK_DONE_DELAY: 500,
	},

	/**
	 * Drawer/Sheet transitions
	 */
	DRAWER: {
		// Delay before closing drawer
		CLOSE_DELAY: 500,

		// Transition delay for content changes
		TRANSITION: 300,
	},
};
