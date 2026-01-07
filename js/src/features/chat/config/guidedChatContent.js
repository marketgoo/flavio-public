/**
 * Guided Chat Content Configuration
 *
 * Task-specific conversation flows for GuidedTaskChat component.
 * Each task defines an intro and option-based navigation flow.
 *
 * Structure:
 * - intro: Initial message shown when opening chat
 * - [optionId]: Content for each navigation option
 * - Each step has: message, question (optional), options (optional)
 */

/**
 * Robots.txt task conversation flow
 */
const robotstxtContent = {
    intro: {
        message: `Hi! Let's take a closer look at this task "**Robots.txt. Guide for search engines**".`,
        description:
            'This file helps search engines understand which pages to crawl and which to skip, so your most valuable content gets visibility first.',
        question: '**Would you like to learn more about this task?**',
        options: [
            { id: 'why-important', label: "Why it's important" },
            { id: 'how-supports-goal', label: 'How it supports the goal' },
            { id: 'time-to-fix', label: 'Time to fix it' },
            { id: 'proposed-solution', label: 'Proposed solution' },
        ],
    },
    'why-important': {
        message:
            'Without a proper robots.txt, search engines might waste time on irrelevant pages or miss important ones. A correct setup improves indexing efficiency and boosts the chances of appearing in search results.',
        question: '**Would you like to learn more about this task?**',
        options: [
            { id: 'how-supports-goal', label: 'How it supports the goal' },
            { id: 'time-to-fix', label: 'Time to fix it' },
            { id: 'proposed-solution', label: 'Proposed solution' },
        ],
    },
    'how-supports-goal': {
        message:
            'By controlling which pages search engines crawl, we make sure your most important content is indexed first. This increases your visibility on Google and AI assistants, giving more potential customers a chance to discover your brand.',
        question: '**Would you like to learn more about this task?**',
        options: [
            { id: 'why-important', label: "Why it's important" },
            { id: 'time-to-fix', label: 'Time to fix it' },
            { id: 'proposed-solution', label: 'Proposed solution' },
        ],
    },
    'time-to-fix': {
        message: '1 click. Just review the prepared file and confirm to apply.',
        question: 'Would you like to learn more about this task?',
        options: [
            { id: 'why-important', label: "Why it's important" },
            { id: 'how-supports-goal', label: 'How it supports the goal' },
            { id: 'proposed-solution', label: 'Proposed solution' },
        ],
    },
    'proposed-solution': {
        message:
            "I've prepared a robots.txt file for your website:\n\nClick on **Apply** and I'll take care of the rest.",
        question: '',
        options: [
            { id: 'apply', label: 'Apply now' },
            { id: 'postpone', label: 'Postpone' },
        ],
    },
    apply: {
        message: "Great! I'm applying the changes now. You're doing great!",
        options: [{ id: 'close', label: 'Close chat' }],
    },
    postpone: {
        message:
            "No problem! We can come back to this task anytime. I'll remind you later, and you can focus on other tasks in the meantime.",
        options: [{ id: 'close', label: 'Close chat' }],
    },
};

/**
 * SSL/HTTPS Security task conversation flow
 */
const sslexistsContent = {
    intro: {
        message: `Hi! Let's take a closer look at this task: "**Secure Your Site with HTTPS**".`,
        description:
            "Your website isn't fully using HTTPS, which can affect visitors' trust and search visibility. I've prepared steps to help you update your SSL configuration.",
        question: 'Would you like to learn more about this task?',
        options: [
            { id: 'why-important', label: "Why it's important" },
            { id: 'how-supports-goal', label: 'How it supports the goal' },
            { id: 'time-to-fix', label: 'Time to fix it' },
            { id: 'how-to-fix', label: 'Steps to solve it' },
        ],
    },
    'why-important': {
        message:
            "HTTPS ensures data between your visitors and your site is encrypted. It protects your users and improves your site's credibility and ranking in Google.",
        question: 'Would you like to learn more about this task?',
        options: [
            { id: 'how-supports-goal', label: 'How it supports the goal' },
            { id: 'time-to-fix', label: 'Time to fix it' },
            { id: 'how-to-fix', label: 'Steps to solve it' },
        ],
    },
    'how-supports-goal': {
        message:
            'Search engines prefer secure sites, so HTTPS can improve rankings and visibility.',
        question: 'Would you like to learn more about this task?',
        options: [
            { id: 'why-important', label: "Why it's important" },
            { id: 'time-to-fix', label: 'Time to fix it' },
            { id: 'how-to-fix', label: 'Steps to solve it' },
        ],
    },
    'time-to-fix': {
        message: 'Just a few minutes to complete',
        question: 'Would you like to learn more about this task?',
        options: [
            { id: 'why-important', label: "Why it's important" },
            { id: 'how-supports-goal', label: 'How it supports the goal' },
            { id: 'how-to-fix', label: 'Steps to solve it' },
        ],
    },
    'how-to-fix': {
        message: `No worries. This one's easier than it sounds! Here's what I've prepared for you to secure your site step by step:

**Option A: Use your hosting panel**

1. Some hosting providers let you install an SSL manually even if it's not pre-included.
2. Log in to your hosting dashboard or cPanel.
3. Look for "SSL/TLS" or "Security" settings.
4. Choose "Install SSL certificate" and follow the on-screen instructions.
5. Many hosts provide a free certificate option there. Just select it and activate.

**Option B: Use Let's Encrypt (free SSL certificate)**

1. Let's Encrypt is a free, trusted SSL provider.
2. If your host doesn't offer SSL in the panel, you can get a certificate from https://letsencrypt.org.
3. Download the certificate and private key.
4. Go back to your hosting panel's SSL/TLS settings and upload the certificate and key.
5. Activate it. Your site will now run on https://.

Once the SSL is active, visit your site to check the 🔒 icon in your browser and confirm it's working.

You can **mark as done** when everything is set, or postpone it to focus on other improvements first.`,
        question: '',
        options: [
            { id: 'mark-done', label: 'Mark as done' },
            { id: 'postpone', label: 'Postpone' },
        ],
    },
    'mark-done': {
        message: "Great! Let's keep moving on your smart plan — you're doing great!",
        options: [{ id: 'close', label: 'Close chat' }],
    },
    postpone: {
        message:
            "No problem! We can come back to this task anytime. I'll remind you later, and you can focus on other tasks in the meantime.",
        options: [{ id: 'close', label: 'Close chat' }],
    },
};

