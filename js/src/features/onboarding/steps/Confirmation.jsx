import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import OnboardingLayout from '@/features/onboarding/OnboardingLayout';
import { post, get } from '@/api/client';
import { logError } from '@/errors/logger';
import { getErrorMessage } from '@/utils/errorMessages';

/**
 * Confirmation Step
 *
 * Shows proposed site name and tagline for user approval
 * Always fetches suggestions from backend
 */
const Confirmation = ({ onNext }) => {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [suggestions, setSuggestions] = useState({
		siteName: null,
		tagline: null,
	});

	// Always fetch suggestions from backend
	useEffect(() => {
		const fetchSuggestions = async () => {
			try {
				const response = await get('/ai-suggestions/site-basic');

				if (response?.title && response?.tagline) {
					setSuggestions({
						siteName: response.title,
						tagline: response.tagline,
					});
				}
			} catch (err) {
				logError(err, {
					action: 'fetch_ai_suggestions',
					component: 'Confirmation',
					step: 'onboarding_step_4',
				});
				// Don't set error here, let user continue with defaults
			} finally {
				setIsLoading(false);
			}
		};

		fetchSuggestions();
	}, []);

	// AI-generated proposals
	const proposal = {
		siteName: suggestions.siteName || 'Your Business Name',
		tagline: suggestions.tagline || 'Your tagline will appear here',
	};

	const handleAccept = async () => {
		setIsSubmitting(true);
		setError(null);

		try {
			// Send optimizations to backend
			const payload = {
				title: proposal.siteName,
				tagline: proposal.tagline,
			};

			await post('/optimizations/site-basic', payload);

			// If success, advance to next step
			onNext();
		} catch (err) {
			// Log error with context
			logError(err, {
				action: 'apply_site_optimizations',
				component: 'Confirmation',
				step: 'onboarding_step_4',
				payload: {
					hasSiteName: !!proposal.siteName,
					hasTagline: !!proposal.tagline,
				},
			});

			// Get user-friendly error message
			const errorMessage = getErrorMessage(
				err,
				'Failed to apply changes. Please try again.'
			);

			setError(errorMessage);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleReject = () => {
		// Don't send to backend, just skip
		onNext();
	};

	return (
		<OnboardingLayout title="All set! Let's make your site name and tagline shine">
			{/* Description */}
			<div className="mb-8">
				<p className="paragraph-regular text-foreground">
					Based on what you shared, here's my proposal to improve your
					site <strong className="font-semibold">name</strong> and{' '}
					<strong className="font-semibold">tagline</strong>.
				</p>
			</div>

			{/* Loading state */}
			{isLoading && (
				<div className="bg-card border border-border rounded-sm p-6 mb-8">
					<p className="small-regular text-muted-foreground">
						Getting AI suggestions...
					</p>
				</div>
			)}

			{/* Proposal Card */}
			{!isLoading && (
				<div className="bg-card border border-border rounded-sm px-6  py-2 mb-8">
					<div className="space-y-6">
						<div>
							<p className="paragraph-semibold">
								Proposed Site Name:
							</p>
							<p className="small-regular text-neutral-700">
								{proposal.siteName}
							</p>
						</div>

						<div>
							<p className="paragraph-semibold">
								Proposed Tagline:
							</p>
							<p className="small-regular text-neutral-700">
								{proposal.tagline}
							</p>
						</div>
					</div>
				</div>
			)}

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
						onClick={handleAccept}
						disabled={isSubmitting}
					>
						{isSubmitting ? 'Retrying...' : 'Try Again'}
					</Button>
				</div>
			)}

			{/* Action Buttons - separated at extremes */}
			<div className="flex justify-between items-center gap-4">
				<Button
					size="lg"
					onClick={handleAccept}
					disabled={isSubmitting || isLoading}
				>
					{isSubmitting
						? 'Applying changes...'
						: "Great, let's change it!"}
				</Button>
				<Button
					size="lg"
					variant="secondary"
					onClick={handleReject}
					disabled={isSubmitting || isLoading}
				>
					Don't change it for now
				</Button>
			</div>
		</OnboardingLayout>
	);
};

export default Confirmation;
