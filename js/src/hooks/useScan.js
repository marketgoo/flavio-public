/**
 * useScan Hook
 *
 * Manages the scan workflow: WebSocket connection + POST /scan request.
 * Follows the critical order: connect WebSocket BEFORE making POST request.
 *
 * NOTE: Uses WebSocket instead of SSE to avoid CORS issues.
 * WebSocket does NOT have same-origin restrictions like EventSource.
 *
 * Response codes from POST /scan:
 * - 200 OK: Scan started successfully
 * - 303 See Other: Scan already in progress (use Location header)
 * - 404 Not Found: UUID not found
 * - 409 Conflict: Plan doesn't allow scan on demand
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import useWebSocket, { CONNECTION_STATE } from './useWebSocket';
import { post } from '@/api/client';
import { logError } from '@/errors/logger';

/**
 * Scan states
 */
export const SCAN_STATE = {
	IDLE: 'idle',
	CONNECTING: 'connecting', // Connecting to WebSocket
	STARTING: 'starting', // POST /scan in progress
	IN_PROGRESS: 'in_progress', // Scan running, receiving updates
	COMPLETED: 'completed',
	ERROR: 'error',
	ALREADY_RUNNING: 'already_running', // 303 response
	NOT_ALLOWED: 'not_allowed', // 409 response
};

/**
 * Known message types from WebSocket during scan
 * Based on marketgoo WebSocket workflow diagram
 */
export const SCAN_MESSAGE_TYPES = {
	// Scan lifecycle events
	SCANNING_STARTED: 'SCANNING_STARTED',
	SCANNING_PROGRESS: 'SCANNING_PROGRESS',
	SCANNING_COMPLETED: 'SCANNING_COMPLETED',
	SCANNING_TASKS_COMPLETED: 'SCANNING_TASKS_COMPLETED',

	// Data refresh - contains full plan data (same as GET /data)
	REFRESH_PLAN_DATA: 'REFRESH_PLAN_DATA',

	// Error
	SCAN_ERROR: 'SCAN_ERROR',
};

/**
 * Hook for managing scan workflow
 *
 * @param {Object} options - Configuration options
 * @param {Function} [options.onScanComplete] - Callback when scan completes
 * @param {Function} [options.onScanError] - Callback on scan error
 * @param {Function} [options.onProgress] - Callback for progress updates
 * @param {Function} [options.onTaskUpdate] - Callback for task updates
 * @returns {Object} Scan state and controls
 * @returns {string} scanState - Current scan state
 * @returns {number} progress - Scan progress (0-100)
 * @returns {Object|null} error - Error details if any
 * @returns {Function} startScan - Start a new scan
 * @returns {Function} reset - Reset to idle state
 * @returns {boolean} isScanning - Whether scan is in progress
 */