/**
 * Broken Links (no404) task conversation flow
 */
const no404Content = {
    intro: {
        message: `Hi! Let's take a closer look at this task, "**Remove Broken Links on Content**".`,
        description:
            "Broken links can hurt your visitors' experience and reduce your visibility in search results. I've identified the links that need to be removed.",
        question: 'Would you like to learn more about this task?',
        options: [
            { id: 'why-important', label: "Why it's important" },
            { id: 'how-supports-goal', label: 'How it supports the goal' },
            { id: 'time-to-fix', label: 'Time to fix it' },
            { id: 'proposed-solution', label: 'Proposed solution' },
        ],
    },
    'why-important': {
        message:
            'Broken links send people to dead ends, which can break trust and lead them to leave your site. Search engines also see broken links as a quality issue, which can lower your rankings.',
        question: 'Would you like to learn more about this task?',
        options: [
            { id: 'how-supports-goal', label: 'How it supports the goal' },
            { id: 'time-to-fix', label: 'Time to fix it' },
            { id: 'proposed-solution', label: 'Proposed solution' },
        ],
    },
    'how-supports-goal': {
        message:
            "Removing broken links improves your site's technical quality, helping Google and AI assistants crawl it correctly and show it more often.",
        question: 'Would you like to learn more about this task?',
        options: [
            { id: 'why-important', label: "Why it's important" },
            { id: 'time-to-fix', label: 'Time to fix it' },
            { id: 'proposed-solution', label: 'Proposed solution' },
        ],
    },
    'time-to-fix': {
        message:
            "1 click! Review the links and click **Apply**. I'll remove them for you.",
        question: 'Would you like to learn more about this task?',
        options: [
            { id: 'why-important', label: "Why it's important" },
            { id: 'how-supports-goal', label: 'How it supports the goal' },
            { id: 'proposed-solution', label: 'Proposed solution' },
        ],
    },
    'proposed-solution': {
        message:
            "You just need to review and click Apply. I'll clean them up safely. If there are links you want to keep, you can postpone the task and handle them manually.",
        question: '',
        options: [
            { id: 'apply', label: 'Apply now' },
            { id: 'postpone', label: 'Postpone' },
        ],
    },
    apply: {
        message: "Great! I'm removing the broken links now. You're doing great!",
        options: [{ id: 'close', label: 'Close chat' }],
    },
    postpone: {
        message:
            "No problem! We can come back to this task anytime. I'll remind you later, and you can focus on other tasks in the meantime.",
        options: [{ id: 'close', label: 'Close chat' }],
    },
};

/**
 * Sitemap task conversation flow
 */
const sitemapContent = {
    intro: {
        message: `Hi! Let's take a closer look at this task, "**Sitemap. A map of all your website pages**".`,
        description:
            'A sitemap makes it easier for Google to understand your site structure and index all your pages, so more people can discover your business.',
        question: 'Would you like to learn more about this task?',
        options: [
            { id: 'why-important', label: "Why it's important" },
            { id: 'how-supports-goal', label: 'How it supports the goal' },
            { id: 'time-to-fix', label: 'Time to fix it' },
            { id: 'proposed-solution', label: 'Proposed solution' },
        ],
    },
    'why-important': {
        message:
            'A clear sitemap ensures search engines can find all your pages quickly. This helps your content appear reliably in search results, giving more people the chance to see your business online.',
        question: 'Would you like to learn more about this task?',
        options: [
            { id: 'how-supports-goal', label: 'How it supports the goal' },
            { id: 'time-to-fix', label: 'Time to fix it' },
            { id: 'proposed-solution', label: 'Proposed solution' },
        ],
    },
    'how-supports-goal': {
        message:
            'A sitemap ensures all your pages are discoverable by Google and AI assistants. More indexed pages = more opportunities for your brand to appear in search results and reach new audiences.',
        question: 'Would you like to learn more about this task?',
        options: [
            { id: 'why-important', label: "Why it's important" },
            { id: 'time-to-fix', label: 'Time to fix it' },
            { id: 'proposed-solution', label: 'Proposed solution' },
        ],
    },
    'time-to-fix': {
        message: '1 click. Just review and confirm to apply.',
        question: 'Would you like to learn more about this task?',
        options: [
            { id: 'why-important', label: "Why it's important" },
            { id: 'how-supports-goal', label: 'How it supports the goal' },
            { id: 'proposed-solution', label: 'Proposed solution' },
        ],
    },
    'proposed-solution': {
        message:
            "I've prepared an optimized sitemap for your website:\n\nClick **Apply** and I handle the rest for you.",
        question: '',
        options: [
            { id: 'apply', label: 'Apply now' },
            { id: 'postpone', label: 'Postpone' },
        ],
    },
    apply: {
        message: "Great! I'm applying the changes now. You're doing great!",
        options: [{ id: 'close', label: 'Close chat' }],
    },
    postpone: {
        message:
            "No problem! We can come back to this task anytime. I'll remind you later, and you can focus on other tasks in the meantime.",
        options: [{ id: 'close', label: 'Close chat' }],
    },
};

/**
 * Structured Data task conversation flow
 */
