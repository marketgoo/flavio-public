import { useState, useCallback, useEffect, useRef } from 'react';
import {
	ChevronLeft,
	Sparkles,
	MapPin,
	HandHeart,
	Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { TextInput } from '@/components/ui/text-input';
import { Textarea } from '@/components/ui/textarea';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogFooter,
	DialogTitle,
	DialogDescription,
} from '@/components/ui/dialog';
import PriorityCard from '@/components/ui/priority-card';
import SpeechBubble from '@/components/ui/speech-bubble';
import Header from '@/components/layouts/Header';
import { GOALS, getGoalById } from '@/constants/goals';
import { post, getWordPressConfig } from '@/api/client';
import { logError } from '@/errors/logger';
import { getErrorMessage } from '@/utils/errorMessages';
import usePageView from '@/hooks/analytics/usePageView';

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
 * GoalProfilePage Component
 *
 * Page for editing goal and business profile information.
 * Accessible via ?page=flavio-goal-profile
 */
const GoalProfilePage = () => {
	const config = getWordPressConfig();
	const siteInfo = window.flavioData?.siteInfo;

	// Track page view
	usePageView('goal-profile');

	// Initial data from backend
	const initialData = {
		goal: siteInfo?.goal || '',
		businessOffer: siteInfo?.business_offer || '',
		targetClient: siteInfo?.target_client || '',
		localBusiness: siteInfo?.local_business || '',
	};

	// Form state
	const [formData, setFormData] = useState(initialData);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState(null);
	const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
	const [pendingNavigation, setPendingNavigation] = useState(null);

	// Goal auto-save state
	const [isSavingGoal, setIsSavingGoal] = useState(false);
	const [goalSaveStatus, setGoalSaveStatus] = useState(null); // 'success' | 'error' | null
	const goalSaveTimeoutRef = useRef(null);

	// Profile save status
	const [profileSaveStatus, setProfileSaveStatus] = useState(null); // 'success' | 'error' | null
	const profileSaveTimeoutRef = useRef(null);

	// Track saved values to detect dirty state (updated after successful saves)
	const [savedGoal, setSavedGoal] = useState(initialData.goal);
	const [savedProfile, setSavedProfile] = useState({
		businessOffer: initialData.businessOffer,
		targetClient: initialData.targetClient,
		localBusiness: initialData.localBusiness,
	});

	// Check if profile fields have changes (compared to last saved values)
	const isProfileDirty =
		formData.businessOffer !== savedProfile.businessOffer ||
		formData.targetClient !== savedProfile.targetClient ||
		formData.localBusiness !== savedProfile.localBusiness;

	// Check if profile is valid (all fields filled)
	const isProfileValid =
		formData.businessOffer.trim() &&
		formData.targetClient.trim() &&
		formData.localBusiness.trim();

	// Can save profile: has changes and all fields are valid
	const canSaveProfile = isProfileDirty && isProfileValid;

	// For navigation dirty check, only consider profile fields
	const isDirty = isProfileDirty;

	// Handle form field changes
	const handleChange = (field) => (e) => {
		setFormData((prev) => ({
			...prev,
			[field]: e.target.value,
		}));
		setError(null);
	};

	// Handle goal selection - auto-saves immediately
	const handleGoalSelect = async (goalId) => {
		// Don't do anything if already saving or same goal
		if (isSavingGoal || goalId === savedGoal) return;

		// Update UI immediately
		setFormData((prev) => ({
			...prev,
			goal: goalId,
		}));
		setError(null);

		// Clear any existing timeout
		if (goalSaveTimeoutRef.current) {
			clearTimeout(goalSaveTimeoutRef.current);
		}

		// Save goal
		setIsSavingGoal(true);
		setGoalSaveStatus(null);

		try {
			const payload = {
				goal: goalId,
				business_offer: formData.businessOffer,
				target_client: formData.targetClient,
				local_business: formData.localBusiness,
			};

			await post('/site-business-info', payload);

			// Update window.flavioData to keep it in sync
			if (window.flavioData?.siteInfo) {
				window.flavioData.siteInfo.goal = goalId;
			}

			// Update saved goal reference
			setSavedGoal(goalId);
			setGoalSaveStatus('success');

			// Clear success message after 2 seconds
			goalSaveTimeoutRef.current = setTimeout(() => {
				setGoalSaveStatus(null);
			}, 2000);
		} catch (err) {
			logError(err, {
				action: 'save_goal',
				component: 'GoalProfilePage',
			});

			// Revert to previous goal on error
			setFormData((prev) => ({
				...prev,
				goal: savedGoal,
			}));
			setGoalSaveStatus('error');

			// Clear error message after 2 seconds
			goalSaveTimeoutRef.current = setTimeout(() => {
				setGoalSaveStatus(null);
			}, 2000);
		} finally {
			setIsSavingGoal(false);
		}
	};

	// Cleanup timeouts on unmount
	useEffect(() => {
		return () => {
			if (goalSaveTimeoutRef.current) {
				clearTimeout(goalSaveTimeoutRef.current);
			}
			if (profileSaveTimeoutRef.current) {
				clearTimeout(profileSaveTimeoutRef.current);
			}
		};
	}, []);

	// Save profile to backend
	const handleSaveProfile = async () => {
		if (!canSaveProfile) return;

		setIsSubmitting(true);
		setError(null);

		try {
			// Transform to backend format (snake_case)
			const payload = {
				goal: formData.goal,
				business_offer: formData.businessOffer,
				target_client: formData.targetClient,
				local_business: formData.localBusiness,
			};

			await post('/site-business-info', payload);

			// Update window.flavioData to keep it in sync
			if (window.flavioData?.siteInfo) {
				window.flavioData.siteInfo = {
					...window.flavioData.siteInfo,
					...payload,
				};
			}

			// Update saved profile state (resets dirty check)
			setSavedProfile({
				businessOffer: formData.businessOffer,
				targetClient: formData.targetClient,
				localBusiness: formData.localBusiness,
			});

			// Show success message
			setProfileSaveStatus('success');

			// Clear any existing timeout
			if (profileSaveTimeoutRef.current) {
				clearTimeout(profileSaveTimeoutRef.current);
			}

			// Clear success message after 2 seconds
			profileSaveTimeoutRef.current = setTimeout(() => {
				setProfileSaveStatus(null);
			}, 2000);

			setIsSubmitting(false);
		} catch (err) {
			logError(err, {
				action: 'save_profile',
				component: 'GoalProfilePage',
			});

			setError(
				getErrorMessage(
					err,
					'Failed to save changes. Please try again.'
				)
			);
			setIsSubmitting(false);
		}
	};

	// Handle navigation with unsaved changes check
	const handleNavigation = useCallback(
		(url) => {
			if (isDirty) {
				setPendingNavigation(url);
				setShowUnsavedDialog(true);
			} else {
				window.location.href = url;
			}
		},
		[isDirty]
	);

	// Navigate back to dashboard
	const handleBack = () => {
		handleNavigation(config.adminPageUrl);
	};

	// Dialog: Don't save and navigate
	const handleDiscardAndNavigate = () => {
		setShowUnsavedDialog(false);
		if (pendingNavigation) {
			window.location.href = pendingNavigation;
		}
	};

	// Dialog: Save and navigate
	const handleSaveAndNavigate = async () => {
		setShowUnsavedDialog(false);
		await handleSaveProfile();
		// handleSaveProfile reloads the page on success
	};

	// Browser beforeunload warning
	useEffect(() => {
		const handleBeforeUnload = (e) => {
			if (isDirty) {
				e.preventDefault();
				e.returnValue = '';
			}
		};

		window.addEventListener('beforeunload', handleBeforeUnload);
		return () =>
			window.removeEventListener('beforeunload', handleBeforeUnload);
	}, [isDirty]);

	return (
		<div className="min-h-screen bg-white flex flex-col">
			{/* Header */}
			<div className="sticky top-0 z-50">
				<Header showUserMenu onNavigate={handleNavigation} />
			</div>

			{/* Main content */}
			<main className="flex-1 px-6 py-8 max-w-3xl mx-auto w-full">
				{/* Back button */}
				<button
					type="button"
					onClick={handleBack}
					className="flex items-center gap-1 text-neutral-700 hover:underline transition-colors mb-6 -ml-1 cursor-pointer"
				>
					<ChevronLeft className="w-4 h-4" />
					<span className="small-semibold">Back to smart plan</span>
				</button>

				{/* Page title */}
				<h1 className="heading-h1 mb-8">Goal & Profile</h1>

				{/* Error message */}
				{error && (
					<div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
						<p className="small-regular text-destructive">
							{error}
						</p>
					</div>
				)}

				{/* Goal Section */}
				<section className="my-10">
					<h2 className="heading-h2">Goal</h2>
					<p className="mini-regular text-muted-foreground !mb-5 !mt-1">
						Change your goal if your needs change
					</p>

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
								selected={formData.goal === goal.id}
								onClick={() => handleGoalSelect(goal.id)}
								disabled={isSavingGoal}
							/>
						))}
					</div>

					{/* Goal save status message */}
					{(isSavingGoal || goalSaveStatus) && (
						<div className="flex items-center gap-2 mt-3">
							{isSavingGoal && (
								<>
									<Loader2 className="size-3 animate-spin text-muted-foreground" />
									<span className="text-xs text-muted-foreground">
										Saving your goal...
									</span>
								</>
							)}
							{goalSaveStatus === 'success' && (
								<span className="text-xs text-green-600">
									Goal updated successfully!
								</span>
							)}
							{goalSaveStatus === 'error' && (
								<span className="text-xs text-destructive">
									Oops! Something went wrong. Goal update
									failed.
								</span>
							)}
						</div>
					)}

					{/* Goal tooltip - shows when a goal is selected */}
					{formData.goal && (
						<div className="flex items-center gap-2 mt-6">
							<img
								src={`${config?.pluginUrl || ''}js/public/onboarding.svg`}
								alt="Flavio"
								className="size-6 shrink-0"
								aria-hidden="true"
							/>
							<SpeechBubble arrow="left" className="ml-2">
								{getGoalById(formData.goal)?.tooltip}
							</SpeechBubble>
						</div>
					)}
				</section>

				{/* Profile Section */}
				<section className="mb-10">
					<h2 className="heading-h2">Profile</h2>
					<p className="mini-regular text-muted-foreground !mb-6 !mt-1">
						Update your business profile info
					</p>

					<div className="!space-y-6">
						{/* Business description */}
						<div className="flex flex-col gap-1">
							<Label htmlFor="businessOffer">
								How would you describe your business?
							</Label>
							<Textarea
								id="businessOffer"
								value={formData.businessOffer}
								onChange={handleChange('businessOffer')}
								placeholder="A cozy local café offering specialty coffee and homemade pastries."
								error={
									!formData.businessOffer.trim() && isDirty
								}
							/>
							{!formData.businessOffer.trim() && isDirty && (
								<p className="mini-regular text-muted-foreground !mt-0">
									Write a description of your business
								</p>
							)}
						</div>

						{/* Target customers */}
						<div className="flex flex-col gap-1">
							<Label htmlFor="targetClient">
								How would you describe your typical customers?
							</Label>
							<Textarea
								id="targetClient"
								value={formData.targetClient}
								onChange={handleChange('targetClient')}
								placeholder="Coffee lovers and remote workers, mostly adults aged 20–40, looking for a comfortable place to relax or work."
								error={!formData.targetClient.trim() && isDirty}
							/>
							{!formData.targetClient.trim() && isDirty && (
								<p className="mini-regular text-muted-foreground !mt-0">
									Write a description of your customer
								</p>
							)}
						</div>

						{/* Physical address */}
						<div className="flex flex-col gap-1">
							<Label htmlFor="localBusiness">
								Do you have a physical address for your
								business?
							</Label>
							<TextInput
								id="localBusiness"
								value={formData.localBusiness}
								onChange={handleChange('localBusiness')}
								placeholder="456 Oak Avenue, Rivertown, USA"
								error={
									!formData.localBusiness.trim() && isDirty
								}
							/>
							{!formData.localBusiness.trim() && isDirty && (
								<p className="mini-regular text-muted-foreground !mt-0">
									Write your physical address or 'no' if you
									don't have
								</p>
							)}
						</div>
					</div>
				</section>

				{/* Save button */}
				<div className="flex items-center gap-3">
					<Button
						onClick={handleSaveProfile}
						disabled={!canSaveProfile || isSubmitting}
					>
						{isSubmitting ? 'Saving...' : 'Save'}
					</Button>
					{profileSaveStatus === 'success' && (
						<span className="text-xs text-green-600">
							Profile updated successfully!
						</span>
					)}
				</div>
			</main>

			{/* Unsaved changes dialog */}
			<Dialog
				open={showUnsavedDialog}
				onOpenChange={setShowUnsavedDialog}
			>
				<DialogContent>
					<p className="paragraph-semibold !mb-0">
						You have unsaved changes. Do you want to save now?
					</p>
					<p className="paragraph-regular text-neutral-700 !mt-0">
						If you leave, your changes will be lost
					</p>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={handleDiscardAndNavigate}
						>
							Don't save
						</Button>
						<Button
							onClick={handleSaveAndNavigate}
							disabled={!isProfileValid}
						>
							Save changes
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default GoalProfilePage;
