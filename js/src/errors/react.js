/**
 * React Error Classes
 *
 * Errors related to React components and rendering.
 * Caught by Error Boundaries.
 */

import { BaseError } from './base';

/**
 * Base class for React component errors
 */
export class ComponentError extends BaseError {
	constructor(message, options = {}) {
		super(message, options);
		this.componentStack = options.componentStack;
	}

	toJSON() {
		return {
			...super.toJSON(),
			componentStack: this.componentStack,
		};
	}
}

/**
 * Render errors
 * Errors that occur during component rendering
 * Caught by Error Boundary
 */
export class RenderError extends ComponentError {
	constructor(message, options = {}) {
		super(message, options);
	}

	getUserMessage() {
		return 'Something went wrong while rendering this component.';
	}
}

/**
 * Hook usage errors
 * Errors from React hooks (useEffect, useState, etc.)
 */
export class HookError extends ComponentError {
	constructor(message, options = {}) {
		super(message, options);
	}

	getUserMessage() {
		return 'An error occurred in component logic.';
	}
}
