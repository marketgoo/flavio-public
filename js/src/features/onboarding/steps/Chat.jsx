import { useState } from 'react';
import { Button } from '@/components/ui/button';
import ConversationalChat from '@/features/chat/ConversationalChat';
import OnboardingLayout from '@/features/onboarding/OnboardingLayout';
import { post } from '@/api/client';
import { logError } from '@/errors/logger';
import { getErrorMessage } from '@/utils/errorMessages';

/**
 * Chat Step Component
 *
 * Onboarding step 3: Interactive chat conversation to gather business information.
 * Uses ConversationalChat component, sends data to backend and advances to next step.
 *
 * @param {Function} goToNextStep - Navigate to next onboarding step
 * @param {Object} data - Current onboarding data
 * @param {string} data.goal - User's selected goal
 *
 * @example
 * <Chat
 *   goToNextStep={() => navigateNext()}
 *   data={{ goal: 'traffic' }}
 * />
 */
const Chat = ({ goToNextStep, data }) => {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState(null);
	const [lastResponses, setLastResponses] = useState(null);

	const questions = [
		{
			id: 'business',
			type: 'text',
			question: 'How would you describe your business?',
			example:
				'"A cozy local café offering specialty coffee and homemade pastries."',
			field: 'businessOffer',
			acknowledgment:
				'Perfect! That gives me a good sense of what you do.',
		},
		{
			id: 'customers',
			type: 'text',
			question: 'How would you describe your typical customers?',
			example:
				'"Coffee lovers and remote workers, mostly adults aged 20-40, looking for a comfortable place to relax or work."',
			field: 'targetClient',
			acknowledgment:
				"Great! That helps me understand your audience. Just one more question — then I'll get to work!",
		},
		{
			id: 'address',
			type: 'text',
			question:
				'Do you have a physical address for your business? If you have address write it down. If not, just say no.',
			example: '"456 Oak Avenue, Rivertown, USA"',
			field: 'localBusiness',
			acknowledgment: 'Perfect! I have everything I need.',
		},
	];

	const sendToBackend = async (responses) => {
		setIsSubmitting(true);
		setError(null);

		try {
			// Transform data to backend format (snake_case)
			const payload = {
				goal: data.goal,
				business_offer: responses.businessOffer,
				target_client: responses.targetClient,
				local_business: responses.localBusiness,
			};

			// Send business info to backend
			await post('/site-business-info', payload);

			// Success - advance to next step
			goToNextStep();
		} catch (err) {
			// Log error with context
			logError(err, {
				action: 'send_business_info',
				component: 'Chat',
				step: 'onboarding_step_3',
				payload: {
					hasGoal: !!data.goal,
					hasBusinessOffer: !!responses.businessOffer,
					hasTargetClient: !!responses.targetClient,
					hasLocalBusiness: !!responses.localBusiness,
				},
			});

			// Get user-friendly error message
			const errorMessage = getErrorMessage(
				err,
				'Failed to send business information. Please try again.'
			);

			setError(errorMessage);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleComplete = (responses) => {
		setLastResponses(responses); // Save for retry
		sendToBackend(responses);
	};

	const handleRetry = () => {
		if (lastResponses) {
			sendToBackend(lastResponses);
		}
	};

	return (
		<OnboardingLayout title="Let's make your site name and tagline shine">
			{/* Description */}
			<div className="mb-6">
				<p className="paragraph-regular text-foreground mb-4">
					Before I suggest an optimized site{' '}
					<strong className="font-semibold">name</strong> and{' '}
					<strong className="font-semibold">tagline</strong>, I need
					to understand your business a little better. Just a few
					quick questions — this will only take a minute!
				</p>
				<p className="small-regular text-foreground">
					Don't worry, you can edit your answers later in your profile
					if anything changes.
				</p>
			</div>

			{/* Error message */}
			{error && (
				<div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
					<p className="small-regular text-destructive mb-3">
						<strong className="font-semibold">Error:</strong>{' '}
						{error}
					</p>
					<Button
						variant="outline"
						size="sm"
						onClick={handleRetry}
						disabled={isSubmitting}
					>
						{isSubmitting ? 'Retrying...' : 'Try Again'}
					</Button>
				</div>
			)}

			{/* Conversational Chat */}
			<ConversationalChat
				questions={questions}
				onComplete={handleComplete}
				initialValues={{}}
				completionMessage="Done! Sending your information…"
			/>

			{/* Loading indicator */}
			{isSubmitting && (
				<div className="mt-4 text-center">
					<p className="small-regular text-muted-foreground">
						Sending your information...
					</p>
				</div>
			)}
		</OnboardingLayout>
	);
};

export default Chat;
