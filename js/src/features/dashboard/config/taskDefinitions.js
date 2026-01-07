/**
 * Task Definitions Configuration
 *
 * Maps task_id from backend to UI content (titles, descriptions, tags, etc.)
 * Used by useSmartPlan hook to transform backend tasks to frontend format.
 *
 * Supported tasks (automatic fix via POST endpoint):
 * - robotstxt, sitemap, no404, noindex, blockedcrawlers
 * - sitenametagline, outdatedplugins, friendlyurl
 * - homepagemetas, homepagestructureddata
 * - contactpagemetas, contactinfo, contactpagegeodata
 *
 * Manual tasks (mark-done):
 * - sslexists, googlesearchconsole, googleanalytics
 *
 * Unknown tasks use 'default' fallback (mark-done only)
 */

/**
 * Available tags for tasks
 */
export const TASK_TAGS = {
	VISIBILITY: 'Visibility',
	SECURITY: 'Security',
	TRUST: 'Trust',
};

/**
 * Task definitions - mapping task_id to UI content
 */
export const TASK_DEFINITIONS = {
	// =====================================================
	// Tasks with automatic fix (have endpoint)
	// =====================================================
	robotstxt: {
		title: "I'll help Google discover your site more easily",
		description:
			"A robots.txt file is missing from your website. This file helps search engines know where to go. I can't fix it automatically, but I'll guide you step-by-step.",
		tags: [TASK_TAGS.VISIBILITY, TASK_TAGS.SECURITY, TASK_TAGS.TRUST],
		icon: 'FileText',
		emoji: '🛠️',
		actionType: 'apply',
		apiEndpoint: '/tasks/robotstxt',
	},
	sitemap: {
		title: "I've prepared your sitemap. A map of all your website pages",
		description:
			"A sitemap helps Google discover all your pages. I've prepared a plan to create it so your content is easier to find and your visibility improves.",
		tags: [TASK_TAGS.VISIBILITY],
		icon: 'FileText',
		emoji: '🗺️',
		actionType: 'apply',
		apiEndpoint: '/tasks/sitemap',
	},
	no404: {
		title: "I've found broken links in your pages and prepared a cleanup",
		description:
			"Some links on your site point to pages that no longer exist. This can confuse visitors and harm your SEO. I've reviewed your content and prepared a list of broken links.",
		tags: [TASK_TAGS.VISIBILITY, TASK_TAGS.TRUST],
		icon: 'Link',
		emoji: '🔗',
		actionType: 'apply',
		apiEndpoint: '/tasks/no404',
	},
	noindex: {
		title: "I've prepared a list of pages hidden from search engines",
		description:
			'Some pages have "noindex" tags that prevent search engines from showing them in search results. I\'ve analyzed your site and prepared a list of these pages.',
		tags: [TASK_TAGS.VISIBILITY],
		icon: 'EyeOff',
		emoji: '🚫',
		actionType: 'apply',
		apiEndpoint: '/tasks/noindex',
	},
	blockedcrawlers: {
		title: "I've checked which pages aren't visible to search engines and prepared fixes",
		description:
			"Some pages on your site might be blocked from search engines and AI tools. I've reviewed your site and identified which pages are restricted.",
		tags: [TASK_TAGS.VISIBILITY, TASK_TAGS.SECURITY],
		icon: 'ShieldOff',
		emoji: '🤖',
		actionType: 'apply',
		apiEndpoint: '/tasks/blockedcrawlers',
	},
	sitenametagline: {
		title: "I've prepared a site name and tagline to make your website work for your goals",
		description:
			"I've reviewed your site and suggested a name and tagline that clearly communicate your value. You can review them and approve.",
		tags: [TASK_TAGS.VISIBILITY],
		icon: 'Tag',
		emoji: '🏷️',
		actionType: 'apply',
		apiEndpoint: '/tasks/sitenametagline',
	},
	outdatedplugins: {
		title: "I've prepared updates for your outdated plugins",
		description:
			"Outdated plugins can slow down your site or create security risks. I've reviewed your setup and prepared a list of plugins that are ready to update.",
		tags: [TASK_TAGS.SECURITY],
		icon: 'RefreshCw',
		emoji: '🔧',
		actionType: 'apply',
		apiEndpoint: '/tasks/outdatedplugins',
	},
	friendlyurl: {
		title: "I've prepared improved permalinks for better visibility on search",
		description:
			'Clear and consistent URLs make your website easier to navigate and improve overall SEO.',
		tags: [TASK_TAGS.VISIBILITY],
		icon: 'Link2',
		emoji: '🔧',
		actionType: 'apply',
		apiEndpoint: '/tasks/friendlyurl',
	},
	homepagemetas: {
		title: "I've prepared an optimized homepage title and metas for your site",
		description:
			"I've analyzed your homepage and prepared an optimized title (H1) and meta tags to better reflect your business goals.",
		tags: [TASK_TAGS.VISIBILITY],
		icon: 'FileText',
		emoji: '🏷️',
		actionType: 'apply',
		apiEndpoint: '/tasks/homepagemetas',
	},
	structureddatahome: {
		title: "I've prepared a better structure for your homepage content",
		description:
			'Organizing your homepage with structured data helps Google understand what your business offers and makes it easier for potential customers to find you.',
		tags: [TASK_TAGS.VISIBILITY],
		icon: 'Layers',
		emoji: '🗂️',
		actionType: 'apply',
		apiEndpoint: '/tasks/structured-data-home',
	},
	structureddata: {
		title: 'Help Google read your site correctly',
		description:
			'Add structured data to your homepage to help Google understand what your site offers and show it in search results.',
		tags: [TASK_TAGS.VISIBILITY],
		icon: 'Globe',
		emoji: '🌐',
		actionType: 'apply',
		apiEndpoint: '/tasks/structureddata',
	},
	contactpagemetas: {
		title: "I've reviewed this page and prepared improvements",
		description:
			'I checked your page and found opportunities to improve clarity, structure and visibility.',
		tags: [TASK_TAGS.VISIBILITY],
		icon: 'FileText',
		emoji: '✨',
		actionType: 'apply',
		apiEndpoint: '/tasks/contactpagemetas',
	},
	contactinfo: {
		title: "I've prepared an update for your contact information",
		description:
			"Your site is missing important contact details, and that can affect both trust and visibility. I've prepared an update so your phone number, email and address can be correctly added to your site.",
		tags: [TASK_TAGS.TRUST, TASK_TAGS.VISIBILITY],
		icon: 'Phone',
		emoji: '📇',
		actionType: 'apply',
		apiEndpoint: '/tasks/contactinfo',
	},
	contactpagegeodata: {
		title: "I've prepared a local data update for your contact page",
		description:
			'Structured data with geo information helps Google and AI assistants show your business in local searches.',
		tags: [TASK_TAGS.VISIBILITY],
		icon: 'MapPin',
		emoji: '🏠',
		actionType: 'apply',
		apiEndpoint: '/tasks/contactpagegeodata',
	},

	// =====================================================
	// Tasks without automatic fix (manual/mark-done)
	// =====================================================
	sslexists: {
		title: "I've checked your site and it's not fully secure with HTTPS",
		description:
			"Your site isn't fully secured with HTTPS, which can affect trust and visibility. I've prepared simple steps to help you update your SSL settings.",
		tags: [TASK_TAGS.SECURITY, TASK_TAGS.TRUST],
		icon: 'Lock',
		emoji: '🔒',
		actionType: 'mark-done',
		apiEndpoint: null,
	},
	googlesearchconsole: {
		title: "I've prepared Google Search Console for your site",
		description:
			"I've prepared your site to start tracking in Google Search Console. You can review and authorize the connection.",
		tags: [TASK_TAGS.VISIBILITY],
		icon: 'BarChart2',
		emoji: '📈',
		actionType: 'mark-done',
		apiEndpoint: null,
	},
	googleanalytics: {
		title: "I've prepared Google Analytics for your site",
		description:
			"I've prepared your site to start tracking visitor data with Google Analytics. You can review and authorize the connection.",
		tags: [TASK_TAGS.VISIBILITY],
		icon: 'PieChart',
		emoji: '📊',
		actionType: 'mark-done',
		apiEndpoint: null,
	},

	// =====================================================
	// Fallback for unknown tasks
	// =====================================================
	default: {
		title: 'Optimize your site',
		description: 'Apply this optimization to improve your site.',
		tags: [TASK_TAGS.VISIBILITY],
		icon: 'Clipboard',
		emoji: '📋',
		actionType: 'mark-done',
		apiEndpoint: null,
	},
};

/**
 * Section to badge mapping
 * Maps backend section names to user-friendly badge labels
 */
export const SECTION_BADGES = {
	onpage: 'On-page SEO',
	sitereview: 'Site Review',
	mobile: 'Mobile',
	social: 'Social',
	popularity: 'Popularity',
};

/**
 * Get emoji for a task type
 *
 * @param {string} taskType - Task type identifier (task_id)
 * @returns {string} Emoji character
 */
export const getTaskEmoji = (taskType) => {
	const taskDef = TASK_DEFINITIONS[taskType] || TASK_DEFINITIONS.default;
	return taskDef.emoji;
};

/**
 * Get tags for a task type
 *
 * @param {string} taskType - Task type identifier (task_id)
 * @returns {string[]} Array of tag strings
 */
export const getTaskTags = (taskType) => {
	const taskDef = TASK_DEFINITIONS[taskType] || TASK_DEFINITIONS.default;
	return taskDef.tags;
};
