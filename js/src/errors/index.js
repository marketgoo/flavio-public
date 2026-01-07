/**
 * Error Classes - Central Export
 *
 * Import all error types from a single place.
 *
 * Usage:
 * import { UnauthorizedError, logError } from '@/errors'
 */

// Base error
export { BaseError } from './base';

// API errors
export {
	ApiError,
	UnauthorizedError,
	ForbiddenError,
	NotFoundError,
	ServerError,
	ValidationError,
	NetworkError,
	TimeoutError,
	ConnectionError,
} from './api';

// React errors
export { ComponentError, RenderError, HookError } from './react';

// Logger
export { logError, logInfo, logSuccess, logWarning, logDebug } from './logger';