const structureddataContent = {
    intro: {
        message: '', // Will be populated dynamically with task.title
        description: '', // Will be populated dynamically with task.description
        question: '**Would you like to learn more about this task?**',
        options: [
            { id: 'why-important', label: "Why it's important" },
            { id: 'how-supports-goal', label: 'How it supports your goal' },
            { id: 'time-to-fix', label: 'Time to fix it' },
            { id: 'proposed-solution', label: 'Proposed solution' },
            { id: 'postpone', label: 'Postpone' },
            { id: 'mark-done', label: 'Mark as done' },
        ],
    },
    'why-important': {
        message:
            'Structured data gives Google clear information about your website — like what your business offers, your products or services, and other key details.\n\nThis helps your pages appear more attractively in search results, with rich snippets that catch attention and build trust.',
        question: '**What would you like to do next?**',
        options: [
            { id: 'how-supports-goal', label: 'How it supports your goal' },
            { id: 'time-to-fix', label: 'Time to fix it' },
            { id: 'proposed-solution', label: 'Proposed solution' },
            { id: 'postpone', label: 'Postpone' },
            { id: 'mark-done', label: 'Mark as done' },
        ],
    },
    'how-supports-goal': {
        message:
            'Structured data helps Google and AI assistants understand your business, products, or services more clearly. This improves your visibility in search results, making it easier for people to find you online.',
        question: '**What would you like to do next?**',
        options: [
            { id: 'why-important', label: "Why it's important" },
            { id: 'time-to-fix', label: 'Time to fix it' },
            { id: 'proposed-solution', label: 'Proposed solution' },
            { id: 'postpone', label: 'Postpone' },
            { id: 'mark-done', label: 'Mark as done' },
        ],
    },
    'time-to-fix': {
        message:
            'The time needed depends on your setup, but typically it takes around 15-30 minutes to add basic structured data to your homepage.',
        question: '**What would you like to do next?**',
        options: [
            { id: 'why-important', label: "Why it's important" },
            { id: 'how-supports-goal', label: 'How it supports your goal' },
            { id: 'proposed-solution', label: 'Proposed solution' },
            { id: 'postpone', label: 'Postpone' },
            { id: 'mark-done', label: 'Mark as done' },
        ],
    },
    'proposed-solution': {
        message:
            "I can help you add the right structured data to your homepage based on your business type. Once you're ready, I'll guide you through the process step by step.",
        question: '**What would you like to do next?**',
        options: [
            { id: 'why-important', label: "Why it's important" },
            { id: 'how-supports-goal', label: 'How it supports your goal' },
            { id: 'time-to-fix', label: 'Time to fix it' },
            { id: 'postpone', label: 'Postpone' },
            { id: 'mark-done', label: 'Mark as done' },
        ],
    },
    postpone: {
        message:
            "No problem! We can come back to this task anytime. I'll remind you later, and you can focus on other tasks in the meantime.",
        options: [{ id: 'close', label: 'Close chat' }],
    },
    'mark-done': {
        message: "Great!! Let's keep moving on your smart plan — you're doing great!",
        options: [{ id: 'close', label: 'Close chat' }],
    },
    'need-help': {
        message:
            "I'd love to give you more info right now, but this is all I can provide for this task. Don't worry — if you're not sure about this right now, we can focus on other things and come back to it later.",
        options: [{ id: 'close', label: 'Close chat' }],
    },
};

/**
 * Noindex tags detection task conversation flow
 */
const noindexContent = {
    intro: {
        message: `Hi! Let's take a closer look at this task, "**Detecting 'noindex' tags on content**".`,
        description:
            'Pages with "noindex" tags won\'t appear in search results, which can hide valuable content from your audience.',
        question: 'Would you like to learn more about this task?',
        options: [
            { id: 'why-important', label: "Why it's important" },
            { id: 'how-supports-goal', label: 'How it supports the goal' },
            { id: 'time-to-fix', label: 'Time to fix it' },
            { id: 'proposed-solution', label: 'Proposed solution' },
        ],
    },
    'why-important': {
        message:
            '"noindex" tags prevent search engines from showing your pages. If important pages are blocked, fewer potential visitors will find your website, limiting growth.',
        question: 'Would you like to learn more about this task?',
        options: [
            { id: 'how-supports-goal', label: 'How it supports the goal' },
            { id: 'time-to-fix', label: 'Time to fix it' },
            { id: 'proposed-solution', label: 'Proposed solution' },
        ],
    },
    'how-supports-goal': {
        message:
            'Detecting and fixing "noindex" tags ensures your key pages are indexed. More visible pages = more chances for people to discover your brand on search engines and AI assistants.',
        question: 'Would you like to learn more about this task?',
        options: [
            { id: 'why-important', label: "Why it's important" },
            { id: 'time-to-fix', label: 'Time to fix it' },
            { id: 'proposed-solution', label: 'Proposed solution' },
        ],
    },
    'time-to-fix': {
        message: '1 click. Review the flagged pages and confirm.',
        question: 'Would you like to learn more about this task?',
        options: [
            { id: 'why-important', label: "Why it's important" },
            { id: 'how-supports-goal', label: 'How it supports the goal' },
            { id: 'proposed-solution', label: 'Proposed solution' },
        ],
    },
    'proposed-solution': {
        message:
            'You just need to review the list and click **Apply**. I\'ll handle the updates to change them from "noindex" to indexed (so visible for search engines).\n\nSometimes there are pages you may want to keep as "noindex" (private or temporary content). You can postpone the task and handle those manually if needed.',
        question: '',
        options: [
            { id: 'apply', label: 'Apply now' },
            { id: 'postpone', label: 'Postpone' },
        ],
    },
    apply: {
        message:
            'Great! I\'ve removed the "noindex" tag from your selected pages, and they are now visible to search engines, helping your site reach more people.',
        options: [{ id: 'close', label: 'Close chat' }],
    },
    postpone: {
        message:
            "No problem! We'll pause this task for now, and you can review it later. Meanwhile, we'll keep moving forward on other improvements to boost your website.",
        options: [{ id: 'close', label: 'Close chat' }],
    },
};

/**
 * Blocked crawlers task conversation flow
 */
