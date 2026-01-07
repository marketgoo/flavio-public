/**
 * Event Capture Hook for DevTools
 *
 * Subscribes to PostHog events and stores them for display in DevTools.
 */

import { useState, useEffect, useCallback } from 'react';
import { subscribeToEvents } from '@/lib/events';

// Global event store (persists across component remounts)
// Uses a Map for O(1) duplicate detection
const eventStore = {
	eventsMap: new Map(),
	listeners: new Set(),
	maxEvents: 50,

	add(event) {
		// Avoid duplicates (same id)
		if (this.eventsMap.has(event.id)) {
			return;
		}

		this.eventsMap.set(event.id, event);

		// Trim old events if over limit
		if (this.eventsMap.size > this.maxEvents) {
			const firstKey = this.eventsMap.keys().next().value;
			this.eventsMap.delete(firstKey);
		}

		this.notify();
	},

	clear() {
		this.eventsMap.clear();
		this.notify();
	},

	notify() {
		const events = this.getEvents();
		this.listeners.forEach((listener) => listener(events));
	},

	subscribe(listener) {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	},

	getEvents() {
		// Return events sorted by timestamp (newest first)
		return [...this.eventsMap.values()].sort(
			(a, b) => b.timestamp - a.timestamp
		);
	},
};

// Subscribe to events module once at module load time
let isSubscribed = false;

const ensureSubscribed = () => {
	if (isSubscribed) return;
	isSubscribed = true;

	subscribeToEvents((event) => {
		eventStore.add(event);
	});
};

// Subscribe immediately when this module loads
ensureSubscribed();

/**
 * Hook for accessing captured events in DevTools
 *
 * @returns {Object} Event capture controls
 * @returns {Array} events - List of captured events
 * @returns {Function} clearEvents - Clear all captured events
 */
const useEventCapture = () => {
	// Get current events (including historical ones already loaded)
	const [events, setEvents] = useState(() => eventStore.getEvents());

	useEffect(() => {
		// Subscribe to future updates
		const unsubscribe = eventStore.subscribe(setEvents);
		return unsubscribe;
	}, []);

	const clearEvents = useCallback(() => {
		eventStore.clear();
	}, []);

	return {
		events,
		clearEvents,
	};
};

export default useEventCapture;
