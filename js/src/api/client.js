/**
 * WordPress REST API Client
 *
 * Functional wrapper around fetch API for WordPress REST endpoints.
 * Handles authentication (nonce), base URL, and error handling.
 */

import {
	UnauthorizedError,
	ForbiddenError,
	NotFoundError,
	ServerError,
	ValidationError,
	ApiError,
	ConnectionError,
	TimeoutError,
} from '@/errors/api';

import { BaseError } from '@/errors/base';

/**
 * Get WordPress configuration from window.flavioData
 *
 * @returns {Object} WordPress configuration
 */
const getConfig = () => {
	if (!window.flavioData) {
		throw new Error(
			'Flavio configuration not found. WordPress localization script not loaded.'
		);
	}

	return {
		...window.flavioData,
		baseUrl: window.flavioData.apiUrl,
	};
};

/**
 * Build full URL from endpoint
 * If endpoint is already a complete URL (from config.endpoints), return as-is
 * Otherwise, build URL from baseUrl + relative path
 *
 * @param {string} endpoint - API endpoint (complete URL or relative path like '/status')
 * @returns {string} Full URL
 */
const buildUrl = (endpoint) => {
	// If it's already a complete URL (starts with http:// or https://), return as-is
	if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
		return endpoint;
	}

	// Otherwise, build from baseUrl
	const { baseUrl } = getConfig();
	const cleanEndpoint = endpoint.startsWith('/')
		? endpoint.slice(1)
		: endpoint;
	return `${baseUrl}${cleanEndpoint}`;
};

/**
 * Build request headers with WordPress nonce
 *
 * @param {Object} customHeaders - Additional headers to merge
 * @returns {Object} Headers object
 */
const buildHeaders = (customHeaders = {}) => {
	const { nonce } = getConfig();

	return {
		'Content-Type': 'application/json',
		'X-WP-Nonce': nonce,
		...customHeaders,
	};
};

/**
 * Handle API response
 * Throws typed error if response is not ok, otherwise returns JSON data
 *
 * @param {Response} response - Fetch response object
 * @param {string} endpoint - Original endpoint for error context
 * @param {string} method - HTTP method for error context
 * @returns {Promise<Object|null>} Parsed JSON data, or null for 204 No Content
 * @throws {ApiError} Typed API error based on status code
 */
const handleResponse = async (response, endpoint, method) => {
	// Handle 204 No Content - connected but no data available yet
	if (response.status === 204) {
		return null;
	}

	if (!response.ok) {
		// Try to get error details from WordPress REST API
		const errorData = await response.json().catch(() => ({
			message: response.statusText,
		}));

		// Build error context
		const context = {
			endpoint,
			method,
			statusCode: response.status,
			url: response.url,
		};

		const message = errorData.message || `API Error: ${response.status}`;

		// Throw typed error based on status code
		switch (response.status) {
			case 401:
				throw new UnauthorizedError(message, {
					context,
					response: errorData,
				});

			case 403:
				throw new ForbiddenError(message, {
					context,
					response: errorData,
				});

			case 404:
				throw new NotFoundError(message, {
					context,
					response: errorData,
				});

			case 400:
				throw new ValidationError(message, {
					context,
					response: errorData,
					errors: errorData.data?.params || [],
				});

			case 500:
			case 502:
			case 503:
			case 504:
				throw new ServerError(message, {
					context,
					response: errorData,
				});

			default:
				throw new ApiError(message, response.status, {
					context,
					response: errorData,
				});
		}
	}

	return response.json();
};

/**
 * Make HTTP request to WordPress REST API
 *
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options (method, body, headers, etc.)
 * @returns {Promise<Object>} API response data
 * @throws {BaseError} Typed error (ApiError, NetworkError, etc.)
 */
const request = async (endpoint, options = {}) => {
	const url = buildUrl(endpoint);
	const headers = buildHeaders(options.headers);

	const config = {
		credentials: 'same-origin',
		...options,
		headers,
	};

	const method = config.method || 'GET';

	try {
		const response = await fetch(url, config);
		return handleResponse(response, endpoint, method);
	} catch (error) {
		// If it's already our custom error, re-throw as-is
		if (error instanceof BaseError) {
			throw error;
		}

		// Network errors (TypeError from fetch)
		if (error instanceof TypeError) {
			throw new ConnectionError(error.message, {
				context: {
					endpoint,
					method,
					url,
				},
			});
		}

		// AbortError (timeout or manual cancellation)
		if (error.name === 'AbortError') {
			throw new TimeoutError('Request was aborted', {
				context: {
					endpoint,
					method,
					url,
				},
			});
		}

		// Unknown error - re-throw
		throw error;
	}
};

/**
 * Make GET request
 *
 * @param {string} endpoint - Complete URL (e.g., config.endpoints.status) or relative path (e.g., '/status')
 * @param {Object} options - Additional fetch options
 * @returns {Promise<Object>} API response data
 */
export const get = (endpoint, options = {}) =>
	request(endpoint, {
		method: 'GET',
		...options,
	});

/**
 * Make POST request
 *
 * @param {string} endpoint - Complete URL (e.g., config.endpoints.signature) or relative path (e.g., '/signature')
 * @param {Object} body - Request body (will be JSON stringified)
 * @param {Object} options - Additional fetch options
 * @returns {Promise<Object>} API response data
 */
export const post = (endpoint, body = null, options = {}) =>
	request(endpoint, {
		method: 'POST',
		body: body ? JSON.stringify(body) : null,
		...options,
	});

/**
 * Make PUT request
 *
 * @param {string} endpoint - Complete URL or relative path
 * @param {Object} body - Request body (will be JSON stringified)
 * @param {Object} options - Additional fetch options
 * @returns {Promise<Object>} API response data
 */
export const put = (endpoint, body = null, options = {}) =>
	request(endpoint, {
		method: 'PUT',
		body: body ? JSON.stringify(body) : null,
		...options,
	});

/**
 * Make DELETE request
 *
 * @param {string} endpoint - Complete URL or relative path
 * @param {Object} options - Additional fetch options
 * @returns {Promise<Object>} API response data
 */
export const del = (endpoint, options = {}) =>
	request(endpoint, {
		method: 'DELETE',
		...options,
	});

/**
 * Get WordPress configuration
 * Useful for accessing WordPress URLs in components
 *
 * @returns {Object} WordPress configuration
 */
export const getWordPressConfig = getConfig;

/**
 * Find a CTA by its ID
 *
 * @param {string} ctaId - CTA ID to search for (e.g., 'app-upgrade')
 * @returns {Object|null} CTA object if found, null otherwise
 */
export const findCTA = (ctaId) => {
	const config = getConfig();
	const ctas = config.ctas || [];
	return ctas.find((cta) => cta.id === ctaId) || null;
};