const blockedcrawlersContent = {
    intro: {
        message: `Hi! Let's take a closer look at this task, "**Blocked Crawlers**".`,
        description:
            "Some pages on your site are restricted from being read by search engines and AI tools. I've checked your site and prepared a list of these pages.",
        question: 'Would you like to learn more about this task?',
        options: [
            { id: 'why-important', label: "Why it's important" },
            { id: 'how-supports-goal', label: 'How it supports the goal' },
            { id: 'time-to-fix', label: 'Time to fix it' },
            { id: 'proposed-solution', label: 'Proposed solution' },
        ],
    },
    'why-important': {
        message:
            "Pages blocked from crawlers won't appear in search results or AI tools. Fixing this increases your site's visibility and ensures more potential customers can find you.",
        question: 'Would you like to learn more about this task?',
        options: [
            { id: 'how-supports-goal', label: 'How it supports the goal' },
            { id: 'time-to-fix', label: 'Time to fix it' },
            { id: 'proposed-solution', label: 'Proposed solution' },
        ],
    },
    'how-supports-goal': {
        message:
            'With these fixes, your website becomes fully visible to Google and AI assistants. More indexed pages mean more chances for potential customers to find your business and see your brand online.',
        question: 'Would you like to learn more about this task?',
        options: [
            { id: 'why-important', label: "Why it's important" },
            { id: 'time-to-fix', label: 'Time to fix it' },
            { id: 'proposed-solution', label: 'Proposed solution' },
        ],
    },
    'time-to-fix': {
        message: "One click! Review the list and click **Apply**. I'll take care of the updates.",
        question: 'Would you like to learn more about this task?',
        options: [
            { id: 'why-important', label: "Why it's important" },
            { id: 'how-supports-goal', label: 'How it supports the goal' },
            { id: 'proposed-solution', label: 'Proposed solution' },
        ],
    },
    'proposed-solution': {
        message:
            'You can review the blocked pages and click **Apply** to allow search engines and AI to read these pages. If some pages should remain blocked (private content or temporary pages), you can postpone the task and handle them manually.',
        question: '',
        options: [
            { id: 'apply', label: 'Apply now' },
            { id: 'postpone', label: 'Postpone' },
        ],
    },
    apply: {
        message:
            "Great! I've updated the restrictions. Your selected pages are now visible to search engines and AI tools, helping your website reach more people.",
        options: [{ id: 'close', label: 'Close chat' }],
    },
    postpone: {
        message:
            "No problem! I'll remove this task temporarily, and meanwhile, we can continue working on other actions. You can come back anytime to review and apply these fixes.",
        options: [{ id: 'close', label: 'Close chat' }],
    },
};

/**
 * Google Search Console setup task conversation flow
 */
const googlesearchconsoleContent = {
    intro: {
        message: `Hi! Let's take a closer look at this task: **Set up Google Search Console**.`,
        description:
            "I've prepared your site to connect with Google Search Console. This will allow you to track search performance and page indexing.",
        question: 'Would you like to learn more about this task?',
        options: [
            { id: 'why-important', label: "Why it's important" },
            { id: 'how-supports-goal', label: 'How it supports the goal' },
            { id: 'time-to-fix', label: 'Time to fix it' },
            { id: 'how-to-fix', label: 'Steps to solve it' },
        ],
    },
    'why-important': {
        message:
            "Connecting to Google Search Console lets you monitor how Google sees your site. You'll know which pages are indexed, which keywords bring traffic, and spot issues before they affect performance.",
        question: 'Would you like to learn more about this task?',
        options: [
            { id: 'how-supports-goal', label: 'How it supports the goal' },
            { id: 'time-to-fix', label: 'Time to fix it' },
            { id: 'how-to-fix', label: 'Steps to solve it' },
        ],
    },
    'how-supports-goal': {
        message:
            'Monitor page indexing, optimize high-potential pages, and spot opportunities to reach more people.',
        question: 'Would you like to learn more about this task?',
        options: [
            { id: 'why-important', label: "Why it's important" },
            { id: 'time-to-fix', label: 'Time to fix it' },
            { id: 'how-to-fix', label: 'Steps to solve it' },
        ],
    },
    'time-to-fix': {
        message: 'A few minutes.',
        question: 'Would you like to learn more about this task?',
        options: [
            { id: 'why-important', label: "Why it's important" },
            { id: 'how-supports-goal', label: 'How it supports the goal' },
            { id: 'how-to-fix', label: 'Steps to solve it' },
        ],
    },
    'how-to-fix': {
        message: `No worries. It's simpler than it sounds. Here's what to do:

1. Click the "**Authorize Now**" button.
2. Log in to your Google account and allow Flavio to connect your site to Google Search Console.
3. Confirm the authorization.

That's it! Once connected, your site will start sending search data to Google Search Console.

You can **mark as done** when everything is set, or postpone it to focus on other improvements first.`,
        question: '',
        options: [
            { id: 'mark-done', label: 'Mark as done' },
            { id: 'postpone', label: 'Postpone' },
        ],
    },
    'mark-done': {
        message:
            "Great! Your site is now connected to Google Search Console. You can start tracking search data immediately.\n\nLet's keep moving on your smart plan — you're doing great!",
        options: [{ id: 'close', label: 'Close chat' }],
    },
    postpone: {
        message:
            "No problem! We can skip this for now. You can connect it later, and meanwhile, we can focus on other tasks to improve your site.",
        options: [{ id: 'close', label: 'Close chat' }],
    },
};

/**
 * Google Analytics setup task conversation flow
 */
const googleanalyticsContent = {
    intro: {
        message: `Hi! Let's take a closer look at this task: **Set up Google Analytics**.`,
        description:
            "I've prepared your site to connect with Google Analytics. This will allow you to track how visitors interact with your pages.",
        question: 'Would you like to learn more about this task?',
        options: [
            { id: 'why-important', label: "Why it's important" },
            { id: 'how-supports-goal', label: 'How it supports the goal' },
            { id: 'time-to-fix', label: 'Time to fix it' },
            { id: 'how-to-fix', label: 'Steps to solve it' },
        ],
    },
    'why-important': {
        message:
            "Google Analytics gives you insights into visitor behavior, traffic sources, and engagement. This helps you make informed decisions to improve your site's performance.",
        question: 'Would you like to learn more about this task?',
        options: [
            { id: 'how-supports-goal', label: 'How it supports the goal' },
            { id: 'time-to-fix', label: 'Time to fix it' },
            { id: 'how-to-fix', label: 'Steps to solve it' },
        ],
    },
    'how-supports-goal': {
        message:
            'Identify pages that attract traffic and see which campaigns are most effective. Track visitor behavior to optimize conversions and improve lead generation.',
        question: 'Would you like to learn more about this task?',
        options: [
            { id: 'why-important', label: "Why it's important" },
            { id: 'time-to-fix', label: 'Time to fix it' },
            { id: 'how-to-fix', label: 'Steps to solve it' },
        ],
    },
    'time-to-fix': {
        message: 'A few minutes.',
        question: 'Would you like to learn more about this task?',
        options: [
            { id: 'why-important', label: "Why it's important" },
            { id: 'how-supports-goal', label: 'How it supports the goal' },
            { id: 'how-to-fix', label: 'Steps to solve it' },
        ],
    },
    'how-to-fix': {
        message: `It's quick and easy. Just follow these steps:

1. Click the "**Authorize Now**" button.
2. Log in to your Google account and allow Flavio to connect your site to Google Analytics.
3. Confirm the authorization.

Now your site will start sending visitor data to Google Analytics.

You can **mark as done** when everything is set, or postpone it to focus on other improvements first.`,
        question: '',
        options: [
            { id: 'mark-done', label: 'Mark as done' },
            { id: 'postpone', label: 'Postpone' },
        ],
    },
    'mark-done': {
        message:
            "Great! Your site is now connected to Google Analytics. You can start seeing visitor data right away.\n\nLet's keep moving on your smart plan — you're doing great!",
        options: [{ id: 'close', label: 'Close chat' }],
    },
    postpone: {
        message:
            "No problem! We can postpone this for now. You can authorize it later while we continue working on other improvements for your site.",
        options: [{ id: 'close', label: 'Close chat' }],
    },
};

