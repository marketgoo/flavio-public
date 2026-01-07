import PageLayout from '@/components/layouts/PageLayout';
import ProgressReporting from '@/features/dashboard/ProgressReporting';
import SmartPlan from '@/features/dashboard/SmartPlan';
import usePageView from '@/hooks/analytics/usePageView';

/**
 * DashboardPage Component
 *
 * Main application page showing Goal updates and Smart plan tasks.
 * Orchestrates ProgressReporting and SmartPlan features with mock data.
 * Currently uses hardcoded data for testing - will be replaced with API calls.
 * Header is rendered at App level.
 *
 * @example
 * <DashboardPage />
 */
const DashboardPage = () => {
	// Track page view on mount
	usePageView('dashboard');

	// Mock data - will come from API in the future
	const selectedGoal = 'Increase my visibility on Google and AI assistants';

	// Handler to open Google connections page
	const handleConnectAccount = () => {
		const connectionsUrl =
			window.flavioData?.flavioAuthenticatedUrls?.connections;
		if (connectionsUrl) {
			window.open(connectionsUrl, '_blank');
		}
	};

	return (
		<main className="flex-1 overflow-y-auto py-12">
			<PageLayout>
				{/* Page Header */}
				<header className="mb-8">
					<h1 className="heading-h1 mb-2">
						Welcome back — let's make progress!
					</h1>
					<p className="paragraph-regular text-foreground">
						I've checked your latest results — let's see how your{' '}
						<strong>{selectedGoal}</strong> is doing and what's
						coming next.
					</p>
				</header>

				{/* Progress Reporting Feature */}
				<ProgressReporting
					selectedGoal={selectedGoal}
					onConnectAccount={handleConnectAccount}
				/>

				{/* Smart Plan Feature */}
				<SmartPlan />
			</PageLayout>
		</main>
	);
};

export default DashboardPage;
