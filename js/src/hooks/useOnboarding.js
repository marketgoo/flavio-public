import { useState } from 'react';

const TOTAL_STEPS = 5;

/**
 * Custom hook for managing onboarding wizard state
 *
 * Backend (window.flavioData.siteInfo) is the single source of truth.
 * React state is used only for UI navigation within the session.
 *
 * @returns {Object} Onboarding state and controls
 * @returns {boolean} isCompleted - Whether onboarding is completed
 * @returns {number} currentStep - Current step number (1-5)
 * @returns {number} totalSteps - Total number of steps (5)
 * @returns {Object} data - Onboarding form data from backend (camelCase)
 * @returns {boolean} isFirstStep - True if on first step
 * @returns {boolean} isLastStep - True if on last step
 * @returns {number} progress - Progress percentage (0-100)
 * @returns {Function} goToNextStep - Navigate to next step
 * @returns {Function} goToPreviousStep - Navigate to previous step
 * @returns {Function} completeOnboarding - Reload page to get fresh backend data
 *
 * @example
 * // In App.jsx - check if onboarding is completed
 * const { isCompleted } = useOnboarding();
 * if (!isCompleted) return <OnboardingPage />;
 *
 * // In OnboardingPage.jsx - manage wizard navigation
 * const { currentStep, goToNextStep, data } = useOnboarding();
 */
const useOnboarding = () => {
	// Read backend data (source of truth)
	const siteInfo = window.flavioData?.siteInfo;

	// Initialize step based on backend data (lazy initialization)
	const [currentStep, setCurrentStep] = useState(() => {
		if (!siteInfo?.goal) return 1; // Welcome
		if (
			!siteInfo.business_offer ||
			!siteInfo.target_client ||
			!siteInfo.local_business
		) {
			return 3; // Chat
		}
		return TOTAL_STEPS; // Completed
	});

	// Check if onboarding is completed (all required fields exist)
	const isCompleted = !!(
		siteInfo?.goal &&
		siteInfo.business_offer &&
		siteInfo.target_client &&
		siteInfo.local_business
	);

	// Transform backend data to camelCase for frontend use
	const data = {
		goal: siteInfo?.goal || null,
		businessOffer: siteInfo?.business_offer || null,
		targetClient: siteInfo?.target_client || null,
		localBusiness: siteInfo?.local_business || null,
	};

	// Navigation actions
	const goToNextStep = () => {
		setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
	};

	const goToPreviousStep = () => {
		setCurrentStep((prev) => Math.max(prev - 1, 1));
	};

	// Complete onboarding (reload to get fresh backend data)
	const completeOnboarding = () => {
		window.location.reload();
	};

	return {
		// State
		isCompleted,
		currentStep,
		totalSteps: TOTAL_STEPS,
		data,
		isFirstStep: currentStep === 1,
		isLastStep: currentStep === TOTAL_STEPS,
		progress: Math.round((currentStep / TOTAL_STEPS) * 100),

		// Actions
		goToNextStep,
		goToPreviousStep,
		completeOnboarding,
	};
};

export default useOnboarding;
