import { ValidationError, ServerError, NetworkError } from '@/errors/api';

/**
 * Get user-friendly error message from API error
 *
 * Converts technical API errors into readable messages for end users.
 * Handles ValidationError, ServerError, NetworkError, and generic errors.
 *
 * @param {Error} err - The error object from API call
 * @param {string} [defaultMessage='Something went wrong. Please try again.'] - Fallback message if no error type matches
 * @returns {string} User-friendly error message
 *
 * @example
 * try {
 *   await post('/api/data', payload);
 * } catch (err) {
 *   const message = getErrorMessage(err, 'Failed to save data');
 *   setError(message);
 * }
 */
export const getErrorMessage = (
	err,
	defaultMessage = 'Something went wrong. Please try again.'
) => {
	if (err instanceof ValidationError) {
		return 'Please check your input and try again.';
	}

	if (err instanceof ServerError) {
		return 'Our servers are having issues. Please try again in a moment.';
	}

	if (err instanceof NetworkError) {
		return 'Connection problem. Please check your internet and try again.';
	}

	if (err.getUserMessage) {
		return err.getUserMessage();
	}

	return defaultMessage;
};

