import { useState, useMemo } from 'react';
import { GuidedChatMessageGroup } from '@/components/chat/guided/GuidedChatMessageGroup';
import { Badge } from '@/components/ui/badge';
import { useAutoScroll } from '@/hooks/useAutoScroll';
import { TIMINGS } from '@/config/timings';
import { get } from '@/api/client';
import { getTaskChatContent } from './config/guidedChatContent';

/**
 * GuidedTaskChat Component
 *
 * Interactive guided chat for task exploration. Users navigate through
 * task-specific information by clicking badge options. Content is loaded
 * dynamically based on task ID, supporting different information flows
 * for each task type.
 *
 * @param {Object} task - Task object
 * @param {string} task.taskId - Task type identifier (e.g., 'robotstxt', 'sslexists', 'sitemap')
 * @param {string} task.title - Task title for display
 * @param {string} task.description - Task description
 * @param {Function} [onApply] - Callback when user clicks "Apply now" (for tasks with apiEndpoint)
 * @param {Function} [onMarkDone] - Callback when user clicks "Mark as done" (for manual tasks)
 * @param {Function} [onDismiss] - Callback when user clicks "Postpone"
 * @param {Function} [onClose] - Callback when user closes chat
 *
 * @example
 * <GuidedTaskChat
 *   task={{
 *     id: 'ssl-security',
 *     title: 'Secure your site',
 *     description: 'Add SSL certificate to your site'
 *   }}
 *   onApply={() => applyTask(task)}
 *   onMarkDone={() => completeTask(task)}
 *   onDismiss={() => dismissTask(task)}
 *   onClose={() => setIsDrawerOpen(false)}
 * />
 */