/**
 * Site name and tagline task conversation flow
 */
const sitenametaglineContent = {
    intro: {
        message: `Hi! Let's take a closer look at this task: **Setting your site name and tagline**.`,
        description:
            "I've suggested options that better represent your website and help it achieve its goals.",
        question: 'Would you like to learn more about this task?',
        options: [
            { id: 'why-important', label: "Why it's important" },
            { id: 'how-supports-goal', label: 'How it supports the goal' },
            { id: 'time-to-fix', label: 'Time to fix it' },
            { id: 'proposed-solution', label: 'Proposed solution' },
        ],
    },
    'why-important': {
        message:
            'A clear site name and tagline help visitors understand what your website offers and improve recognition in search engines.',
        question: 'Would you like to learn more about this task?',
        options: [
            { id: 'how-supports-goal', label: 'How it supports the goal' },
            { id: 'time-to-fix', label: 'Time to fix it' },
            { id: 'proposed-solution', label: 'Proposed solution' },
        ],
    },
    'how-supports-goal': {
        message:
            'A clear site name and tagline improve branding signals, helping search engines and AI assistants recognize your website\'s value. An appealing and descriptive name/tagline helps new visitors quickly understand what you offer, boosting engagement and conversions.',
        question: 'Would you like to learn more about this task?',
        options: [
            { id: 'why-important', label: "Why it's important" },
            { id: 'time-to-fix', label: 'Time to fix it' },
            { id: 'proposed-solution', label: 'Proposed solution' },
        ],
    },
    'time-to-fix': {
        message: '1 click. I handle the rest.',
        question: 'Would you like to learn more about this task?',
        options: [
            { id: 'why-important', label: "Why it's important" },
            { id: 'how-supports-goal', label: 'How it supports the goal' },
            { id: 'proposed-solution', label: 'Proposed solution' },
        ],
    },
    'proposed-solution': {
        message:
            "I've prepared an optimized site name and tagline for your website.\n\nClick **Apply** and I'll update them for you.",
        question: '',
        options: [
            { id: 'apply', label: 'Apply now' },
            { id: 'postpone', label: 'Postpone' },
        ],
    },
    apply: {
        message:
            "Great! I've updated your site name and tagline. Your website now communicates its value more clearly, supporting your visibility and goals.",
        options: [{ id: 'close', label: 'Close chat' }],
    },
    postpone: {
        message:
            "No problem! You can postpone this task for now. Meanwhile, we can continue working on other tasks to improve your site.",
        options: [{ id: 'close', label: 'Close chat' }],
    },
};

/**
 * Outdated plugins task conversation flow
 */
const outdatedpluginsContent = {
    intro: {
        message: `Hi! Let's take a closer look at this task: **Updating outdated plugins**.`,
        description:
            'Some of your plugins are running older versions, which can affect performance, stability, and security.',
        question: 'Would you like to learn more about this task?',
        options: [
            { id: 'why-important', label: "Why it's important" },
            { id: 'how-supports-goal', label: 'How it supports the goal' },
            { id: 'time-to-fix', label: 'Time to fix it' },
            { id: 'proposed-solution', label: 'Proposed solution' },
        ],
    },
    'why-important': {
        message:
            "Plugins power key features on your site, but when they're outdated, things can break or slow down. Updating them keeps your site fast, secure, and functioning as expected.",
        question: 'Would you like to learn more about this task?',
        options: [
            { id: 'how-supports-goal', label: 'How it supports the goal' },
            { id: 'time-to-fix', label: 'Time to fix it' },
            { id: 'proposed-solution', label: 'Proposed solution' },
        ],
    },
    'how-supports-goal': {
        message:
            'Search engines prefer fast, stable websites. Updated plugins help reduce errors and improve performance, which supports better visibility. Visitors stay longer and convert better when your website loads quickly and everything works smoothly.',
        question: 'Would you like to learn more about this task?',
        options: [
            { id: 'why-important', label: "Why it's important" },
            { id: 'time-to-fix', label: 'Time to fix it' },
            { id: 'proposed-solution', label: 'Proposed solution' },
        ],
    },
    'time-to-fix': {
        message: "1 click. I'll update everything for you.",
        question: 'Would you like to learn more about this task?',
        options: [
            { id: 'why-important', label: "Why it's important" },
            { id: 'how-supports-goal', label: 'How it supports the goal' },
            { id: 'proposed-solution', label: 'Proposed solution' },
        ],
    },
    'proposed-solution': {
        message:
            "Once you click **Apply**, I'll update all outdated plugins safely for you and notify you when everything is complete.\n\nWould you like me to perform the update?",
        question: '',
        options: [
            { id: 'apply', label: 'Apply now' },
            { id: 'postpone', label: 'Postpone' },
        ],
    },
    apply: {
        message: "Great! I'll handle everything for you. Your plugins are being updated now.",
        options: [{ id: 'close', label: 'Close chat' }],
    },
    postpone: {
        message: "No problem. I'll hide this task for now. You can come back to it anytime.",
        options: [{ id: 'close', label: 'Close chat' }],
    },
};

