import { useState } from 'react';
import useOnboarding from '@/hooks/useOnboarding';
import usePageView from '@/hooks/analytics/usePageView';

// Import all steps
import Welcome from '@/features/onboarding/steps/Welcome';
import Goal from '@/features/onboarding/steps/Goal';
import Chat from '@/features/onboarding/steps/Chat';
import Confirmation from '@/features/onboarding/steps/Confirmation';
import Loading from '@/features/onboarding/steps/Loading';

/**
 * OnboardingPage Component
 *
 * Multi-step onboarding wizard.
 * 5 steps: Welcome → Goal → Chat → Confirmation → Loading
 * Backend is the single source of truth for progress.
 * React state is used only for temporary data between steps (e.g., selected goal).
 *
 * @param {Function} onComplete - Callback when onboarding is complete
 *
 * @example
 * <OnboardingPage onComplete={() => navigate('/dashboard')} />
 */
const OnboardingPage = ({ onComplete }) => {
	const {
		currentStep,
		isLastStep,
		goToNextStep,
		completeOnboarding,
		data: backendData,
	} = useOnboarding();

	// Local state for temporary data (e.g., goal selected but not yet sent to backend)
	const [sessionData, setSessionData] = useState({});

	// Merge backend data with session data
	const data = { ...backendData, ...sessionData };

	// Track page view
	usePageView('onboarding');

	// Array of step components (ordered)
	const steps = [Welcome, Goal, Chat, Confirmation, Loading];

	const CurrentStepComponent = steps[currentStep - 1];

	// Handle advancing to next step
	const handleNext = (stepData) => {
		// Store temporary data in session state if provided
		if (stepData) {
			setSessionData((prev) => ({ ...prev, ...stepData }));
		}

		// Complete or advance
		if (isLastStep) {
			completeOnboarding();
			onComplete?.();
		} else {
			goToNextStep();
		}
	};

	return (
		<main className="flex-1 flex items-center justify-center overflow-auto py-8">
			{CurrentStepComponent && (
				<CurrentStepComponent
					onNext={handleNext}
					goToNextStep={goToNextStep}
					data={data}
				/>
			)}
		</main>
	);
};

export default OnboardingPage;
