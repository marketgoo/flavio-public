import { useState, useEffect, Suspense } from 'react';
import LoginPage from '@/pages/LoginPage';
import OnboardingPage from '@/pages/OnboardingPage';
import DashboardPage from '@/pages/DashboardPage';
import GoalProfilePage from '@/pages/GoalProfilePage';
import PageOptimizationPage from '@/pages/PageOptimizationPage';
import Header from '@/components/layouts/Header';
import TrialBanner from '@/components/layouts/TrialBanner';
import { get, getWordPressConfig } from '@/api/client';
import { logError } from '@/errors/logger';
import useAnalytics from '@/hooks/analytics/useAnalytics';
import { initEvents, identify as identifyEvents, EVENTS } from '@/lib/events';
import { initSentry, identify as identifySentry } from '@/lib/errorMonitoring';
import useOnboarding from '@/hooks/useOnboarding';
import DevTools from '@/devtools';

/**
 * App Component
 *
 * Main application router
 * Handles authentication and onboarding flow
 * Header is always visible, but user menu only shows on dashboard
 */
const App = () => {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	const { track } = useAnalytics();
	const { isCompleted: onboardingComplete } = useOnboarding();

	useEffect(() => {
		// Check authentication status with WordPress
		const checkAuth = async () => {
			try {
				const config = getWordPressConfig();
				const data = await get(config.endpoints.status);

				setIsAuthenticated(data.authenticated);
			} catch (error) {
				// Log error with colors
				logError(error, {
					action: 'check_auth',
					component: 'App',
				});

				// Any error means not authenticated
				setIsAuthenticated(false);
			}
		};

		const init = async () => {
			await checkAuth();
			setIsLoading(false);
		};

		init();
	}, []);

	const handleOnboardingComplete = () => {
		track(EVENTS.ONBOARDING_SUCCESSFUL);
		// Reload to get fresh backend data and re-check isCompleted
		window.location.reload();
	};

	// Initialize events tracking when user authenticates
	useEffect(() => {
		if (isAuthenticated) {
			const { user } = getWordPressConfig();
			initSentry();
			initEvents();

			// Only identify if user data is available
			if (user && user.ulid) {
				identifyEvents(user.ulid, {
					email: user.email,
					name: user.name,
				});
				identifySentry(user.ulid, {
					email: user.email,
					name: user.name,
				});
			}
		}
	}, [isAuthenticated]);

	// Loading state
	if (isLoading) {
		return (
			<div className="min-h-screen bg-white flex items-center justify-center">
				<p className="text-muted-foreground">Loading...</p>
			</div>
		);
	}

	// Not authenticated → Show login/welcome page
	if (!isAuthenticated) {
		return (
			<div className="min-h-screen bg-white flex flex-col">
				<div className="sticky top-0 z-50">
					<Header showUserMenu={false} />
				</div>
				<LoginPage />
			</div>
		);
	}

	// Authenticated but onboarding not complete
	if (!onboardingComplete) {
		return (
			<div className="min-h-screen bg-white flex flex-col">
				<div className="sticky top-0 z-50">
					<Header showUserMenu={false} />
				</div>
				<OnboardingPage onComplete={handleOnboardingComplete} />
			</div>
		);
	}

	// Authenticated and onboarded → Check which page to render
	const currentPage = getWordPressConfig()?.currentPage || 'default';

	// Goal & Profile page has its own layout
	if (currentPage === 'goal-profile') {
		return (
			<Suspense fallback={null}>
				<GoalProfilePage />
				<DevTools />
			</Suspense>
		);
	}

	// Page Optimization page has its own layout
	if (currentPage === 'page-optimization') {
		return (
			<Suspense fallback={null}>
				<PageOptimizationPage />
				<DevTools />
			</Suspense>
		);
	}

	// Dashboard (default)
	return (
		<div className="min-h-screen bg-white flex flex-col">
			<div className="sticky top-0 z-50">
				<TrialBanner />
				<Header showUserMenu />
			</div>
			<DashboardPage />
			<Suspense fallback={null}>
				<DevTools />
			</Suspense>
		</div>
	);
};

export default App;
