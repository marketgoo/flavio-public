import { useState } from 'react';
import { Sparkles, MapPin, HandHeart } from 'lucide-react';
import PriorityCard from '@/components/ui/priority-card';
import OnboardingLayout from '@/features/onboarding/OnboardingLayout';
import { GOALS } from '@/constants/goals';

/**
 * Icon mapping for goal cards
 */
const GOAL_ICONS = {
	Sparkles: (
		<Sparkles size={48} strokeWidth={2} className="text-magenta-500" />
	),
	MapPin: <MapPin size={48} strokeWidth={2} className="text-magenta-500" />,
	HandHeart: (
		<HandHeart size={48} strokeWidth={2} className="text-magenta-500" />
	),
};

/**
 * Goal Step
 *
 * User selects their top goal from 3 options
 */
const Goal = ({ onNext }) => {
	const [selectedGoal, setSelectedGoal] = useState(null);

	const handleSelect = (goalId) => {
		setSelectedGoal(goalId);
		// Auto-advance after selection
		setTimeout(() => {
			onNext({ goal: goalId });
		}, 300);
	};

	return (
		<OnboardingLayout title="Let's kick things off — what's your top priority right now?">
			{/* Description */}
			<div className="mb-6">
				<p className="paragraph-regular text-foreground mb-4">
					Tell me what's most important right now. I'll build a smart
					plan with clear steps and key indicators to make sure we're
					heading in the right direction.
				</p>
				<p className="paragraph-regular text-foreground">
					Don't worry — you{' '}
					<strong className="text-foreground font-semibold">
						can change your goal anytime
					</strong>{' '}
					if your priorities shift.
				</p>
			</div>

			{/* Goal Cards Grid */}
			<div
				className="grid grid-cols-1 md:grid-cols-3 gap-4"
				role="radiogroup"
				aria-label="Select your goal"
			>
				{GOALS.map((goal) => (
					<PriorityCard
						key={goal.id}
						icon={GOAL_ICONS[goal.iconName]}
						title={goal.title}
						description={goal.description}
						selected={selectedGoal === goal.id}
						onClick={() => handleSelect(goal.id)}
					/>
				))}
			</div>
		</OnboardingLayout>
	);
};

export default Goal;
