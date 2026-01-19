/**
 * PageOptimizationPage Component
 *
 * Dedicated page for page optimization task detail view.
 * Features a conversational chat for topic selection and
 * editable proposed changes sections.
 *
 * Flow:
 * 1. Chat phase: User selects a topic for optimization
 * 2. Loading phase: Fetching proposals from backend
 * 3. Editing phase: User reviews/edits proposals
 * 4. User clicks "Publish it for me" to apply changes
 *
 * @module pages/PageOptimizationPage
 */

import { useState, useCallback } from 'react';
import {
	ChevronLeft,
	Loader2,
	AlertCircle,
	CheckCircle2,
	ExternalLink,
	FileText,
	FileCheck2,
	Rocket,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { ProgressChecklist } from '@/components/ui/progress-checklist';
import Header from '@/components/layouts/Header';
import ConversationalChat from '@/features/chat/ConversationalChat';
import ProposedChangesEditor from '@/components/dashboard/ProposedChangesEditor';
import usePageOptimization, {
	OPTIMIZATION_PHASE,
} from '@/hooks/usePageOptimization';
import { getWordPressConfig } from '@/api/client';
import usePageView from '@/hooks/analytics/usePageView';
import useAnalytics from '@/hooks/analytics/useAnalytics';
import Markdown from 'markdown-to-jsx';

/**
 * Chat questions for topic selection
 * These are configured inline for the page optimization flow
 */
const CHAT_QUESTIONS = [
	{
		id: 'topic',
		type: 'options',
		question:
			"Hi! Let's take a closer look at your page so I can optimize it the best way. First, let's **confirm the main topic** you want this page to focus on — this helps me improve the title, content, tags, and more so everything works better for you.\n\nYou can use your current page's topic, pick one of the suggestions below, or type your own. What topic should this page focus on?",
		field: 'selectedTopic',
		options: [
			{
				label: 'How to care for handmade jewelry',
				value: 'How to care for handmade jewelry',
			},
			{
				label: 'Top 5 tips for choosing the perfect necklace',
				value: 'Top 5 tips for choosing the perfect necklace',
			},
			{
				label: 'Why handmade jewelry is the best gift option',
				value: 'Why handmade jewelry is the best gift option',
			},
		],
	},
];

/**
 * Expected results after optimization (mock data)
 */
const EXPECTED_RESULTS = [
	'**More people will find your page** when searching for jewelry care tips.',
	'**Visitors will click more often** because the title and description are clearer and appealing.',
	'**Your content will reach the right audience** who are looking for guidance.',
	'**Readers will enjoy a better experience** thanks to clear, easy-to-follow tips.',
	'**Your page will feel trustworthy and helpful**, keeping visitors coming back for advice.',
];

/**
 * Loading tasks for the optimization process
 */
const LOADING_TASKS = [
	{ id: 1, label: 'Reviewing your page…', delay: 800 },
	{ id: 2, label: 'Finding improvement opportunities…', delay: 1600 },
	{
		id: 3,
		label: 'Aligning everything with your selected topic…',
		delay: 2400,
	},
	{ id: 4, label: 'Preparing the optimization tasks…', delay: 3200 },
	{ id: 5, label: 'Almost ready, polishing the final details…', delay: 4000 },
];

/**
 * PageOptimizationPage Component
 */
const PageOptimizationPage = () => {
	const config = getWordPressConfig();

	// Track page view
	usePageView('page-optimization');
	const { track, EVENTS } = useAnalytics();

	// Get task data from URL params or flavioData
	const taskData = window.flavioData?.pageOptimizationTask || {
		id: 'pageoptimization_1',
		type: 'pageoptimization',
		metadata: {
			page_id: 1,
			page_title: 'How to care for handmade jewelry',
			page_url: '/jewelry-care/',
		},
	};

	// Page optimization hook
	const {
		phase,
		selectedTopic,
		proposals,
		error,
		isApplying,
		isSuccess,
		hasError,
		canApply,
		selectTopic,
		updateProposal,
		toggleProposalExpanded,
		applyProposals,
		postponeTask,
		reset,
	} = usePageOptimization({
		task: taskData,
		onSuccess: () => {
			track(EVENTS.TASK_APPLY_SUCCESS, {
				task_name: 'Page Optimization',
				topic: selectedTopic,
			});
		},
		onError: (err) => {
			track(EVENTS.TASK_APPLY_ERROR, {
				task_name: 'Page Optimization',
				error: err?.message,
			});
		},
	});

	// Dialog state for postpone confirmation
	const [showPostponeDialog, setShowPostponeDialog] = useState(false);

	/**
	 * Handle chat completion - topic selected
	 */
	const handleChatComplete = useCallback(
		(responses) => {
			const topic = responses.selectedTopic;
			if (topic) {
				selectTopic(topic);
			}
		},
		[selectTopic]
	);

	/**
	 * Handle navigation with confirmation if needed
	 */
	const handleNavigation = useCallback((url) => {
		window.location.href = url;
	}, []);

	/**
	 * Navigate back to dashboard
	 */
	const handleBack = () => {
		handleNavigation(config.adminPageUrl);
	};

	/**
	 * Handle postpone action
	 */
	const handlePostpone = () => {
		setShowPostponeDialog(true);
	};

	/**
	 * Confirm postpone and go back
	 */
	const confirmPostpone = async () => {
		setShowPostponeDialog(false);
		track(EVENTS.TASK_POSTPONE_CLICK, {
			task_name: 'Page Optimization',
			topic: selectedTopic,
		});

		// Call the dismiss endpoint before navigating back
		await postponeTask();

		handleBack();
	};

	/**
	 * Handle "Publish it for me" click
	 */
	const handlePublish = async () => {
		track(EVENTS.TASK_APPLY_CLICK, {
			task_name: 'Page Optimization',
			topic: selectedTopic,
		});
		await applyProposals();
	};

	/**
	 * Handle success state - return to dashboard
	 */
	const handleSuccessContinue = () => {
		handleBack();
	};

	// Render loading proposals state (full page with ProgressChecklist)
	if (phase === OPTIMIZATION_PHASE.LOADING_PROPOSALS) {
		return (
			<div className="min-h-screen bg-white flex flex-col">
				<div className="sticky top-0 z-50">
					<Header showUserMenu onNavigate={handleNavigation} />
				</div>
				<main className="flex-1 flex items-center justify-center">
					<ProgressChecklist
						title="Optimizing your page…"
						subtitle="I'm preparing your customized optimization plan. In a moment, you'll see all the tasks that can help this page perform better."
						tasks={LOADING_TASKS}
					/>
				</main>
			</div>
		);
	}

	// Render success state
	if (isSuccess) {
		return (
			<div className="min-h-screen bg-white flex flex-col">
				<div className="sticky top-0 z-50">
					<Header showUserMenu onNavigate={handleNavigation} />
				</div>
				<main className="flex-1 flex items-center justify-center px-6">
					<Card className="p-8 max-w-md text-center">
						<div className="flex justify-center mb-4">
							<CheckCircle2 className="w-16 h-16 text-lime-500" />
						</div>
						<h2 className="heading-h2 mb-2">Changes Applied!</h2>
						<p className="paragraph-regular text-muted-foreground mb-6">
							Your page has been optimized successfully. The
							changes are now live on your site.
						</p>
						<Button onClick={handleSuccessContinue}>
							Back to Smart Plan
						</Button>
					</Card>
				</main>
			</div>
		);
	}

	// Render error state
	if (hasError) {
		return (
			<div className="min-h-screen bg-white flex flex-col">
				<div className="sticky top-0 z-50">
					<Header showUserMenu onNavigate={handleNavigation} />
				</div>
				<main className="flex-1 flex items-center justify-center px-6">
					<Card className="p-8 max-w-md text-center">
						<div className="flex justify-center mb-4">
							<AlertCircle className="w-16 h-16 text-destructive" />
						</div>
						<h2 className="heading-h2 mb-2">
							Something went wrong
						</h2>
						<p className="paragraph-regular text-muted-foreground mb-6">
							{error?.message ||
								"We couldn't apply the changes. Please try again."}
						</p>
						<div className="flex gap-3 justify-center">
							<Button variant="outline" onClick={handleBack}>
								Back to Smart Plan
							</Button>
							<Button onClick={reset}>Try Again</Button>
						</div>
					</Card>
				</main>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-white flex flex-col">
			{/* Header */}
			<div className="sticky top-0 z-50">
				<Header showUserMenu onNavigate={handleNavigation} />
			</div>

			{/* Main content */}
			<main className="flex-1 px-6 py-8 max-w-4xl mx-auto w-full">
				{/* Back button */}
				<button
					type="button"
					onClick={handleBack}
					className="flex items-center gap-1 text-neutral-700 hover:underline transition-colors mb-6 -ml-1 cursor-pointer"
				>
					<ChevronLeft className="w-4 h-4" />
					<span className="small-semibold">Back to smart plan</span>
				</button>

				{/* Page title and subtitle */}
				<div className="mb-6">
					<h1 className="heading-h1 mb-2">Page Optimization</h1>
					<p className="paragraph-regular text-muted-foreground">
						Let's improve your page's visibility and clarity
						together.
					</p>
				</div>

				{/* Page info banner - mint/lime green bar */}
				<div className="mb-8 flex items-center justify-between p-4 bg-lime-50 rounded-lg border border-lime-200">
					<span className="text-primary flex align-middle">
						<FileText className="w-6 h-6 mr-1 text-lime-500" />
						<span className="paragraph-semibold mr-1">Page:</span>
						<span className="paragraph-regular">
							{taskData.metadata?.page_title || 'Your page'}
						</span>
					</span>
					<a
						href={taskData.metadata?.page_url || '#'}
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-2 text-sm font-medium text-neutral-700 hover:text-neutral-900 hover:underline! transition-colors"
					>
						<ExternalLink className="w-4 h-4" />
						View page
					</a>
				</div>

				{/* Chat Phase */}
				{phase === OPTIMIZATION_PHASE.CHAT && (
					<section className="mb-10">
						<ConversationalChat
							questions={CHAT_QUESTIONS}
							onComplete={handleChatComplete}
							completionMessage="Perfect! Let me analyze that for you..."
							optionsVariant="chips"
							showInputWithOptions
							inputPlaceholder="Write something..."
						/>
					</section>
				)}

				{/* Editing Phase */}
				{phase === OPTIMIZATION_PHASE.EDITING && (
					<>
						{/* Expected Results Section - comes first */}
						<section className="mb-14">
							<div className="flex flex-col gap-4">
								{/* Section header with icon */}
								<div>
									<div className="flex items-center gap-2">
										<Rocket className="w-8 h-8 text-magenta-500" />
										<h2 className="heading-h2">
											Expected results
										</h2>
									</div>
									<p className="paragraph-regular text-neutral-700 mt-1!">
										This update is designed to deliver these
										results
									</p>
								</div>

								{/* Results card */}
								<Card className="p-6 bg-neutral-50">
									<ul className="space-y-2 list-disc! list-inside!">
										{EXPECTED_RESULTS.map(
											(result, index) => (
												<li
													key={index}
													className="small-regular text-neutral-700 mb-6!"
												>
													<Markdown>
														{result}
													</Markdown>
												</li>
											)
										)}
									</ul>
								</Card>
							</div>
						</section>

						{/* Proposed Changes Section */}
						<section className="mb-8">
							<div className="flex flex-col gap-4">
								{/* Section header with icon and action buttons */}
								<div>
									<div className="flex items-center gap-2">
										<FileCheck2 className="w-8 h-8 text-magenta-500" />
										<h2 className="heading-h2">
											Proposed Changes
										</h2>
									</div>
									<p className="paragraph-regular text-neutral-700 mt-1!">
										This is the optimized version of your
										content.
									</p>
								</div>

								{/* Action bar with CTA */}
								<div className="flex items-start justify-between gap-4">
									<p className="paragraph-semibold">
										One click to improve. I've got the rest
									</p>
									<div className="flex items-center gap-2">
										<Button
											variant="outline"
											onClick={handlePostpone}
											disabled={isApplying}
										>
											Postpone
										</Button>
										<Button
											onClick={handlePublish}
											disabled={!canApply || isApplying}
										>
											{isApplying ? (
												<>
													<Loader2 className="w-4 h-4 mr-2 animate-spin" />
													Applying...
												</>
											) : (
												'Publish it for me'
											)}
										</Button>
									</div>
								</div>

								{/* Proposed changes accordions */}
								<ProposedChangesEditor
									proposals={proposals}
									onUpdateProposal={updateProposal}
									onToggleProposal={toggleProposalExpanded}
								/>
							</div>
						</section>
					</>
				)}

				{/* Applying Phase */}
				{phase === OPTIMIZATION_PHASE.APPLYING && (
					<section className="mb-8">
						<Card className="p-8 flex flex-col items-center justify-center min-h-[300px]">
							<Loader2 className="w-8 h-8 animate-spin text-magenta-500 mb-4" />
							<p className="paragraph-regular text-muted-foreground">
								Applying your changes...
							</p>
						</Card>
					</section>
				)}
			</main>

			{/* Postpone confirmation dialog */}
			<Dialog
				open={showPostponeDialog}
				onOpenChange={setShowPostponeDialog}
			>
				<DialogContent>
					<p className="paragraph-semibold !mb-0">
						Are you sure you want to postpone?
					</p>
					<p className="paragraph-regular text-neutral-700 !mt-0">
						No problem! We can come back to this task anytime. I'll
						remind you later, and you can focus on other tasks in
						the meantime.
					</p>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setShowPostponeDialog(false)}
						>
							Cancel
						</Button>
						<Button onClick={confirmPostpone}>Yes, postpone</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default PageOptimizationPage;
