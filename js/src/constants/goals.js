/**
 * Goal Configuration
 *
 * Shared goal definitions used in onboarding and goal-profile page.
 * Each goal has an id, icon name, title, description, and tooltip.
 */

export const GOALS = [
	{
		id: 'visibility',
		iconName: 'Sparkles',
		title: 'Increase my visibility on Google and AI assistants',
		description:
			'I want more people to discover my business when they search for products or services like mine.',
		tooltip:
			"I focus on making your business easier to find and recognize. I improve your website's health, clarity, and content so Google and AI assistants understand what you offer and show your brand more often when people are searching.",
	},
	{
		id: 'customers',
		iconName: 'MapPin',
		title: 'Get more new customers (especially local ones)',
		description:
			'I want more people to discover my business when they search for products or services like mine.',
		tooltip:
			"I help turn visibility into real customers. I work on improving your local presence, bringing the right people to your site, and making it easier for them to call, visit, or choose your business when they're ready.",
	},
	{
		id: 'loyalty',
		iconName: 'HandHeart',
		title: 'Build loyalty and strengthen relationships with my current customers',
		description:
			'I want more people to discover my business when they search for products or services like mine.',
		tooltip:
			'I help you stay top of mind with people who already know you. By supporting trust, reviews, and useful content, I encourage repeat visits, stronger brand recognition, and long-term relationships.',
	},
];

/**
 * Get a goal by its ID
 *
 * @param {string} goalId - Goal ID ('visibility', 'customers', 'loyalty')
 * @returns {Object|undefined} Goal object or undefined if not found
 */
export const getGoalById = (goalId) => GOALS.find((goal) => goal.id === goalId);
