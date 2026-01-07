import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import ProgressBulletList from '@/components/dashboard/ProgressBulletList';
import StatusBanner from '@/components/dashboard/StatusBanner';
import { Goal, Plug2 } from 'lucide-react';
import { get } from '@/api/client';
import { logError } from '@/errors/logger';
import { EMPTY_STATES_CONFIG } from './config/progressReporting';

/**
 * Skeleton for ProgressReporting loading state
 * Shows placeholder for bullet list items and status banner
 */
const ProgressReportingSkeleton = () => (
	<div className="bg-primary-foreground p-6 rounded-lg">
		{/* Bullet list skeleton */}
		<div className="space-y-4 mb-4">
			{[1, 2, 3].map((i) => (
				<div key={i} className="flex items-center gap-3">
					<Skeleton className="w-4 h-4 rounded flex-shrink-0" />
					<Skeleton className="h-4 w-3/4" />
				</div>
			))}
		</div>
		{/* Status banner skeleton */}
		<div className="flex items-center justify-between gap-4">
			<Skeleton className="h-10 flex-1 max-w-md rounded-xl" />
			<Skeleton className="h-10 w-28 rounded-md" />
		</div>
	</div>
);

// ============================================================================
// Private Subcomponent
// ============================================================================

/**
 * Empty state wrapper for ProgressReporting with configurable content and actions
 *
 * @param {Object} config - Empty state configuration from EMPTY_STATES_CONFIG
 * @param {Function} onPrimaryAction - Called when primary button is clicked
 */
const ProgressReportingEmptyState = ({ config, onPrimaryAction }) => (
	<Empty>
		<EmptyHeader>
			<EmptyMedia variant="icon">
				<Plug2 />
			</EmptyMedia>
			<EmptyTitle>{config.title}</EmptyTitle>
			<EmptyDescription>{config.description}</EmptyDescription>
		</EmptyHeader>
		<EmptyContent>
			<Button
				variant={config.primaryButton.variant}
				onClick={onPrimaryAction}
			>
				{config.primaryButton.label}
			</Button>
		</EmptyContent>
	</Empty>
);

// ============================================================================
// Main Component
// ============================================================================

/**
 * ProgressReporting Feature
 *
 * Displays goal metrics, progress indicators, and status banner with multiple UI states.
 * Fetches progress reporting data from `/progress-reporting` endpoint and renders
 * Markdown-formatted bullet points. Uses the Empty component pattern for non-data states.
 *
 * **API Integration**:
 * - Endpoint: `GET /progress-reporting`
 * - Response codes:
 *   - `200 OK` with data: `[{ "reporting": ["**Bold**: Text...", "..."] }]` - Connected with data
 *   - `200 OK` empty: `[]` or `[{ "reporting": [] }]` - Connected but waiting for data
 *   - `204 No Content`: NOT connected to Google
 *   - `5xx Server Error`: Server error, shows error state
 * - Markdown format: Supports `**bold**`, `*italic*`, links, etc.
 *
 * **States** (derived from API response):
 * - `not-connected`: 204 response - No Google accounts connected
 * - `waiting`: 200 with empty data - Connected but waiting for data
 * - `with-data`: 200 with data - Connected and displaying progress metrics
 * - `error`: 5xx errors - Failed to fetch or process data
 *
 * @param {string} selectedGoal - The user's selected goal text (e.g., "Get more traffic")
 * @param {string} [statusMessage="You're doing great — consistency brings results!"] - Motivational message shown in the status banner
 * @param {Function} [onConnectAccount] - Called when user clicks "Connect account" (not-connected state)
 *
 * @example
 * <ProgressReporting
 *   selectedGoal="Get more customers"
 *   statusMessage="Keep going! You're making great progress."
 *   onConnectAccount={handleConnect}
 * />
 */
const ProgressReporting = ({
	selectedGoal,
	statusMessage = "You're doing great — consistency brings results!",
	onConnectAccount,
}) => {
	const [reportingData, setReportingData] = useState([]);
	const [updated, setUpdated] = useState(null);
	const [isLoading, setIsLoading] = useState(true); // Start loading
	const [isConnected, setIsConnected] = useState(true); // Assume connected until 204
	const [error, setError] = useState(null);

	// Fetch progress reporting data from API
	const fetchProgressReporting = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		setIsConnected(true); // Assume connected until proven otherwise

		try {
			const response = await get('/progress-reporting');

			// Handle different response scenarios:
			// - 204 No Content: NOT connected to Google
			// - 200 OK with empty data: Connected, waiting for data
			// - 200 OK with data: Connected with data
			if (response === null) {
				// 204: Not connected to Google
				setIsConnected(false);
				setReportingData([]);
			} else if (
				response &&
				response[0] &&
				response[0].reporting?.length > 0
			) {
				// 200 with data
				setReportingData(response[0].reporting);
				setUpdated(response.updated);
			} else {
				// 200 with empty data - connected but waiting
				setReportingData([]);
			}
		} catch (err) {
			logError(err, {
				context: 'ProgressReporting - Fetching progress reporting',
				endpoint: '/progress-reporting',
			});
			setError(err);
		} finally {
			setIsLoading(false);
		}
	}, []);

	// Fetch on mount
	useEffect(() => {
		fetchProgressReporting();
	}, [fetchProgressReporting]);

	// Derived state for status calculation
	// Priority: error > not-connected > waiting > with-data
	const getEffectiveStatus = () => {
		if (error) return 'error';
		if (!isConnected) return 'not-connected';
		if (isLoading || reportingData.length === 0) return 'waiting';
		return 'with-data';
	};

	const effectiveStatus = getEffectiveStatus();
	const currentEmptyState = EMPTY_STATES_CONFIG[effectiveStatus];
	const showMetrics = effectiveStatus === 'with-data';

	// Handler for primary button based on current state
	const handlePrimaryAction = () => {
		if (effectiveStatus === 'not-connected') {
			onConnectAccount?.();
		} else {
			// Re-fetch data for 'waiting' and 'error' states
			fetchProgressReporting();
		}
	};

	return (
		<section className="mb-12">
			<div className="flex items-center gap-2">
				<Goal className="w-6 h-6 text-magenta-500" />
				<h2 className="heading-h3">Goal update</h2>
			</div>

			<p className="paragraph-regular text-muted-foreground mb-6">
				Track your goal here <strong>{selectedGoal}</strong> — key
				metrics, progress, and quick wins as we go.
			</p>

			{/* Metrics and Status Banner Container */}
			{isLoading ? (
				<ProgressReportingSkeleton />
			) : showMetrics ? (
				<div className="bg-primary-foreground p-6 rounded-lg">
					<ProgressBulletList items={reportingData} />
					<StatusBanner
						message={statusMessage}
						updated={updated}
					/>
				</div>
			) : (
				<ProgressReportingEmptyState
					config={currentEmptyState}
					onPrimaryAction={handlePrimaryAction}
				/>
			)}
		</section>
	);
};

export default ProgressReporting;
