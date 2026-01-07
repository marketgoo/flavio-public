/**
 * useWebSocket Hook
 *
 * Manages WebSocket connection for real-time updates.
 * Automatically connects using the user's ULID from window.flavioData.
 *
 * IMPORTANT: WebSocket does NOT have CORS restrictions like SSE/EventSource,
 * so it can connect cross-origin without issues.
 *
 * Message schema from server:
 * {
 *   id: number,           // Auto-incremented message ID
 *   text: {
 *     type: string,       // Message type (e.g., 'SCAN_PROGRESS', 'TASK_UPDATE')
 *     payload: object     // Message data
 *   }
 * }
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { logError } from '@/errors/logger';

/**
 * Connection states
 */
export const CONNECTION_STATE = {
	DISCONNECTED: 'disconnected',
	CONNECTING: 'connecting',
	CONNECTED: 'connected',
	ERROR: 'error',
};

/**
 * Get WebSocket host from flavioLoginUrl
 * Extracts the domain from the login URL for WebSocket connection
 *
 * @returns {string|null} WebSocket host or null if not available
 */
const getWebSocketHost = () => {
	const loginUrl = window.flavioData?.flavioLoginUrl || '';
	if (!loginUrl) {
		console.warn('[WS] No flavioLoginUrl found in flavioData');
		return null;
	}

	try {
		const url = new URL(loginUrl);
		return url.host; // e.g., "docker.mktgoo.net"
	} catch {
		console.error('[WS] Invalid flavioLoginUrl:', loginUrl);
		return null;
	}
};

/**
 * Parse WebSocket message data
 *
 * @param {string} rawData - Raw message data from WebSocket
 * @returns {Object|null} Parsed message or null if invalid
 */
const parseMessage = (rawData) => {
	try {
		const data = JSON.parse(rawData);

		// Validate expected schema
		if (typeof data.id !== 'number' || !data.text) {
			console.warn('[WS] Invalid message schema:', data);
			return null;
		}

		// Parse nested text if it's a string
		const text =
			typeof data.text === 'string' ? JSON.parse(data.text) : data.text;

		return {
			id: data.id,
			type: text.type,
			payload: text.payload,
			raw: data,
		};
	} catch (err) {
		console.error('[WS] Failed to parse message:', rawData, err);
		return null;
	}
};

/**
 * Hook for managing WebSocket connection
 *
 * @param {Object} options - Configuration options
 * @param {boolean} [options.autoConnect=false] - Connect automatically on mount
 * @param {Function} [options.onMessage] - Callback for each message received
 * @param {Function} [options.onConnect] - Callback when connection is established
 * @param {Function} [options.onError] - Callback on connection error
 * @param {Function} [options.onClose] - Callback when connection is closed
 * @returns {Object} WebSocket state and controls
 */
const useWebSocket = ({
	autoConnect = false,
	onMessage,
	onConnect,
	onError,
	onClose,
} = {}) => {
	const [connectionState, setConnectionState] = useState(
		CONNECTION_STATE.DISCONNECTED
	);
	const [lastMessage, setLastMessage] = useState(null);
	const [messages, setMessages] = useState([]);

	// Refs for WebSocket and callbacks
	const webSocketRef = useRef(null);
	const onMessageRef = useRef(onMessage);
	const onConnectRef = useRef(onConnect);
	const onErrorRef = useRef(onError);
	const onCloseRef = useRef(onClose);

	// Keep callback refs updated
	useEffect(() => {
		onMessageRef.current = onMessage;
		onConnectRef.current = onConnect;
		onErrorRef.current = onError;
		onCloseRef.current = onClose;
	}, [onMessage, onConnect, onError, onClose]);

	/**
	 * Get user ULID from flavioData
	 */
	const getUserUlid = useCallback(() => {
		const ulid = window.flavioData?.user?.ulid;
		if (!ulid) {
			console.error('[WS] User ULID not found in window.flavioData');
			return null;
		}
		return ulid;
	}, []);

	/**
	 * Build WebSocket URL
	 * Format: wss://{host}/ws/{ulid}
	 */
	const buildWsUrl = useCallback(() => {
		const ulid = getUserUlid();
		if (!ulid) return null;

		const host = getWebSocketHost();
		if (!host) return null;

		// WebSocket uses wss:// (secure) protocol
		return `wss://${host}/ws/${ulid}`;
	}, [getUserUlid]);

	/**
	 * Connect to WebSocket
	 */
	const connect = useCallback(() => {
		// Don't connect if already connected or connecting
		if (
			webSocketRef.current &&
			(webSocketRef.current.readyState === WebSocket.CONNECTING ||
				webSocketRef.current.readyState === WebSocket.OPEN)
		) {
			return;
		}

		const url = buildWsUrl();
		if (!url) {
			setConnectionState(CONNECTION_STATE.ERROR);
			return;
		}

		setConnectionState(CONNECTION_STATE.CONNECTING);

		try {
			const ws = new WebSocket(url);
			webSocketRef.current = ws;

			ws.onopen = () => {
				console.log('[WS] Connected');
				setConnectionState(CONNECTION_STATE.CONNECTED);
				onConnectRef.current?.();
			};

			ws.onmessage = (event) => {
				const message = parseMessage(event.data);
				if (message) {
					setLastMessage(message);
					setMessages((prev) => [...prev, message]);
					onMessageRef.current?.(message);
				}
			};

			ws.onerror = (error) => {
				setConnectionState(CONNECTION_STATE.ERROR);
				logError(new Error('WebSocket connection error'), {
					component: 'useWebSocket',
					url,
				});
				onErrorRef.current?.(error);
			};

			ws.onclose = (event) => {
				setConnectionState(CONNECTION_STATE.DISCONNECTED);
				webSocketRef.current = null;

				if (!event.wasClean) {
					logError(new Error('WebSocket closed unexpectedly'), {
						component: 'useWebSocket',
						code: event.code,
						reason: event.reason,
					});
				}

				onCloseRef.current?.(event);
			};
		} catch (err) {
			setConnectionState(CONNECTION_STATE.ERROR);
			logError(err, {
				component: 'useWebSocket',
				action: 'connect',
			});
		}
	}, [buildWsUrl]);

	/**
	 * Disconnect from WebSocket
	 */
	const disconnect = useCallback(() => {
		if (webSocketRef.current) {
			console.log('[WS] Disconnecting');
			webSocketRef.current.close(1000, 'Client disconnect');
			webSocketRef.current = null;
			setConnectionState(CONNECTION_STATE.DISCONNECTED);
		}
	}, []);

	/**
	 * Clear message history
	 */
	const clearMessages = useCallback(() => {
		setMessages([]);
		setLastMessage(null);
	}, []);

	// Auto-connect on mount if enabled
	useEffect(() => {
		if (autoConnect) {
			connect();
		}

		// Cleanup on unmount
		return () => {
			disconnect();
		};
	}, [autoConnect, connect, disconnect]);

	return {
		// State
		connectionState,
		lastMessage,
		messages,
		isConnected: connectionState === CONNECTION_STATE.CONNECTED,
		isConnecting: connectionState === CONNECTION_STATE.CONNECTING,

		// Actions
		connect,
		disconnect,
		clearMessages,

		// Utilities
		getUserUlid,
		buildWsUrl,
	};
};

export default useWebSocket;

