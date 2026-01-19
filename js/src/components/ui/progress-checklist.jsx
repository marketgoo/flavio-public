import { useState, useEffect } from 'react';
import { CheckCheck } from 'lucide-react';
import { getWordPressConfig } from '@/api/client';

/**
 * CheckIcon Component - renders check-check icon with dynamic color based on completion state
 */
const CheckIcon = ({ isCompleted }) => (
	<CheckCheck
		className="transition-all duration-300"
		size={24}
		color={
			isCompleted
				? 'var(--color-magenta-500)'
				: 'var(--color-neutral-300)'
		}
	/>
);

/**
 * AnimatedTaskList Component
 *
 * Displays an animated checklist with sequential item completion.
 * This is the core checklist component without layout wrapper.
 *
 * @param {Array<{id: number|string, label: string, delay: number}>} tasks - Array of tasks to display
 * @param {Function} [onComplete] - Callback when all tasks are completed
 * @param {string} [className] - Additional CSS classes
 *
 * @example
 * <AnimatedTaskList
 *   tasks={[
 *     { id: 1, label: 'Reviewing your page...', delay: 800 },
 *     { id: 2, label: 'Finding opportunities...', delay: 1600 },
 *   ]}
 *   onComplete={() => goToNextStep()}
 * />
 */
const AnimatedTaskList = ({ tasks = [], onComplete, className = '' }) => {
	const [completedTasks, setCompletedTasks] = useState([]);

	useEffect(() => {
		// Sequentially complete tasks with delays
		const timeouts = tasks.map((task) =>
			setTimeout(() => {
				setCompletedTasks((prev) => [...prev, task.id]);
			}, task.delay)
		);

		// Call onComplete after all tasks are done
		if (onComplete && tasks.length > 0) {
			const totalTime = Math.max(...tasks.map((t) => t.delay)) + 1000;
			const completeTimeout = setTimeout(() => {
				onComplete();
			}, totalTime);

			return () => {
				timeouts.forEach(clearTimeout);
				clearTimeout(completeTimeout);
			};
		}

		return () => timeouts.forEach(clearTimeout);
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<div
			className={`space-y-5 ${className}`}
			role="status"
			aria-live="polite"
		>
			{tasks.map((task) => {
				const isCompleted = completedTasks.includes(task.id);

				return (
					<div
						key={task.id}
						className="flex items-center gap-4 transition-all duration-300"
					>
						{/* Check icon */}
						<div className="flex items-center justify-center w-6 h-6 flex-shrink-0">
							<CheckIcon isCompleted={isCompleted} />
						</div>

						{/* Task Label */}
						<span
							className={`paragraph-medium transition-all duration-300 ${
								isCompleted
									? 'text-magenta-500'
									: 'text-neutral-300'
							}`}
						>
							{task.label}
						</span>
					</div>
				);
			})}
		</div>
	);
};

/**
 * ProgressChecklist Component
 *
 * Displays an animated checklist with title, icon, and optional subtitle.
 * Uses AnimatedTaskList internally for the checklist.
 *
 * @param {string} title - Main heading text
 * @param {string} [subtitle] - Optional subtitle/description text
 * @param {Array<{id: number|string, label: string, delay: number}>} tasks - Array of tasks to display
 * @param {Function} [onComplete] - Callback when all tasks are completed
 * @param {boolean} [showIcon=true] - Whether to show the Flavio icon next to title
 *
 * @example
 * <ProgressChecklist
 *   title="Optimizing your page..."
 *   subtitle="I'm preparing your customized optimization plan."
 *   tasks={[
 *     { id: 1, label: 'Reviewing your page...', delay: 800 },
 *     { id: 2, label: 'Finding opportunities...', delay: 1600 },
 *   ]}
 *   onComplete={() => goToNextStep()}
 * />
 */
const ProgressChecklist = ({
	title,
	subtitle,
	tasks = [],
	onComplete,
	showIcon = true,
}) => {
	const config = getWordPressConfig();

	// Icon width (64px / size-16) + gap (16px / gap-4) = 80px / pl-20
	const contentIndent = showIcon ? 'pl-20' : '';

	return (
		<div className="flex flex-col items-center justify-center py-16 px-6">
			{/* Content wrapper - keeps title, subtitle, and checklist aligned */}
			<div className="w-full max-w-2xl">
				{/* Header with icon */}
				<div className="flex items-center gap-4 mb-6">
					{showIcon && (
						<img
							src={`${config?.pluginUrl || ''}js/public/onboarding.svg`}
							alt="Flavio"
							className="size-16 shrink-0"
							aria-hidden="true"
						/>
					)}
					<h1 className="heading-h1">{title}</h1>
				</div>

				{/* Subtitle - aligned with title text (after icon) */}
				{subtitle && (
					<p
						className={`paragraph-regular text-muted-foreground mb-12 ${contentIndent}`}
					>
						{subtitle}
					</p>
				)}

				{/* Progress Checklist - aligned with title text (after icon) */}
				<div className={contentIndent}>
					<AnimatedTaskList tasks={tasks} onComplete={onComplete} />
				</div>
			</div>
		</div>
	);
};

export { ProgressChecklist, AnimatedTaskList };
