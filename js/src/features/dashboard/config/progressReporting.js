/**
 * Progress Reporting Configuration
 *
 * Contains empty states definitions for the ProgressReporting component.
 */

/**
 * Empty states configuration for different data statuses
 */
export const EMPTY_STATES_CONFIG = {
	'not-connected': {
		title: "I can't track your progress yet.",
		description:
			"Connect your Google accounts, and I'll start gathering insights automatically for your goal.",
		primaryButton: {
			label: 'Connect account',
			variant: 'default',
		},
	},
	waiting: {
		title: 'Everything is connected! Now we just need to give Google some time.',
		description:
			"I'll show your first insights here as soon as they're available.",
		primaryButton: {
			label: 'Try Again',
			variant: 'default',
		},
	},
	error: {
		title: "I wasn't able to process the data.",
		description:
			"No worries — I'll try again, or you can refresh this section anytime.",
		primaryButton: {
			label: 'Try Again',
			variant: 'default',
		},
	},
};
