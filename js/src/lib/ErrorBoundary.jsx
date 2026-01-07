import { Component } from 'react';
import { RenderError } from '@/errors/react';
import { logError } from '@/errors/logger';

/**
 * Error Boundary Component
 *
 * Catches React rendering errors and displays fallback UI.
 * Errors are logged to console with colors and context.
 *
 * Usage:
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 */
class ErrorBoundary extends Component {
	constructor(props) {
		super(props);
		this.state = {
			hasError: false,
			error: null,
		};
	}

	static getDerivedStateFromError(error) {
		// Update state so next render shows fallback UI
		return {
			hasError: true,
			error,
		};
	}

	componentDidCatch(error, errorInfo) {
		const componentStack = errorInfo.componentStack || '';
		const componentName = this.getComponentName(componentStack);

		// Create typed error
		const renderError = new RenderError(error.message, {
			context: {
				component: componentName,
			},
			componentStack,
		});

		// Log to console with colors
		logError(renderError, {
			action: 'render',
			component: componentName,
		});

		this.setState({ error: renderError });
	}

	/**
	 * Extract component name from stack
	 */
	getComponentName(componentStack) {
		if (!componentStack) return 'Unknown';

		// Try different formats:
		// "at ErrorTest (http://...)" or "in ErrorTest (at ...)"
		const match = componentStack.match(/(?:at|in)\s+([A-Z]\w+)/);

		if (match && match[1]) {
			return match[1];
		}

		// Fallback: get first line and try to extract any word
		const firstLine = componentStack.trim().split('\n')[0];
		const fallbackMatch = firstLine.match(/([A-Z]\w+)/);

		return fallbackMatch ? fallbackMatch[1] : 'Unknown';
	}

	render() {
		if (this.state.hasError) {
			const { error } = this.state;
			const isDev = import.meta.env.DEV;

			// Fallback UI
			return (
				<div
					style={{
						minHeight: '100vh',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						background: 'white',
						padding: '2rem',
						fontFamily: 'system-ui, -apple-system, sans-serif',
					}}
				>
					<div
						style={{
							maxWidth: '600px',
							textAlign: 'center',
						}}
					>
						{/* Error icon */}
						<div
							style={{
								fontSize: '4rem',
								marginBottom: '1rem',
							}}
						>
							⚠️
						</div>

						{/* Error title */}
						<h1
							style={{
								color: '#1f2937',
								fontSize: '1.5rem',
								fontWeight: 'bold',
								marginBottom: '0.5rem',
							}}
						>
							Something went wrong
						</h1>

						{/* Error message */}
						<p
							style={{
								color: '#6b7280',
								fontSize: '1rem',
								marginBottom: '2rem',
							}}
						>
							We're sorry, but something unexpected happened.
							Please refresh the page or contact support if the
							problem persists.
						</p>

						{/* Reload button */}
						<button
							onClick={() => window.location.reload()}
							style={{
								background: '#3b82f6',
								color: 'white',
								padding: '0.75rem 1.5rem',
								borderRadius: '0.5rem',
								border: 'none',
								fontSize: '1rem',
								fontWeight: '500',
								cursor: 'pointer',
								marginBottom: '1rem',
							}}
						>
							Reload Page
						</button>

						{/* Dev-only error details */}
						{isDev && error && (
							<details
								style={{
									marginTop: '2rem',
									textAlign: 'left',
									background: '#f3f4f6',
									padding: '1rem',
									borderRadius: '0.5rem',
								}}
							>
								<summary
									style={{
										cursor: 'pointer',
										fontWeight: '500',
										color: '#1f2937',
										marginBottom: '0.5rem',
									}}
								>
									Error details (dev only)
								</summary>

								<div
									style={{
										fontSize: '0.875rem',
										color: '#6b7280',
										marginTop: '1rem',
									}}
								>
									<strong>Error:</strong> {error.name}
								</div>

								<div
									style={{
										fontSize: '0.875rem',
										color: '#6b7280',
										marginTop: '0.5rem',
									}}
								>
									<strong>Message:</strong> {error.message}
								</div>

								{error.stack && (
									<pre
										style={{
											background: '#1f2937',
											color: '#f3f4f6',
											padding: '1rem',
											borderRadius: '0.5rem',
											overflow: 'auto',
											fontSize: '0.75rem',
											marginTop: '1rem',
										}}
									>
										{error.stack}
									</pre>
								)}
							</details>
						)}
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
