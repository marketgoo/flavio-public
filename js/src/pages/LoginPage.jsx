import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from '@/components/ui/input-otp';
import PageLayout from '@/components/layouts/PageLayout';
import { post, getWordPressConfig } from '@/api/client';
import { logError } from '@/errors/logger';
import { ApiError } from '@/errors/api';

/**
 * LoginPage
 *
 * Pre-authentication welcome page
 * Shows Flavio introduction and redirects to external authentication
 * Also supports activation code flow as alternative auth method
 */
const LoginPage = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
	const [showCodeInput, setShowCodeInput] = useState(false);
	const [activationCode, setActivationCode] = useState('');

	const handleLogin = async () => {
		setIsLoading(true);
		setError(null);

		try {
			const config = getWordPressConfig();

			// 1. Generate signature from WordPress (also returns callback nonce)
			const data = await post(config.endpoints.signature);

			if (!data.success || !data.signature || !data.callback_nonce) {
				throw new ApiError('Invalid signature response', 200, {
					context: {
						endpoint: 'signature',
						receivedData: data,
					},
				});
			}

			// 2. Build callback URL with nonce for WordPress security verification
			const callbackUrl = new URL(config.tokenPageUrl);
			callbackUrl.searchParams.set('_wpnonce', data.callback_nonce);
			const domain = window.location.hostname;

			// 3. Construct Flavio login URL with all parameters
			const params = new URLSearchParams({
				from: 'wordpress_plugin',
				signature: data.signature,
				callback_url: callbackUrl.toString(),
				domain: domain,
			});

			// 4. Build final redirect URL
			const flavioLoginUrl = `${config.flavioLoginUrl}?${params.toString()}`;

			// 5. Redirect to Flavio
			window.location.href = flavioLoginUrl;
		} catch (err) {
			// Log error with colors
			logError(err, {
				action: 'login',
				component: 'LoginPage',
				step: 'generate_signature',
			});

			// Set user-friendly error message
			setError(
				err.getUserMessage?.() ||
					err.message ||
					'Failed to initiate login. Please try again.'
			);
			setIsLoading(false);
		}
	};

	const handleActivationCodeClick = () => {
		const config = getWordPressConfig();
		const domain = window.location.hostname;

		// Build URL with get_code=true, from, and domain only
		const params = new URLSearchParams({
			get_code: 'true',
			from: 'wordpress_plugin',
			domain: domain,
		});

		const flavioLoginUrl = `${config.flavioLoginUrl}?${params.toString()}`;

		// Open in new tab
		window.open(flavioLoginUrl, '_blank');

		// Switch to code input view
		setShowCodeInput(true);
		setError(null);
	};

	const handleCodeSubmit = async () => {
		setIsLoading(true);
		setError(null);

		try {
			const config = getWordPressConfig();
			const data = await post(config.endpoints.activate, {
				code: activationCode,
			});

			if (!data.success) {
				throw new ApiError(data.message || 'Activation failed', 400, {
					context: {
						endpoint: 'activate',
						code: activationCode,
					},
				});
			}

			// Success! Reload the page to check auth status
			window.location.reload();
		} catch (err) {
			logError(err, {
				action: 'activate',
				component: 'LoginPage',
				step: 'submit_activation_code',
			});

			setError(
				err.getUserMessage?.() ||
					err.message ||
					'Invalid activation code. Please try again.'
			);
			setIsLoading(false);
		}
	};

	const handleBackToLogin = () => {
		setShowCodeInput(false);
		setActivationCode('');
		setError(null);
	};

	// Activation code input view
	if (showCodeInput) {
		return (
			<main className="flex-1 flex items-center justify-center p-8 overflow-hidden">
				<PageLayout>
					{/* Title */}
					<header className="mb-2">
						<h1 className="heading-h1 leading-tight">
							Everything is ready! Just need your code to activate
							it
						</h1>
					</header>

					{/* Description */}
					<div className="space-y-4 mb-8">
						<p className="paragraph-regular text-foreground">
							Enter the code here, and I'll activate your product.
							Once it's done, I'll take care of everything so your
							page starts improving right away.
						</p>

						<p className="paragraph-regular text-foreground">
							Don't have your code? Click{' '}
							<button
								type="button"
								onClick={handleActivationCodeClick}
								className="!font-semibold cursor-pointer hover:underline underline-offset-2"
							>
								here
							</button>{' '}
							to get one.
						</p>
					</div>

					{/* Error Message */}
					{error && (
						<div className="mb-4 px-4 bg-destructive/10 border border-destructive/20 rounded-lg">
							<p className="text-sm text-destructive">{error}</p>
						</div>
					)}

					{/* Code Input */}
					<div className="space-y-6">
						<InputOTP
							maxLength={6}
							value={activationCode}
							onChange={(value) =>
								setActivationCode(value.toUpperCase())
							}
						>
							<InputOTPGroup>
								<InputOTPSlot index={0} />
								<InputOTPSlot index={1} />
								<InputOTPSlot index={2} />
								<InputOTPSlot index={3} />
								<InputOTPSlot index={4} />
								<InputOTPSlot index={5} />
							</InputOTPGroup>
						</InputOTP>

						<Button
							size="lg"
							onClick={handleCodeSubmit}
							disabled={activationCode.length !== 6 || isLoading}
						>
							{isLoading ? 'Activating...' : 'Activate now'}
						</Button>

						<button
							type="button"
							onClick={handleBackToLogin}
							className="!text-sm block text-muted-foreground cursor-pointer hover:underline underline-offset-2 mt-7"
						>
							← Back to login
						</button>
					</div>
				</PageLayout>
			</main>
		);
	}

	// Default login view
	return (
		<main className="flex-1 flex items-center justify-center p-8 overflow-hidden">
			<PageLayout>
				{/* Title */}
				<header className="mb-2">
					<h1 className="heading-h1 leading-tight">
						Let's get your website moving with Flavio
					</h1>
				</header>

				{/* Description */}
				<div className="space-y-4 mb-8">
					<p className="paragraph-regular text-foreground">
						Hey there! I'm{' '}
						<strong className="font-semibold">Flavio</strong>, your{' '}
						<strong className="font-semibold">
							AI Agent to grow your online business
						</strong>
						.
					</p>

					<p className="paragraph-regular text-foreground">
						We'll work together to reach your goals — whether that's
						getting more customers, improving visibility on Google,
						or making your site shine.
					</p>

					<p className="paragraph-semibold text-foreground">
						Ready to start your smart plan?
					</p>
				</div>

				{/* Error Message */}
				{error && (
					<div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
						<p className="text-sm text-destructive">{error}</p>
					</div>
				)}

				{/* CTA Button */}
				<div className="space-y-3">
					<Button
						size="lg"
						onClick={handleLogin}
						disabled={isLoading}
						className="bg-foreground text-background hover:bg-foreground/90"
					>
						{isLoading ? 'Connecting...' : 'Sign Up / Log In'}
					</Button>

					{/* Activation Code Link */}
					<div className="text-sm text-muted-foreground">
						Having trouble accessing?{' '}
						<button
							type="button"
							onClick={handleActivationCodeClick}
							className="!font-semibold cursor-pointer hover:underline underline-offset-2 mt-7"
						>
							Use an activation code
						</button>
					</div>
				</div>
			</PageLayout>
		</main>
	);
};

export default LoginPage;
