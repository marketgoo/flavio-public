import { useState, useEffect } from 'react';
import { CheckCheck } from 'lucide-react';
import OnboardingLayout from '@/features/onboarding/OnboardingLayout';

/**
 * CheckIcon Component - renders check-check icon with dynamic color
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
 * Loading Step
 *
 * Shows animated checklist while "preparing" the Smart Plan
 * Automatically advances to completion after all items are checked
 */
const Loading = ({ onNext }) => {
	const [completedTasks, setCompletedTasks] = useState([]);

	const tasks = [
		{ id: 1, label: 'Reviewing your website content', delay: 800 },
		{ id: 2, label: 'Checking how Google sees your site', delay: 1600 },
		{
			id: 3,
			label: 'Identifying opportunities to reach more customers',
			delay: 2400,
		},
		{ id: 4, label: 'Creating your custom Smart Plan', delay: 3200 },
		{
			id: 5,
			label: 'Setting up key indicators to track your progress',
			delay: 4000,
		},
	];

	useEffect(() => {
		// Sequentially complete tasks with delays
		tasks.forEach((task) => {
			setTimeout(() => {
				setCompletedTasks((prev) => [...prev, task.id]);
			}, task.delay);
		});

		// Complete onboarding after all tasks
		const totalTime = Math.max(...tasks.map((t) => t.delay)) + 1000;
		setTimeout(() => {
			onNext();
		}, totalTime);
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<OnboardingLayout title="I'm preparing your Smart Plan...">
			{/* Description */}
			<div className="mb-12">
				<p className="paragraph-regular text-foreground mb-2">
					Hang tight! I'm taking a quick look at your{' '}
					<strong className="font-semibold">
						website and online presence
					</strong>{' '}
					to see what's working and what can be improved.
				</p>
				<p className="paragraph-regular text-foreground mb-2">
					Then, we'll create a{' '}
					<strong className="font-semibold">custom Smart Plan</strong>{' '}
					with simple, focused steps to help you{' '}
					<strong className="font-semibold">reach your goal</strong>.
				</p>
				<p className="paragraph-regular text-foreground">
					This usually only takes a moment — sit tight, and we'll have
					your plan ready soon!
				</p>
			</div>

			{/* Progress Checklist */}
			<div className="space-y-5" role="status" aria-live="polite">
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

							{/* Task Label - paragraph/medium */}
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
		</OnboardingLayout>
	);
};

export default Loading;
