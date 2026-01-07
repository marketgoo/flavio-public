import PageLayout from '@/components/layouts/PageLayout';

/**
 * OnboardingLayout Component
 *
 * Wrapper for onboarding steps using the common PageLayout
 * Adds title header specific to onboarding steps
 */
const OnboardingLayout = ({ title, children }) => {
	return (
		<article>
			<PageLayout>
				{/* Title */}
				<header className="mb-2">
					<h1 className="heading-h1 leading-tight">
						{title}
					</h1>
				</header>

				{/* Step content */}
				<section>{children}</section>
			</PageLayout>
		</article>
	);
};

export default OnboardingLayout;
