/**
 * DevTools Entry Point
 *
 * Conditionally exports DevTools component only in development mode.
 * Uses dynamic import to ensure DevTools code is NOT included in production bundle.
 */

import { lazy } from 'react';

// Only load DevTools in development - code won't be bundled in production
// The ternary with import.meta.env.DEV allows Vite to tree-shake the entire
// DevTools module and its dependencies in production builds
const DevTools = import.meta.env.DEV
	? lazy(() => import('./DevTools'))
	: () => null;

export default DevTools;
