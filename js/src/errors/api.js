/**
 * API Error Classes
 *
 * Typed errors for HTTP/API failures.
 * Each error type corresponds to specific HTTP status codes.
 */

import { BaseError } from './base';

/**
 * Base class for all API-related errors
 */
export class ApiError extends BaseError {
	constructor(message, statusCode, options = {}) {
		super(message, options);
		this.statusCode = statusCode;
		this.endpoint = options.endpoint;
		this.method = options.method;
		this.response = options.response;
	}

	toJSON() {
		return {
			...super.toJSON(),
			statusCode: this.statusCode,
			endpoint: this.endpoint,
			method: this.method,
			response: this.response,
		};
	}
}

/**
 * 401 Unauthorized
 * Authentication required or token expired
 */
export class UnauthorizedError extends ApiError {
	constructor(message = 'Authentication required', options = {}) {
		super(message, 401, options);
	}

	getUserMessage() {
		return 'Your session has expired. Please log in again.';
	}
}

/**
 * 403 Forbidden
 * User doesn't have permission for this action
 */
export class ForbiddenError extends ApiError {
	constructor(message = 'Access forbidden', options = {}) {
		super(message, 403, options);
	}

	getUserMessage() {
		return 'You do not have permission to perform this action.';
	}
}

/**
 * 404 Not Found
 * Requested resource doesn't exist
 */
export class NotFoundError extends ApiError {
	constructor(message = 'Resource not found', options = {}) {
		super(message, 404, options);
	}

	getUserMessage() {
		return 'The requested resource was not found.';
	}
}

/**
 * 500 Server Error
 * Internal server error
 */
export class ServerError extends ApiError {
	constructor(message = 'Internal server error', options = {}) {
		super(message, 500, options);
	}

	getUserMessage() {
		return 'Something went wrong on our end. Please try again later.';
	}
}

/**
 * 400 Bad Request / Validation Error
 * Request data is invalid
 */
export class ValidationError extends ApiError {
	constructor(message = 'Validation failed', options = {}) {
		super(message, 400, options);
		this.errors = options.errors || [];
	}

	toJSON() {
		return {
			...super.toJSON(),
			errors: this.errors,
		};
	}

	getUserMessage() {
		return 'Please check your input and try again.';
	}
}

/**
 * Network-related errors (no response from server)
 * Base class for connection/timeout errors
 */
export class NetworkError extends BaseError {
	constructor(message, options = {}) {
		super(message, options);
		this.isNetworkError = true;
	}

	getUserMessage() {
		return 'Network error. Please check your internet connection.';
	}
}

/**
 * Request timeout
 * Request took too long to complete
 */
export class TimeoutError extends NetworkError {
	constructor(message = 'Request timeout', options = {}) {
		super(message, options);
		this.timeout = options.timeout;
	}

	getUserMessage() {
		return 'Request timed out. Please try again.';
	}
}

/**
 * Connection error
 * Can't connect to server (offline, DNS failure, etc.)
 */
export class ConnectionError extends NetworkError {
	constructor(message = 'Connection failed', options = {}) {
		super(message, options);
	}

	getUserMessage() {
		return 'Unable to connect to the server. Please check your connection.';
	}
}