/**
 * Permalinks/URL structure task conversation flow
 */
const friendlyurlContent = {
    intro: {
        message: `Hi! Let's take a closer look at this task: **Configure your site's URLs for better SEO**.`,
        description:
            'Proper URL structure makes it easier for search engines to index your content and improves how your pages appear in search results.',
        question: 'Would you like to learn more about this task?',
        options: [
            { id: 'why-important', label: "Why it's important" },
            { id: 'how-supports-goal', label: 'How it supports the goal' },
            { id: 'time-to-fix', label: 'Time to fix it' },
            { id: 'proposed-solution', label: 'Proposed solution' },
        ],
    },
    'why-important': {
        message:
            'SEO-friendly URLs improve readability and help both users and search engines understand what each page is about. Consistent structure makes your site more professional and trustworthy.',
        question: 'Would you like to learn more about this task?',
        options: [
            { id: 'how-supports-goal', label: 'How it supports the goal' },
            { id: 'time-to-fix', label: 'Time to fix it' },
            { id: 'proposed-solution', label: 'Proposed solution' },
        ],
    },
    'how-supports-goal': {
        message:
            "Optimizing your URLs makes your pages easier to read for search engines and AI assistants. Clear URLs increase chances of appearing in search results, helping more potential customers discover your website.",
        question: 'Would you like to learn more about this task?',
        options: [
            { id: 'why-important', label: "Why it's important" },
            { id: 'time-to-fix', label: 'Time to fix it' },
            { id: 'proposed-solution', label: 'Proposed solution' },
        ],
    },
    'time-to-fix': {
        message: '1 click. I handle the rest.',
        question: 'Would you like to learn more about this task?',
        options: [
            { id: 'why-important', label: "Why it's important" },
            { id: 'how-supports-goal', label: 'How it supports the goal' },
            { id: 'proposed-solution', label: 'Proposed solution' },
        ],
    },
    'proposed-solution': {
        message:
            "You can review the proposed URL structure and click **Apply Now**. I'll update all your URLs automatically.",
        question: '',
        options: [
            { id: 'apply', label: 'Apply now' },
            { id: 'postpone', label: 'Postpone' },
        ],
    },
    apply: {
        message:
            "Perfect! I'll update the URLs with the new SEO-friendly structure. Your site will become easier to navigate and more visible in search results.",
        options: [{ id: 'close', label: 'Close chat' }],
    },
    postpone: {
        message:
            "No problem! I'll remove this task for now, and we can continue improving other parts of your site.",
        options: [{ id: 'close', label: 'Close chat' }],
    },
};

/**
 * Homepage metas (title/H1) task conversation flow
 */
const homepagemetasContent = {
    intro: {
        message: `Hi! Let's take a closer look at this task: **Review and optimize homepage title (H1) and metas**.`,
        description:
            "I've prepared suggestions to make your homepage title and meta tags clearer, more engaging, and aligned with your goals.",
        question: 'Would you like to learn more about this task?',
        options: [
            { id: 'why-important', label: "Why it's important" },
            { id: 'how-supports-goal', label: 'How it supports the goal' },
            { id: 'time-to-fix', label: 'Time to fix it' },
            { id: 'proposed-solution', label: 'Proposed solution' },
        ],
    },
    'why-important': {
        message:
            'Your homepage title and meta tags are critical for helping search engines understand your site and for encouraging users to click. Optimizing them can increase visibility and attract more visitors.',
        question: 'Would you like to learn more about this task?',
        options: [
            { id: 'how-supports-goal', label: 'How it supports the goal' },
            { id: 'time-to-fix', label: 'Time to fix it' },
            { id: 'proposed-solution', label: 'Proposed solution' },
        ],
    },
    'how-supports-goal': {
        message:
            'Optimized titles and metas make your homepage more discoverable in Google and AI assistants. Clear and relevant metas encourage clicks from potential customers searching for your services.',
        question: 'Would you like to learn more about this task?',
        options: [
            { id: 'why-important', label: "Why it's important" },
            { id: 'time-to-fix', label: 'Time to fix it' },
            { id: 'proposed-solution', label: 'Proposed solution' },
        ],
    },
    'time-to-fix': {
        message: '1 click. I handle the rest.',
        question: 'Would you like to learn more about this task?',
        options: [
            { id: 'why-important', label: "Why it's important" },
            { id: 'how-supports-goal', label: 'How it supports the goal' },
            { id: 'proposed-solution', label: 'Proposed solution' },
        ],
    },
    'proposed-solution': {
        message:
            "I've prepared optimized title and meta tags for your homepage.\n\n*Meta tags are snippets of text that describe a page's content. They don't appear on the page itself but help search engines understand your content and show it in search results.*\n\nYou can review these suggestions and click **Apply**. I'll update your homepage automatically.",
        question: '',
        options: [
            { id: 'apply', label: 'Apply now' },
            { id: 'postpone', label: 'Postpone' },
        ],
    },
    apply: {
        message:
            "Perfect! I'll update your homepage title and metas. Your homepage will become clearer, more engaging, and aligned with your goals, helping your site perform better in search results.",
        options: [{ id: 'close', label: 'Close chat' }],
    },
    postpone: {
        message:
            "No problem! We'll leave the current title and metas as they are for now. Meanwhile, we can continue working on other tasks.",
        options: [{ id: 'close', label: 'Close chat' }],
    },
};

/**
 * Homepage structured data task conversation flow
 */
