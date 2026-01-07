import { Button } from '@/components/ui/button';
import OnboardingLayout from '@/features/onboarding/OnboardingLayout';

/**
 * Welcome Step
 *
 * Introduces Flavio and sets expectations for the onboarding process
 */
const Welcome = ({ onNext }) => {
	return (
		<OnboardingLayout title="Welcome! I'm Flavio, here to grow your website with you 🚀">
			{/* Description */}
			<div className="space-y-4 mb-8">
				<p className="paragraph-regular text-foreground">
					I'm here to help you{' '}
					<strong className="font-semibold">
						improve your online presence
					</strong>{' '}
					and{' '}
					<strong className="font-semibold">
						grow your online business with simple, focused actions,
						without wasting time
					</strong>
					.
				</p>

				<p className="paragraph-regular text-foreground">
					Most of the time, I'll{' '}
					<strong className="font-semibold">
						take care of the work for you
					</strong>{' '}
					— you just review and confirm. No dashboards. No complicated
					tools. Just clear, step by step, that make your online
					business stronger, starting now.
				</p>
			</div>

			{/* CTA Button */}
			<Button
				size="lg"
				onClick={() => onNext()}
				className="text-base px-6 bg-foreground text-background hover:bg-foreground/90"
			>
				Let's set my goal
			</Button>
		</OnboardingLayout>
	);
};

export default Welcome;
