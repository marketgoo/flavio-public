import OnboardingLayout from '@/features/onboarding/OnboardingLayout';
import { AnimatedTaskList } from '@/components/ui/progress-checklist';

/**
 * Loading tasks for onboarding
 */
const LOADING_TASKS = [
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

/**
 * Loading Step
 *
 * Shows animated checklist while "preparing" the Smart Plan
 * Automatically advances to completion after all items are checked
 */
const Loading = ({ onNext }) => {
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
			<AnimatedTaskList tasks={LOADING_TASKS} onComplete={onNext} />
		</OnboardingLayout>
	);
};

export default Loading;