const homepagestructureddataContent = {
    intro: {
        message: `Hi! Let's take a closer look at this task: **Add structured data to your homepage**.`,
        description:
            'Organizing your content helps search engines show your services more clearly and can improve how often your pages appear in search results.',
        question: 'Would you like to learn more about this task?',
        options: [
            { id: 'why-important', label: "Why it's important" },
            { id: 'how-supports-goal', label: 'How it supports the goal' },
            { id: 'time-to-fix', label: 'Time to fix it' },
            { id: 'proposed-solution', label: 'Proposed solution' },
        ],
    },
    'why-important': {
        message:
            'Structured content helps search engines understand your website. The clearer Google sees your services, the better your chances of appearing in relevant searches.',
        question: 'Would you like to learn more about this task?',
        options: [
            { id: 'how-supports-goal', label: 'How it supports the goal' },
            { id: 'time-to-fix', label: 'Time to fix it' },
            { id: 'proposed-solution', label: 'Proposed solution' },
        ],
    },
    'how-supports-goal': {
        message:
            'By improving the structure of your homepage, your content is easier for Google and AI assistants to understand. This helps your pages appear more often in search results, giving more people the chance to discover your business.',
        question: 'Would you like to learn more about this task?',
        options: [
            { id: 'why-important', label: "Why it's important" },
            { id: 'time-to-fix', label: 'Time to fix it' },
            { id: 'proposed-solution', label: 'Proposed solution' },
        ],
    },
    'time-to-fix': {
        message: '1 click. I handle the rest.',
        question: 'Would you like to learn more about this task?',
        options: [
            { id: 'why-important', label: "Why it's important" },
            { id: 'how-supports-goal', label: 'How it supports the goal' },
            { id: 'proposed-solution', label: 'Proposed solution' },
        ],
    },
    'proposed-solution': {
        message:
            "I've prepared a structured data setup for your homepage. Take a look and review it. If everything looks good, click **Apply** and I'll implement this structured data for you.",
        question: '',
        options: [
            { id: 'apply', label: 'Apply now' },
            { id: 'postpone', label: 'Postpone' },
        ],
    },
    apply: {
        message:
            "Perfect! I'll update the structured data on your homepage. Your content will be easier for Google and AI assistants to understand, improving visibility.",
        options: [{ id: 'close', label: 'Close chat' }],
    },
    postpone: {
        message:
            "No problem! You can postpone this task and continue working on other improvements.",
        options: [{ id: 'close', label: 'Close chat' }],
    },
};

/**
 * Contact page metas task conversation flow
 */
const contactpagemetasContent = {
    intro: {
        message: `Hi! Let's take a closer look at this task "**Improved homepage title and description**".`,
        description:
            "Your homepage title and description play a big role in how your site is understood by both visitors and search engines. I've prepared improved versions that are more aligned with your objectives.",
        question: 'Would you like to learn more about this task?',
        options: [
            { id: 'why-important', label: "Why it's important" },
            { id: 'how-supports-goal', label: 'How it supports the goal' },
            { id: 'time-to-fix', label: 'Time to fix it' },
            { id: 'proposed-solution', label: 'Proposed solution' },
        ],
    },
    'why-important': {
        message:
            "The homepage title and description are part of your page's metadata. Metadata is information that tells search engines and AI assistants what your page is about.\n\nStrong clear metadata improves how your site appears in search results, helps visitors quickly understand your business, and builds trust in your brand.",
        question: 'Would you like to learn more about this task?',
        options: [
            { id: 'how-supports-goal', label: 'How it supports the goal' },
            { id: 'time-to-fix', label: 'Time to fix it' },
            { id: 'proposed-solution', label: 'Proposed solution' },
        ],
    },
    'how-supports-goal': {
        message:
            'Optimized homepage metadata helps search engines and AI assistants understand your business better. Clear titles and descriptions increase chances to appear in relevant searches and improve visibility.',
        question: 'Would you like to learn more about this task?',
        options: [
            { id: 'why-important', label: "Why it's important" },
            { id: 'time-to-fix', label: 'Time to fix it' },
            { id: 'proposed-solution', label: 'Proposed solution' },
        ],
    },
    'time-to-fix': {
        message: '1 click — I handle the rest.',
        question: 'Would you like to learn more about this task?',
        options: [
            { id: 'why-important', label: "Why it's important" },
            { id: 'how-supports-goal', label: 'How it supports the goal' },
            { id: 'proposed-solution', label: 'Proposed solution' },
        ],
    },
    'proposed-solution': {
        message:
            "I've prepared an optimized title and description for your homepage. If everything looks good, I can apply these changes for you.\n\nWhat would you like to do next?",
        question: '',
        options: [
            { id: 'apply', label: 'Apply now' },
            { id: 'postpone', label: 'Postpone' },
        ],
    },
    apply: {
        message:
            "Perfect. I will update your homepage title and metadata. This helps your site clearly communicate its value and improves how search engines and AI assistants understand and show your pages.",
        options: [{ id: 'close', label: 'Close chat' }],
    },
    postpone: {
        message:
            "No problem. I'll set this aside for now. Meanwhile, we can keep improving other parts of your site.",
        options: [{ id: 'close', label: 'Close chat' }],
    },
};

/**
 * Contact info task conversation flow
 */
const contactinfoContent = {
    intro: {
        message: `Hi! Let's take a closer look at this task: **Your contact information is missing or incomplete**.`,
        description:
            'Clear contact details help users reach you easily and make your business look more trustworthy.',
        question:
            'To update them, I need a bit of information from you. What is your business phone number, email address and physical address?',
        options: [
            { id: 'why-important', label: "Why it's important" },
            { id: 'how-supports-goal', label: 'How it supports the goal' },
            { id: 'time-to-fix', label: 'Time to fix it' },
            { id: 'proposed-solution', label: 'Proposed solution' },
        ],
    },
    'why-important': {
        message:
            "Your contact details are part of your site's core trust signals. Visitors rely on them to get in touch and search engines use them to understand your business better.\n\nMissing contact information can reduce confidence and affect how well your business appears in search.",
        question: 'Would you like to learn more about this task?',
        options: [
            { id: 'how-supports-goal', label: 'How it supports the goal' },
            { id: 'time-to-fix', label: 'Time to fix it' },
            { id: 'proposed-solution', label: 'Proposed solution' },
        ],
    },
    'how-supports-goal': {
        message:
            'Search engines use your contact details to confirm your business identity. Adding them helps your site appear more reliably in search and improves local visibility. Clear contact information makes it easier for potential customers to call, email or find your business.',
        question: 'Would you like to learn more about this task?',
        options: [
            { id: 'why-important', label: "Why it's important" },
            { id: 'time-to-fix', label: 'Time to fix it' },
            { id: 'proposed-solution', label: 'Proposed solution' },
        ],
    },
    'time-to-fix': {
        message: "1 click — just provide your contact details and I'll handle the rest.",
        question: 'Would you like to learn more about this task?',
        options: [
            { id: 'why-important', label: "Why it's important" },
            { id: 'how-supports-goal', label: 'How it supports the goal' },
            { id: 'proposed-solution', label: 'Proposed solution' },
        ],
    },
    'proposed-solution': {
        message:
            "If everything looks correct, just click **Apply** and I'll add the information to your site so visitors can reach you easily.",
        question: '',
        options: [
            { id: 'apply', label: 'Apply now' },
            { id: 'postpone', label: 'Postpone' },
        ],
    },
    apply: {
        message:
            "Great! I will update your contact information across your site. Your visitors will have a clear and reliable way to reach you, which helps build trust and improves your visibility.",
        options: [{ id: 'close', label: 'Close chat' }],
    },
    postpone: {
        message:
            "No worries. I'll set this aside for now. Meanwhile, we can keep improving other parts of your site.",
        options: [{ id: 'close', label: 'Close chat' }],
    },
};

