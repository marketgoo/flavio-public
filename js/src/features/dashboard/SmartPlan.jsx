import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselPrevious,
	CarouselNext,
} from '@/components/ui/carousel';
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from '@/components/ui/empty';
import { BrainCircuit, Clipboard, Loader2, AlertCircle } from 'lucide-react';
import TaskCard from './TaskCard';
import {
	getTaskEmoji,
	getTaskTags,
	TASK_DEFINITIONS,
} from './config/taskDefinitions';
import GuidedTaskChat from '@/features/chat/GuidedTaskChat';
import useSmartPlan from '@/hooks/useSmartPlan';
import useScan, { SCAN_STATE } from '@/hooks/useScan';
import useAnalytics from '@/hooks/analytics/useAnalytics';
import { getWordPressConfig } from '@/api/client';

/**
 * Skeleton for TaskCard loading state in carousel
 */
const TaskCardSkeleton = () => (
	<Card className="p-6 min-h-[280px]">
		{/* Title */}
		<Skeleton className="h-6 w-3/4 mb-3" />
		{/* Description lines */}
		<div className="space-y-2 mb-4 flex-1">
			<Skeleton className="h-4 w-full" />
			<Skeleton className="h-4 w-5/6" />
			<Skeleton className="h-4 w-2/3" />
		</div>
		{/* Separator */}
		<Skeleton className="h-px w-full my-4" />
		{/* Tags and buttons */}
		<div className="flex items-center justify-between gap-4">
			<div className="flex gap-2">
				<Skeleton className="h-5 w-16" />
				<Skeleton className="h-5 w-14" />
			</div>
			<div className="flex gap-2">
				<Skeleton className="h-9 w-28 rounded-md" />
				<Skeleton className="h-9 w-24 rounded-md" />
			</div>
		</div>
	</Card>
);

/**
 * Skeleton for SmartPlan loading state
 */
const SmartPlanSkeleton = () => (
	<div className="px-12">
		<TaskCardSkeleton />
	</div>
);

/**
 * Header for SmartPlan section
 */
const SmartPlanHeader = () => {
	return (
		<>
			<div className="flex items-center gap-2">
				<BrainCircuit className="w-8 h-8 text-magenta-500" />
				<h2 className="heading-h2">Next steps to grow</h2>
			</div>

			<p className="paragraph-regular text-neutral-700 mb-6 mt-1!">
				Ready improvements I can apply for you, review or apply them
				with one click.
			</p>
		</>
	);
};

/**
 * SmartPlan Feature
 *
 * Displays the Smart Plan section with a carousel of task cards.
 * Shows one task at a time with navigation arrows.
 * Uses shadcn/ui Carousel component built on Embla Carousel.
 *
 * @example
 * <SmartPlan />
 */