const GuidedTaskChat = ({ task, onApply, onMarkDone, onDismiss, onClose }) => {
	// Get task-specific content from config
	const taskContent = getTaskChatContent(task);

	// Lazy initialization: Calculate initial messages once without effects
	const [messages, setMessages] = useState(() => {
		const intro = taskContent.intro;
		return [
			{
				type: 'assistant',
				content: intro.message,
			},
			{
				type: 'assistant',
				content: intro.description,
			},
			{
				type: 'assistant',
				content: intro.question,
				options: intro.options,
			},
		];
	});

	const [currentStep, setCurrentStep] = useState('intro');
	const [visitedOptions, setVisitedOptions] = useState(new Set());

	// Auto-scroll to bottom when messages change
	const messagesEndRef = useAutoScroll([messages], {
		behavior: 'smooth',
		block: 'nearest',
	});

	/**
	 * Format solution content based on task type
	 * Returns JSX for custom rendering in scrollable container
	 * @param {any} content - Raw content from API
	 * @param {string} taskId - Task type identifier
	 * @returns {React.ReactNode} Formatted JSX content
	 */
	const formatSolutionContent = (content, taskId) => {
		// no404: Broken links grouped by URL
		if (taskId === 'no404') {
			if (!Array.isArray(content) || content.length === 0) {
				return <p className="small-regular">No broken links found.</p>;
			}

			// Group by broken_link_url
			const grouped = content.reduce((acc, item) => {
				const key = item.broken_link_url;
				if (!acc[key]) {
					acc[key] = [];
				}
				acc[key].push({
					pageUrl: item.page_url,
					pageTitle: item.page_title,
				});
				return acc;
			}, {});

			const totalBrokenLinks = Object.keys(grouped).length;

			return (
				<div className="small-regular whitespace-nowrap">
					<p>
						<strong>{totalBrokenLinks} Broken links</strong> found
						on these pages:
					</p>
					<ul className="space-y-3 label-regular">
						{Object.entries(grouped).map(
							([brokenLink, pages], idx) => (
								<li key={idx} className="mt-4">
									<span className="font-semibold">
										• {brokenLink}
									</span>
									<ul className="ml-4 mt-2 space-y-0.5">
										{pages.map((page, pageIdx) => (
											<li key={pageIdx}>
												<a
													href={page.pageUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="hover:underline !text-neutral-700"
												>
													• {page.pageTitle}
												</a>
											</li>
										))}
									</ul>
								</li>
							)
						)}
					</ul>
				</div>
			);
		}

		// structureddatahome: Show JSON-LD structured data
		if (taskId === 'structureddatahome') {
			if (!content || typeof content !== 'object') {
				return (
					<p className="small-regular">
						No structured data available.
					</p>
				);
			}

			return (
				<div className="small-regular space-y-4">
					<p>
						<strong>Organization Schema:</strong>
					</p>
					<pre className="bg-neutral-100 p-3 rounded text-xs overflow-x-auto whitespace-pre-wrap">
						{JSON.stringify(content.organization, null, 2)}
					</pre>
					<p>
						<strong>Website Schema:</strong>
					</p>
					<pre className="bg-neutral-100 p-3 rounded text-xs overflow-x-auto whitespace-pre-wrap">
						{JSON.stringify(content.website, null, 2)}
					</pre>
				</div>
			);
		}

		// Default: return content as-is (for future task types)
		return <p className="small-regular">{String(content)}</p>;
	};

	/**
	 * Fetch solution preview from API
	 * @param {string} taskId - Task type identifier
	 * @returns {Promise<string|null>} Solution content or null on error
	 */
	const fetchSolutionPreview = async (taskId) => {
		const endpointMap = {
			robotstxt: '/tasks/robotstxt',
			sitemap: '/tasks/sitemap',
			no404: '/tasks/no404',
			noindex: '/tasks/noindex',
			friendlyurl: '/tasks/friendlyurl',
			structureddatahome: '/tasks/structured-data-home',
		};

		const endpoint = endpointMap[taskId];
		if (!endpoint) return null;

		try {
			const response = await get(endpoint);
			return response?.content || response?.data || null;
		} catch (error) {
			console.error('[GuidedTaskChat] Failed to fetch solution:', error);
			return null;
		}
	};

	// Handle option click
	const handleOptionClick = async (optionId) => {
		const selectedOption = taskContent[currentStep]?.options?.find(
			(opt) => opt.id === optionId
		);

		if (!selectedOption) return;

		// Mark option as visited
		setVisitedOptions((prev) => new Set([...prev, optionId]));

		// Add user selection
		setMessages((prev) => [
			...prev,
			{
				type: 'user',
				content: selectedOption.label,
			},
		]);

		// Handle special actions
		if (optionId === 'close') {
			setTimeout(() => {
				onClose?.();
			}, TIMINGS.DRAWER.CLOSE_DELAY);
			return;
		}

		if (optionId === 'apply') {
			await onApply?.();
		}

		if (optionId === 'mark-done') {
			await onMarkDone?.();
		}

		if (optionId === 'postpone') {
			await onDismiss?.();
		}

		// Handle "proposed-solution" - fetch solution preview from API
		if (optionId === 'proposed-solution') {
			// Add loading message
			setMessages((prev) => [
				...prev,
				{
					type: 'assistant',
					content:
						"I've prepared a solution for your website. Let me show you...",
				},
			]);

			// Fetch solution preview
			const solutionContent = await fetchSolutionPreview(task.taskId);

			const content = taskContent[optionId];
			const newMessages = [];

			if (solutionContent) {
				// Format content based on task type
				const isCodeContent = ['robotstxt', 'sitemap'].includes(
					task.taskId
				);

				if (isCodeContent) {
					newMessages.push({
						type: 'assistant',
						content: "Here's the proposed content:",
						codeBlock: solutionContent,
					});
				} else {
					// Format content based on taskId (returns JSX)
					const formattedContent = formatSolutionContent(
						solutionContent,
						task.taskId
					);
					newMessages.push({
						type: 'assistant',
						scrollableBlock: formattedContent,
					});
				}
			}

			// Add the action message and options
			newMessages.push({
				type: 'assistant',
				content:
					content?.message ||
					"Click on **Apply** and I'll take care of the rest.",
				options: content?.options,
			});

			setMessages((prev) => [...prev, ...newMessages]);
			setCurrentStep(optionId);
			return;
		}

		// Show content for selected step
		setTimeout(() => {
			const content = taskContent[optionId];
			if (!content) return;

			const newMessages = [];

			// Add main message
			newMessages.push({
				type: 'assistant',
				content: content.message,
			});

			// Add steps if exists (for "how-to-fix")
			if (content.steps) {
				content.steps.forEach((step, index) => {
					newMessages.push({
						type: 'assistant',
						content: `${index + 1}. ${step}`,
					});
				});
			}

			// Add question and options
			if (content.question) {
				newMessages.push({
					type: 'assistant',
					content: content.question,
					options: content.options,
				});
			} else if (content.options) {
				newMessages.push({
					type: 'assistant',
					content: '',
					options: content.options,
				});
			}

			setMessages((prev) => [...prev, ...newMessages]);
			setCurrentStep(optionId);
		}, TIMINGS.DRAWER.TRANSITION);
	};

	// Group consecutive messages by type
	const messageGroups = useMemo(() => {
		const groups = [];
		let currentGroup = null;

		messages.forEach((message, index) => {
			if (!currentGroup || currentGroup.type !== message.type) {
				// Start a new group
				currentGroup = {
					type: message.type,
					messages: [message],
					startIndex: index,
				};
				groups.push(currentGroup);
			} else {
				// Add to current group
				currentGroup.messages.push(message);
			}
		});

		return groups;
	}, [messages]);

	// Get options from the last message if it's the last in all messages
	const lastMessage = messages[messages.length - 1];
	const availableOptions = lastMessage?.options?.filter(
		(opt) => !visitedOptions.has(opt.id)
	);
	const showOptions = availableOptions?.length > 0;

	return (
		<div className="flex flex-col h-full">
			{/* Messages Container */}
			<div className="flex-1 overflow-y-auto px-4 py-12">
				<div className="space-y-3">
					{messageGroups.map((group, groupIndex) => (
						<GuidedChatMessageGroup
							key={groupIndex}
							type={group.type}
							messages={group.messages}
						/>
					))}

					{showOptions && (
						<div className="flex flex-col items-start gap-2">
							{availableOptions.map((option) => (
								<Badge
									key={option.id}
									onClick={() => handleOptionClick(option.id)}
									className="cursor-pointer bg-card text-magenta-500 hover:bg-magenta-50 transition-colors font-normal border-border shadow-2xs"
								>
									{option.label}
								</Badge>
							))}
						</div>
					)}
				</div>
				<div ref={messagesEndRef} className="h-20" />
			</div>
		</div>
	);
};

export default GuidedTaskChat;
