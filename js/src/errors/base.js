/**
 * Base error class for all custom errors
 *
 * Provides common error properties and serialization.
 * All custom errors should extend this class.
 */
export class BaseError extends Error {
	constructor(message, options = {}) {
		super(message);

		// Set error name to class name
		this.name = this.constructor.name;

		// Timestamp for logging
		this.timestamp = new Date().toISOString();

		// Additional context (component, action, etc.)
		this.context = options.context || {};

		// Maintain proper stack trace (V8 only)
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, this.constructor);
		}
	}

	/**
	 * Serialize error for logging/tracking
	 *
	 * @returns {Object} Serialized error object
	 */
	toJSON() {
		return {
			name: this.name,
			message: this.message,
			timestamp: this.timestamp,
			context: this.context,
			stack: this.stack,
		};
	}

	/**
	 * Get user-friendly message
	 * Override in subclasses for specific error types
	 *
	 * @returns {string} User-friendly error message
	 */
	getUserMessage() {
		return this.message;
	}
}