const useScan = ({
	onScanComplete,
	onScanError,
	onProgress,
	onTaskUpdate,
} = {}) => {
	const [scanState, setScanState] = useState(SCAN_STATE.IDLE);
	const [progress, setProgress] = useState(0);
	const [error, setError] = useState(null);

	// Refs for callbacks (to use latest version in handlers)
	const onScanCompleteRef = useRef(onScanComplete);
	const onScanErrorRef = useRef(onScanError);
	const onProgressRef = useRef(onProgress);
	const onTaskUpdateRef = useRef(onTaskUpdate);

	// Keep refs in sync with latest callbacks
	useEffect(() => {
		onScanCompleteRef.current = onScanComplete;
		onScanErrorRef.current = onScanError;
		onProgressRef.current = onProgress;
		onTaskUpdateRef.current = onTaskUpdate;
	}, [onScanComplete, onScanError, onProgress, onTaskUpdate]);

	/**
	 * Handle incoming WebSocket messages
	 * Message types based on marketgoo WebSocket workflow
	 */
	const handleMessage = useCallback((message) => {
		switch (message.type) {
			case SCAN_MESSAGE_TYPES.SCANNING_STARTED:
				setScanState(SCAN_STATE.IN_PROGRESS);
				setProgress(0);
				break;

			case SCAN_MESSAGE_TYPES.SCANNING_PROGRESS: {
				// Progress is calculated from pages_read / pages_found
				const pagesRead = message.payload?.pages_read || 0;
				const pagesFound = message.payload?.pages_found || 1;
				const progressPercent = Math.round(
					(pagesRead / pagesFound) * 100
				);
				setProgress(progressPercent);
				onProgressRef.current?.(message.payload);
				break;
			}

			case SCAN_MESSAGE_TYPES.SCANNING_COMPLETED:
				// Scan finished, but tasks not yet analyzed
				setProgress(90);
				break;

			case SCAN_MESSAGE_TYPES.SCANNING_TASKS_COMPLETED:
				// Tasks analyzed, waiting for REFRESH_PLAN_DATA
				setProgress(95);
				break;

			case SCAN_MESSAGE_TYPES.REFRESH_PLAN_DATA:
				// Full data received - scan complete
				setScanState(SCAN_STATE.COMPLETED);
				setProgress(100);
				// payload.plan contains the full data (same as GET /data)
				onScanCompleteRef.current?.(message.payload);
				break;

			case SCAN_MESSAGE_TYPES.SCAN_ERROR:
				setScanState(SCAN_STATE.ERROR);
				setError(message.payload);
				onScanErrorRef.current?.(message.payload);
				break;

			case SCAN_MESSAGE_TYPES.TASK_UPDATE:
				onTaskUpdateRef.current?.(message.payload);
				break;

			default:
				console.log('[Scan] Unknown message type:', message.type);
		}
	}, []);

	// Refs for connection promise resolution
	const connectionResolveRef = useRef(null);
	const connectionRejectRef = useRef(null);

	/**
	 * Handle WebSocket connection established
	 */
	const handleConnect = useCallback(() => {
		// Resolve pending connection promise
		connectionResolveRef.current?.();
	}, []);

	/**
	 * Handle WebSocket error
	 */
	const handleWsError = useCallback(
		() => {
			// Reject pending connection promise
			connectionRejectRef.current?.(
				new Error('WebSocket connection failed')
			);

			// Set error state if we're in a scanning state
			setScanState((currentState) => {
				if (
					currentState === SCAN_STATE.CONNECTING ||
					currentState === SCAN_STATE.IN_PROGRESS
				) {
					setError({ message: 'Lost connection to server' });
					return SCAN_STATE.ERROR;
				}
				return currentState;
			});
		},
		[] // No dependencies needed with functional setState
	);

	// WebSocket connection
	const {
		connect,
		disconnect,
		isConnected,
		lastMessage,
		messages,
	} = useWebSocket({
		autoConnect: false,
		onMessage: handleMessage,
		onConnect: handleConnect,
		onError: handleWsError,
	});

	/**
	 * Start a new scan
	 * 1. Connect to WebSocket first (for real-time updates)
	 * 2. POST /scan to start the scan
	 *
	 * NOTE: WebSocket doesn't have CORS issues like SSE, so it should always work
	 */
	const startScan = useCallback(async () => {
		// Reset state
		setError(null);
		setProgress(0);
		setScanState(SCAN_STATE.CONNECTING);

		let wsConnected = false;

		// Step 1: Connect to WebSocket (for real-time updates)
		try {
			const connectionPromise = new Promise((resolve, reject) => {
				connectionResolveRef.current = resolve;
				connectionRejectRef.current = reject;

				// Timeout for connection
				setTimeout(() => {
					reject(new Error('WebSocket connection timeout'));
				}, 5000);
			});

			connect();
			await connectionPromise;
			wsConnected = true;
			console.log('[Scan] WebSocket connected');
		} catch {
			// WebSocket failed - continue anyway
			console.warn(
				'[Scan] WebSocket failed, continuing without real-time updates'
			);
			disconnect();
		}

		// Step 2: POST /scan (this is the critical step)
		try {
			setScanState(SCAN_STATE.STARTING);
			console.log('[Scan] Starting scan...');

			await post('/scan');

			// If WebSocket is connected, wait for real-time updates
			if (wsConnected) {
				setScanState(SCAN_STATE.IN_PROGRESS);
			} else {
				// No WebSocket - scan started but we can't track progress
				// Set completed and let user know to refresh
				setScanState(SCAN_STATE.COMPLETED);
				setProgress(100);
				onScanCompleteRef.current?.({ wsAvailable: false });
			}
		} catch (err) {
			// Handle specific HTTP status codes
			if (err.statusCode === 303) {
				setScanState(SCAN_STATE.ALREADY_RUNNING);
				return;
			}

			if (err.statusCode === 409) {
				setScanState(SCAN_STATE.NOT_ALLOWED);
				setError({
					message: 'Your plan does not allow on-demand scans',
				});
				disconnect();
				return;
			}

			if (err.statusCode === 404) {
				setScanState(SCAN_STATE.ERROR);
				setError({ message: 'Account not found' });
				disconnect();
				return;
			}

			// Generic error
			setScanState(SCAN_STATE.ERROR);
			setError({ message: err.message || 'Failed to start scan' });
			logError(err, {
				component: 'useScan',
				action: 'startScan',
			});
			disconnect();
		}
	}, [connect, disconnect]);

	/**
	 * Reset to idle state
	 */
	const reset = useCallback(() => {
		disconnect();
		setScanState(SCAN_STATE.IDLE);
		setProgress(0);
		setError(null);
	}, [disconnect]);

	/**
	 * Cancel ongoing scan
	 */
	const cancel = useCallback(() => {
		disconnect();
		setScanState(SCAN_STATE.IDLE);
	}, [disconnect]);

	return {
		// State
		scanState,
		progress,
		error,
		isScanning:
			scanState === SCAN_STATE.CONNECTING ||
			scanState === SCAN_STATE.STARTING ||
			scanState === SCAN_STATE.IN_PROGRESS,
		isConnected,

		// WebSocket data (for debugging)
		lastMessage,
		messages,

		// Actions
		startScan,
		reset,
		cancel,
	};
};

export default useScan;
