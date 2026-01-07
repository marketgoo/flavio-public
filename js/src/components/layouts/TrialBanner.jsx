import { getWordPressConfig, findCTA } from '@/api/client';
import { buildCTAUrl } from '@/utils/urlBuilder';
import { Button } from '@/components/ui/button';

/**
 * TrialBanner Component
 *
 * Displays a promotional banner when user is on trial.
 * Shows days remaining and upgrade CTA.
 * Fixed at the very top of the page.
 */
const TrialBanner = () => {
	const config = getWordPressConfig();
	const planInfo = config?.planInfo;

	const daysLeft = planInfo.days_trial_left ?? 0;
	const upgradeCTA = findCTA('app-upgrade');
	const trialCTA = findCTA('trial-pay');

	// Only show if user is on trial
	if (!planInfo?.is_trial && !upgradeCTA) {
		return null;
	}

	// Split days into individual digits for separate badges
	const digits = String(daysLeft).split('');

	return (
		<div className="w-full bg-lime-200 py-2">
			<div className="flex items-center justify-center gap-1 text-sm">
				{upgradeCTA ? (
					<span className="text-xs font-semibold">
						Trial ended, you're on a{' '}
						<strong className="!font-bold">free plan</strong> with
						limited access. Upgrade to continue getting insights and
						fixes.
					</span>
				) : (
					<>
						<span className="text-xs font-semibold">
							Enjoy your full Pro experience!
						</span>
						<span className="inline-flex items-center gap-0.5 mx-1">
							{digits.map((digit, index) => (
								<span
									key={index}
									className="inline-flex items-center justify-center bg-foreground text-white px-1 py-0.5 text-xs font-semibold tabular-nums rounded-tl-lg rounded-tr-[1px] rounded-br-lg rounded-bl-[1px]"
								>
									{digit}
								</span>
							))}
						</span>
						<span className="text-xs font-semibold">days left</span>
					</>
				)}

				{upgradeCTA || trialCTA ? (
					<Button asChild size="xs" className="ml-2">
						<a
							href={buildCTAUrl(upgradeCTA || trialCTA)}
							target="_blank"
							rel="noopener noreferrer"
							className="!text-white !rounded-sm"
						>
							Upgrade now
						</a>
					</Button>
				) : null}
			</div>
		</div>
	);
};

export default TrialBanner;
