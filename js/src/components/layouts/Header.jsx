import { useState } from 'react';
import {
	ChevronDown,
	Zap,
	User,
	LogOut,
	CircleUserRound,
	Settings,
	CalendarCog,
	Goal,
} from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { post, getWordPressConfig, findCTA } from '@/api/client';
import { logError } from '@/errors/logger';
import { reset as resetEvents } from '@/lib/events';
import { clearUser as clearSentryUser } from '@/lib/errorMonitoring';
import { buildCTAUrl } from '@/utils/urlBuilder';

/**
 * Header Component
 *
 * Application header with Flavio logo and optional user account dropdown menu.
 * Fixed at top with bottom border. Shows on all screens.
 *
 * @param {Object} props
 * @param {boolean} [props.showUserMenu=true] - Whether to show the user menu dropdown
 *
 * @example
 * // With user menu (default, for dashboard)
 * <Header />
 *
 * // Without user menu (for onboarding)
 * <Header showUserMenu={false} />
 */
const Header = ({ showUserMenu = true }) => {
	const [isLoggingOut, setIsLoggingOut] = useState(false);
	const config = getWordPressConfig();
	const isCustomer = config?.user?.is_customer === true;
	const urls = config?.flavioAuthenticatedUrls || {};

	// Get app-upgrade CTA if available
	const upgradeCTA = findCTA('app-upgrade');
	const trialCTA = findCTA('trial-pay');

	const handleLogout = async () => {
		try {
			setIsLoggingOut(true);

			// Call disconnect endpoint
			await post('/user/disconnect');

			// Reset analytics and clear user from error monitoring
			resetEvents();
			clearSentryUser();

			// Clear all Flavio data from localStorage
			Object.keys(localStorage)
				.filter((key) => key.startsWith('flavio_'))
				.forEach((key) => localStorage.removeItem(key));

			// Reload to trigger re-authentication
			window.location.reload();
		} catch (error) {
			logError(error, {
				action: 'logout',
				component: 'Header',
			});
			setIsLoggingOut(false);
		}
	};

	return (
		<header className="bg-card border-b border-border">
			<div className="w-full mx-auto px-6 py-2">
				<div className="flex items-center justify-between">
					{/* Logo */}
					<img
						src={`${config?.pluginUrl || ''}js/public/logo.svg`}
						alt="Flavio"
						className="h-6 w-auto"
					/>

					{/* User Menu - only shown when showUserMenu is true */}
					{showUserMenu && (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<button className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring">
									<CircleUserRound className="w-5 h-5" />
									<span className="small-medium">
										My account
									</span>
									<ChevronDown className="w-4 h-4" />
								</button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								{upgradeCTA || trialCTA ? (
									<DropdownMenuItem asChild>
										<a
											href={buildCTAUrl(
												upgradeCTA || trialCTA
											)}
											target="_blank"
											rel="noopener noreferrer"
										>
											<Zap />
											Upgrade
										</a>
									</DropdownMenuItem>
								) : null}
								<DropdownMenuItem asChild>
									<a
										href={urls.account}
										target="_blank"
										rel="noopener noreferrer"
									>
										<User />
										Account
									</a>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<a
										href={urls.connections}
										target="_blank"
										rel="noopener noreferrer"
									>
										<Settings />
										Manage connections
									</a>
								</DropdownMenuItem>
								{isCustomer && (
									<DropdownMenuItem asChild>
										<a href={urls.manageSubscription}>
											<CalendarCog />
											Manage subscription
										</a>
									</DropdownMenuItem>
								)}
								<DropdownMenuItem asChild>
									<a href={config.goalProfilePageUrl}>
										<Goal />
										Goal & Profile
									</a>
								</DropdownMenuItem>
								<DropdownMenuItem
									onSelect={handleLogout}
									disabled={isLoggingOut}
								>
									<LogOut />
									{isLoggingOut ? 'Logging out...' : 'Logout'}
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					)}
				</div>
			</div>
		</header>
	);
};

export default Header;
