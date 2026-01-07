import { getWordPressConfig } from '@/api/client';

/**
 * PageLayout Component
 *
 * Common two-column layout used across the application
 * - Left column: Flavio avatar (64x64px, fixed)
 * - Right column: Dynamic content (flexible)
 * - Gap: 16px between columns
 *
 * Used by:
 * - LoginPage
 * - OnboardingLayout (wrapper for onboarding steps)
 */
const PageLayout = ({ children, centered = false }) => {
	const config = getWordPressConfig();

	return (
		<div
			className={`max-w-4xl mx-auto px-8 ${centered ? 'min-h-screen flex items-center' : ''}`}
		>
			<div className="flex items-start gap-4">
				{/* Left column: Flavio Avatar */}
				<img
					src={`${config.pluginUrl}js/public/onboarding.svg`}
					alt="Flavio mascot"
					className="w-[64px] h-[64px] shrink-0 mt-1"
					width="64"
					height="64"
				/>

				{/* Right column: Content */}
				<div className="flex-1 min-w-0">{children}</div>
			</div>
		</div>
	);
};

export default PageLayout;
