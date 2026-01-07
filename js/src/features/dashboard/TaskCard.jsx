import Markdown from 'markdown-to-jsx';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarClock, Check, TriangleAlert } from 'lucide-react';
import { getWordPressConfig } from '@/api/client';
import useAnalytics from '@/hooks/analytics/useAnalytics';
import useTrackOnMount from '@/hooks/analytics/useTrackOnMount';
import { EVENTS } from '@/lib/events';

/**
 * StatusBadge Component
 *
 * Reusable badge with icon for task status display.
 * Consistent icon sizing (w-4 h-4) and spacing (mr-1).
 *
 * @param {string} variant - Badge variant (e.g., 'default', 'destructive')
 * @param {React.Component} icon - Lucide icon component
 * @param {string} text - Badge text
 * @param {string} [className=''] - Additional CSS classes
 */
const StatusBadge = ({ variant, icon, text, className = '' }) => {
	const Icon = icon;
	return (
		<Badge variant={variant} className={`mb-4 py-1 ${className}`.trim()}>
			<Icon className="w-4 h-4 mr-1" />
			{text}
		</Badge>
	);
};

/**
 * TagList Component
 *
 * Renders a list of tags using shadcn Badge component.
 *
 * @param {string[]} tags - Array of tag strings
 */
const TagList = ({ tags = [] }) => {
	if (!tags || tags.length === 0) return null;

	return (
		<div className="flex flex-wrap gap-2">
			{tags.map((tag) => (
				<Badge
					key={tag}
					variant="outline"
					className="bg-magenta-50 text-magenta-500 font-medium"
				>
					{tag}
				</Badge>
			))}
		</div>
	);
};

/**
 * TaskCard Component
 *
 * Displays a task card with different states (pending, applying, completed, incomplete)
 * and context-aware actions. Shows different UI layouts based on task status.
 *
 * New carousel layout:
 * - Emoji + Title
 * - Description (max 3 lines)
 * - Separator
 * - Tags (multiple, magenta color)
 * - 2 buttons: "View details" + "Do it for me"/"Mark as done"
 *
 * @param {Object} task - Task data object
 * @param {string} task.id - Unique task identifier
 * @param {('apply'|'mark-done')} task.actionType - Type of primary action
 * @param {string} task.emoji - Emoji character
 * @param {string} task.title - Task title
 * @param {string} task.description - Task description
 * @param {string[]} task.tags - Array of tag strings
 * @param {string} [task.apiEndpoint] - API endpoint (required for 'apply' type)
 * @param {('pending'|'applying'|'completed'|'incomplete')} task.status - Current task status
 * @param {Function} onAction - Callback when primary action button is clicked
 * @param {Function} [onAskFlavio] - Callback when "View details" button is clicked
 * @param {Function} [onDismiss] - Callback when dismiss button is clicked
 * @param {boolean} [isDisabled=false] - Whether the card actions are disabled
 */
const TaskCard = ({
	task,
	onAction,
	onAskFlavio,
	onDismiss,
	isDisabled = false,
}) => {
	const { actionType, emoji, title, description, tags, status } = task;
	const { track } = useAnalytics();
	const config = getWordPressConfig();

	// Track impression on mount
	useTrackOnMount(EVENTS.SUGGESTION_CARD_VIEW, { task_name: title });

	// Determine button text and state based on status and actionType
	const getActionButton = () => {
		if (status === 'applying') {
			return {
				text: 'Applying...',
				disabled: true,
			};
		}

		if (actionType === 'apply') {
			return {
				text: 'Do it for me',
				disabled: isDisabled,
			};
		}

		return {
			text: 'Mark as done',
			disabled: isDisabled,
		};
	};

	const actionButton = getActionButton();

	// Render completed state
	if (status === 'completed') {
		return (
			<Card className="p-6 flex flex-col items-center justify-center text-center min-h-[280px]">
				<StatusBadge
					variant="default"
					icon={Check}
					text="Completed"
					className="bg-lime-500"
				/>
				<h4 className="heading-h4 mb-2">
					All done! The task "{emoji} {title}" is successfully
					completed.
				</h4>
				<p className="small-regular text-neutral-300">
					Ready for more? Your next task is lined up.
				</p>
			</Card>
		);
	}

	// Render incomplete/error state
	if (status === 'incomplete') {
		return (
			<Card className="p-6 flex flex-col items-center justify-center text-center min-h-[280px]">
				<StatusBadge
					variant="destructive"
					icon={TriangleAlert}
					text="Incomplete"
				/>
				<h4 className="heading-h4 mb-2">
					Oops! It looks like "{emoji} {title}" isn't fully set up
					yet.
				</h4>
				<p className="small-regular text-neutral-300">
					I'm here to guide you if you need help.
				</p>
			</Card>
		);
	}

	// Render pending/applying state (default - new carousel layout)
	return (
		<Card className="p-6 min-h-[280px] flex flex-col">
			{/* Title with emoji */}
			<h4 className="heading-h4 line-clamp-2">
				{emoji} {title}
			</h4>

			{/* Description */}
			<div className="mt-2 flex-1">
				<Markdown
					className="small-regular text-neutral-700 line-clamp-3"
					options={{
						overrides: {
							p: { props: { className: 'mb-0' } },
						},
					}}
				>
					{description}
				</Markdown>
			</div>

			{/* Separator */}
			<hr className="my-4 border-border" />

			{/* Tags and Actions */}
			<div className="flex items-center justify-between gap-4">
				{/* Tags */}
				<TagList tags={tags} />

				{/* Action buttons */}
				<div className="flex items-center gap-2 flex-shrink-0">
					{/* View details button */}
					<Button
						variant="outline"
						size="sm"
						onClick={() => {
							track(EVENTS.CHAT_BUTTON_CLICK, {
								task_name: title,
								button_name: 'view_details',
							});
							onAskFlavio?.(task);
						}}
						disabled={isDisabled || status === 'applying'}
					>
						<img
							src={`${config?.pluginUrl || ''}js/public/onboarding.svg`}
							alt=""
							className="w-4 h-4 mr-1 brightness-0"
							aria-hidden="true"
						/>
						View details
					</Button>

					{/* Primary action button */}
					<Button
						size="sm"
						onClick={() => {
							const eventName =
								actionType === 'apply'
									? EVENTS.TASK_APPLY_CLICK
									: EVENTS.TASK_REVIEW_CLICK;
							track(eventName, { task_name: title });
							onAction?.(task);
						}}
						disabled={actionButton.disabled}
					>
						{actionButton.text}
					</Button>
				</div>
			</div>
		</Card>
	);
};

export default TaskCard;