const SmartPlan = () => {
	const { track, EVENTS } = useAnalytics();
	const config = getWordPressConfig();

	// Smart Plan hook - fetches tasks and manages state
	const {
		tasks,
		isLoading,
		isEmpty,
		hasError,
		allTasksComplete,
		hasApplyingTask,
		fetchTasks,
		applyTask,
		completeTask,
		dismissTask,
	} = useSmartPlan();

	// Scan hook - manages scan workflow
	const { scanState, progress, isScanning, startScan } = useScan({
		onScanComplete: () => {
			// When scan completes, refresh tasks
			fetchTasks();
		},
	});

	// Drawer state for GuidedTaskChat
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	const [selectedTask, setSelectedTask] = useState(null);

	/**
	 * Handle primary action (Apply or Mark as done)
	 */
	const handleAction = async (task) => {
		if (task.actionType === 'apply') {
			await applyTask(task);
		} else {
			await completeTask(task);
		}
	};

	/**
	 * Handle "View details" button
	 * - For tasks with viewType: 'page', navigates to dedicated page
	 * - For other tasks, opens the chat drawer
	 */
	const handleAskFlavio = (task) => {
		const taskDef = TASK_DEFINITIONS[task.type] || TASK_DEFINITIONS.default;

		// Check if this task type should open a dedicated page
		if (taskDef.viewType === 'page') {
			// Store task data in window for the page to access
			window.flavioData = window.flavioData || {};
			window.flavioData.pageOptimizationTask = task;

			// Navigate to the page optimization page
			const pageUrl = `${config.adminPageUrl}&subpage=page-optimization&task_id=${task.id}`;
			window.location.href = pageUrl;
			return;
		}

		// Default: open drawer
		setSelectedTask(task);
		setIsDrawerOpen(true);
	};

	/**
	 * Handle "Dismiss" button
	 */
	const handleDismiss = async (task) => {
		await dismissTask(task);
	};

	/**
	 * Handle "Refresh Smart Plan" button - starts a new scan
	 */
	const handleRefresh = async () => {
		track(EVENTS.REFRESH_PLAN_CLICK);
		await startScan();
	};

	/**
	 * Prepare tasks with emojis and tags for rendering
	 */
	const tasksWithData = tasks.map((task) => ({
		...task,
		emoji: getTaskEmoji(task.type),
		tags: getTaskTags(task.type),
	}));

	// Render initial loading state with skeleton
	if (isLoading) {
		return (
			<section>
				<SmartPlanHeader />
				<SmartPlanSkeleton />
			</section>
		);
	}

	// Render scanning state with spinner and progress
	if (isScanning) {
		return (
			<section>
				<SmartPlanHeader />
				<div className="flex flex-col items-center justify-center py-12 gap-3">
					<Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
					<p className="small-regular text-muted-foreground">
						{scanState === SCAN_STATE.CONNECTING && 'Connecting...'}
						{scanState === SCAN_STATE.STARTING &&
							'Starting scan...'}
						{scanState === SCAN_STATE.IN_PROGRESS &&
							`Scanning your site... ${progress}%`}
					</p>
				</div>
			</section>
		);
	}

	// Render error state
	if (hasError) {
		return (
			<section>
				<div className="flex items-center gap-2 mb-3">
					<BrainCircuit className="w-8 h-8 text-magenta-500" />
					<h2 className="heading-h2">Next steps to grow</h2>
				</div>
				<Empty>
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<AlertCircle className="text-destructive" />
						</EmptyMedia>
						<EmptyTitle>Unable to load tasks</EmptyTitle>
						<EmptyDescription>
							Something went wrong while loading your tasks.
							Please try again.
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<Button variant="dark" onClick={handleRefresh}>
							Try again
						</Button>
					</EmptyContent>
				</Empty>
			</section>
		);
	}

	// Render empty/completed state
	if (isEmpty || allTasksComplete) {
		return (
			<section>
				<SmartPlanHeader />
				<Empty>
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<Clipboard />
						</EmptyMedia>
						<EmptyTitle>
							{allTasksComplete
								? 'All tasks complete!'
								: 'No tasks yet'}
						</EmptyTitle>
						<EmptyDescription>
							{allTasksComplete
								? "New actions will be ready soon. I'll email you when they're live."
								: 'Click below to analyze your site and get personalized recommendations.'}
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<Button onClick={handleRefresh}>
							Refresh Smart Plan
						</Button>
					</EmptyContent>
				</Empty>
			</section>
		);
	}

	// Render carousel with tasks
	return (
		<>
			<section>
				<SmartPlanHeader />

				{/* Wrapper with cream background (same as Empty component) */}
				<div className="bg-accent rounded-lg border p-6">
					{/* Carousel - standard shadcn/ui pattern with custom button positioning */}
					<Carousel className="w-full">
						<div className="flex items-center gap-4">
							<CarouselPrevious className="static translate-y-0 shrink-0" />
							<div className="flex-1 overflow-hidden rounded-lg">
								<CarouselContent className="-ml-4">
									{tasksWithData.map((task) => (
										<CarouselItem
											key={task.id}
											className="pl-4 overflow-hidden rounded-lg"
										>
											<TaskCard
												task={task}
												onAction={handleAction}
												onAskFlavio={handleAskFlavio}
												onDismiss={handleDismiss}
												isDisabled={hasApplyingTask}
											/>
										</CarouselItem>
									))}
								</CarouselContent>
							</div>
							<CarouselNext className="static translate-y-0 shrink-0" />
						</div>
					</Carousel>
				</div>
			</section>

			{/* Guided Task Chat Drawer */}
			<Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
				<SheetContent
					side="right"
					className="w-full sm:max-w-lg p-0 top-[32px] h-[calc(100vh-32px)] bg-card"
				>
					<SheetTitle className="sr-only">
						{selectedTask
							? `Chat about ${selectedTask.title}`
							: 'Task chat'}
					</SheetTitle>
					{selectedTask && (
						<GuidedTaskChat
							task={selectedTask}
							onApply={async () => {
								await applyTask(selectedTask);
							}}
							onMarkDone={async () => {
								await completeTask(selectedTask);
							}}
							onDismiss={async () => {
								await dismissTask(selectedTask);
							}}
							onClose={() => setIsDrawerOpen(false)}
						/>
					)}
				</SheetContent>
			</Sheet>
		</>
	);
};

export default SmartPlan;
