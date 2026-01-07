import { Button } from '@/components/ui/button';
import SpeechBubble from '@/components/ui/speech-bubble';
import { getWordPressConfig, findCTA } from '@/api/client';
import { buildCTAUrl } from '@/utils/urlBuilder';

/**
 * Formats a Unix timestamp to "DD MMM" format
 *
 * @param {number} timestamp - Unix timestamp in seconds
 * @returns {string} Formatted date string (e.g., "09 Dec")
 */
const formatDate = (timestamp) => {
	const date = new Date(timestamp * 1000);
	const day = date.getDate().toString().padStart(2, '0');
	const month = date.toLocaleDateString('en-US', { month: 'short' });
	return `${day} ${month}`;
};

/**
 * Displays a motivational banner with speech bubble styling
 *
 * @param {string} message - The motivational message to display
 * @param {number} [updated] - Unix timestamp for last update
 */
const StatusBanner = ({ message, updated = null }) => {
	const config = getWordPressConfig();

	const upgradeCTA = findCTA('app-upgrade');

	return (
		<div className="flex items-center justify-between gap-4">
			{/* Flavio icon + speech bubble */}
			<div className="flex items-center gap-2">
				<img
					src={`${config?.pluginUrl || ''}js/public/onboarding.svg`}
					alt="Flavio"
					className="size-7 shrink-0"
					aria-hidden="true"
				/>
				<SpeechBubble arrow="left" className="ml-2 label-regular">
					{upgradeCTA ? (
						<>
							Last update: {updated ? formatDate(updated) : 'N/A'}
							. Upgrade to get the newest updates.
							<Button asChild size="mini" variant="outline">
								<a
									href={buildCTAUrl(upgradeCTA)}
									target="_blank"
									rel="noopener noreferrer"
									className="!text-foreground !rounded-sm ml-1 hover:!text-foreground hover:!bg-white"
								>
									Upgrade now
								</a>
							</Button>
						</>
					) : (
						message
					)}
				</SpeechBubble>
			</div>
		</div>
	);
};

export default StatusBanner;