/**
 * Contact page geo data task conversation flow
 */
const contactpagegeodataContent = {
    intro: {
        message: `Hi! Let's take a closer look at this task: **Add structured data to your contact page with geo info**.`,
        description:
            'Structured data helps your business appear in local searches and makes it easier for customers nearby to find you.',
        question:
            "I'll need your contact information (email, address, and phone number) to update your contact page with local details. Can you provide them?",
        options: [
            { id: 'why-important', label: "Why it's important" },
            { id: 'how-supports-goal', label: 'How it supports the goal' },
            { id: 'time-to-fix', label: 'Time to fix it' },
            { id: 'proposed-solution', label: 'Proposed solution' },
        ],
    },
    'why-important': {
        message:
            'Adding geo data and structured information to your contact page improves local search relevance. Google can show your business in nearby search results, helping potential customers find you faster.',
        question: 'Would you like to learn more about this task?',
        options: [
            { id: 'how-supports-goal', label: 'How it supports the goal' },
            { id: 'time-to-fix', label: 'Time to fix it' },
            { id: 'proposed-solution', label: 'Proposed solution' },
        ],
    },
    'how-supports-goal': {
        message:
            'With your contact information structured, Google and AI assistants can show your business correctly in search results and maps. More accurate info means higher chances people find and recognize your brand. Structured contact info helps local searchers reach your business faster.',
        question: 'Would you like to learn more about this task?',
        options: [
            { id: 'why-important', label: "Why it's important" },
            { id: 'time-to-fix', label: 'Time to fix it' },
            { id: 'proposed-solution', label: 'Proposed solution' },
        ],
    },
    'time-to-fix': {
        message: "1 click — just provide the contact details and we'll set it up.",
        question: 'Would you like to learn more about this task?',
        options: [
            { id: 'why-important', label: "Why it's important" },
            { id: 'how-supports-goal', label: 'How it supports the goal' },
            { id: 'proposed-solution', label: 'Proposed solution' },
        ],
    },
    'proposed-solution': {
        message:
            "I've got your contact information. Click **Apply** to update your contact page so local search results show accurate details and help more customers reach you.",
        question: '',
        options: [
            { id: 'apply', label: 'Apply now' },
            { id: 'postpone', label: 'Postpone' },
        ],
    },
    apply: {
        message:
            "Perfect! I will update your contact page with local structured data. Nearby customers and search engines can find your business more easily.",
        options: [{ id: 'close', label: 'Close chat' }],
    },
    postpone: {
        message:
            "No worries. I'll put this task on hold for now, and we can keep making progress on other areas of your site in the meantime.",
        options: [{ id: 'close', label: 'Close chat' }],
    },
};

/**
 * Default/fallback content for unknown tasks
 */
const defaultContent = {
    intro: {
        message: '', // Will be populated dynamically with task.title
        description: '', // Will be populated dynamically with task.description
        question: '**Would you like to learn more about this task?**',
        options: [
            { id: 'postpone', label: 'Postpone' },
            { id: 'mark-done', label: 'Mark as done' },
        ],
    },
    postpone: {
        message:
            "No problem! We can come back to this task anytime. I'll remind you later, and you can focus on other tasks in the meantime.",
        options: [{ id: 'close', label: 'Close chat' }],
    },
    'mark-done': {
        message: "Great!! Let's keep moving on your smart plan — you're doing great!",
        options: [{ id: 'close', label: 'Close chat' }],
    },
    'need-help': {
        message:
            "I'd love to give you more info right now, but this is all I can provide for this task. Don't worry — if you're not sure about this right now, we can focus on other things and come back to it later.",
        options: [{ id: 'close', label: 'Close chat' }],
    },
};

/**
 * Map of taskId to content configuration
 */
export const TASK_CHAT_CONTENT = {
    // Original tasks
    robotstxt: robotstxtContent,
    sslexists: sslexistsContent,
    no404: no404Content,
    sitemap: sitemapContent,
    structureddata: structureddataContent,

    // New tasks
    noindex: noindexContent,
    blockedcrawlers: blockedcrawlersContent,
    googlesearchconsole: googlesearchconsoleContent,
    googleanalytics: googleanalyticsContent,
    sitenametagline: sitenametaglineContent,
    outdatedplugins: outdatedpluginsContent,
    friendlyurl: friendlyurlContent,
    homepagemetas: homepagemetasContent,
    structureddatahome: homepagestructureddataContent,
    contactpagemetas: contactpagemetasContent,
    contactinfo: contactinfoContent,
    contactpagegeodata: contactpagegeodataContent,

    // Fallback
    default: defaultContent,
};

/**
 * Get chat content for a specific task
 *
 * @param {Object} task - Task object with taskId, title, description
 * @returns {Object} Chat content configuration
 */
export const getTaskChatContent = (task) => {
    const content = TASK_CHAT_CONTENT[task.taskId] || TASK_CHAT_CONTENT.default;

    // Deep clone to avoid mutating the original
    const clonedContent = JSON.parse(JSON.stringify(content));

    // Populate dynamic fields for tasks that need them
    if (task.taskId === 'structureddata' || !TASK_CHAT_CONTENT[task.taskId]) {
        clonedContent.intro.message = `Hi! Let's take a closer look at the task "**${task.title}**".`;
        clonedContent.intro.description = task.description;
    }

    return clonedContent;
};
