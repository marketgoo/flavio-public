/**
 * URL Builder Utilities
 *
 * Helper functions to construct URLs for CTAs.
 * Handles both authenticated and direct URLs based on manageAccounts config.
 */

import { getWordPressConfig } from '@/api/client';

/**
 * Build URL from a CTA object
 *
 * If manageAccounts is enabled, constructs an authenticated URL with bearer token
 * and next_url parameters. Otherwise, returns the CTA's target_url directly.
 *
 * @param {Object} cta - CTA object with attributes.target_url
 * @returns {string} Complete URL (authenticated or direct based on config)
 *
 * @example
 * import { findCTA } from '@/api/client';
 * import { buildCTAUrl } from '@/utils/urlBuilder';
 *
 * const cta = findCTA('app-upgrade');
 * const url = buildCTAUrl(cta);
 * // With manageAccounts=true: "https://flavio.example.com/login?bearer=abc123&next_url=https://flavio.example.com/growth/upgrade"
 * // With manageAccounts=false: "https://example.com/upgrade" (target_url as-is)
 */
export const buildCTAUrl = (cta) => {
	if (!cta?.attributes?.target_url) {
		throw new Error('CTA does not have a valid target_url');
	}

	const config = getWordPressConfig();
	const { manageAccounts } = config;

	// If not managing accounts, return target_url directly
	if (!manageAccounts) {
		return cta.attributes.target_url;
	}

	// Build authenticated URL
	const { flavioLoginUrl, flavioToken } = config;

	if (!flavioLoginUrl) {
		throw new Error('flavioLoginUrl not found in configuration');
	}

	if (!flavioToken) {
		throw new Error('flavioToken not found in configuration');
	}

	const url = new URL(flavioLoginUrl);
	url.searchParams.set('bearer', flavioToken);
	url.searchParams.set('next_url', cta.attributes.target_url);

	return url.toString();
};
