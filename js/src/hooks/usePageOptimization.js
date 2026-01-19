/**
 * usePageOptimization Hook
 *
 * Manages the page optimization flow:
 * 1. Chat phase: User selects/enters a topic
 * 2. Loading phase: Fetching proposals from backend
 * 3. Editing phase: User reviews and edits proposals
 * 4. Applying phase: Sending changes to backend
 *
 * @module hooks/usePageOptimization
 */

import { useState, useCallback, useRef } from 'react';
import { post } from '@/api/client';
import { logError } from '@/errors/logger';

/**
 * Minimum time to show loading animation (in ms)
 * This ensures users see the progress checklist animation
 */
const MIN_LOADING_TIME = 5000;

/**
 * Optimization phases
 */
export const OPTIMIZATION_PHASE = {
	CHAT: 'chat', // User is selecting a topic
	LOADING_PROPOSALS: 'loading_proposals', // Fetching proposals
	EDITING: 'editing', // User is reviewing/editing proposals
	APPLYING: 'applying', // Applying changes
	SUCCESS: 'success', // Changes applied successfully
	ERROR: 'error', // Something went wrong
};

/**
 * Hook for managing page optimization workflow
 *
 * @param {Object} options - Configuration options
 * @param {Object} options.task - The task object from SmartPlan
 * @param {Function} [options.onSuccess] - Callback when changes are applied successfully
 * @param {Function} [options.onError] - Callback when an error occurs
 * @returns {Object} Page optimization state and controls
 */
const usePageOptimization = ({ task, onSuccess, onError } = {}) => {
	// TODO: Remove - temp dev shortcut to skip to editing
	// const [phase, setPhase] = useState(OPTIMIZATION_PHASE.CHAT);
	const [phase, setPhase] = useState(OPTIMIZATION_PHASE.EDITING);
	// TODO: Remove - temp dev mock data
	const [selectedTopic, setSelectedTopic] = useState(
		'How to care for handmade jewelry'
	);
	// TODO: Remove - temp dev mock data
	const [proposals, setProposals] = useState([
		{
			id: 'page_title',
			title: "📣 I've refined the page title",
			type: 'text',
			label: 'Title',
			value: 'Caring for Handmade Jewelry: What You Need to Know',
			isExpanded: true,
		},
		{
			id: 'content',
			title: "🖊️ Here's an updated version of your content",
			type: 'textarea',
			label: 'Content',
			value: "How to Care for Handmade Jewelry: Easy Tips to Keep Every Piece Beautiful\n\nHandmade jewelry is special — each piece is crafted with care and attention to detail. Taking a few simple steps to maintain it can keep it looking beautiful for years. Here's how you can care for your favorite jewelry without hassle.\n\n1. Handle Your Jewelry Gently\n\nTreat your pieces with care. Avoid pulling, bending, or wearing them during activities that could cause scratches or breakage. Take off rings, bracelets, or necklaces before exercising, cleaning, or swimming.\n\n2. Keep Jewelry Clean\n\nDirt, oils, and sweat can dull the shine of your jewelry. Clean your pieces regularly using a soft cloth. For metal or gemstones, use mild soap and warm water if needed, then dry thoroughly. Avoid harsh chemicals that could damage delicate materials.\n\n3. Store Jewelry Properly\n\nProper storage prevents tangling, scratches, and tarnishing. Use a soft pouch, separate compartments in a jewelry box, or individual boxes for each piece. Keep pieces away from direct sunlight, heat, and humidity.",
			isExpanded: true,
		},
		{
			id: 'meta',
			title: "📂 Here's how your page will appear in search results",
			type: 'meta',
			metaTitle: 'Caring for Handmade Jewelry: What You Need to Know',
			metaDescription:
				'Discover the best ways to clean, store, and protect handmade jewelry. Easy steps to keep every piece looking beautiful and lasting longer.',
			isExpanded: true,
		},
		{
			id: 'tags',
			title: '⚡ These tags and categories improve content grouping',
			type: 'tags',
			tags: ['Tag 1', 'Tag 2', 'Tag 3'],
			categories: ['Category 1', 'Category 2', 'Category 3'],
			availableCategories: [
				'Category 1',
				'Category 2',
				'Category 3',
				'Category 4',
				'Category 5',
				'Category 6',
				'Category 7',
				'Category 8',
				'Category 9',
				'Category 10',
				'Category 11',
				'Category 12',
				'Category 13',
				'Category 14',
				'Category 15',
				'Category 16',
				'Category 17',
				'Category 18',
				'Category 19',
				'Category 20',
			],
			isExpanded: true,
		},
		{
			id: 'structured',
			title: "🧩 I've added extra page details for search engines",
			type: 'info',
			description:
				"I've added structured data to your page to help search engines better understand its content and context. This improves how your page is indexed and can enhance its appearance in search results.",
			isExpanded: true,
		},
	]);
	const [error, setError] = useState(null);

	// Store pending data to show after loading animation completes
	const pendingDataRef = useRef(null);
	const pendingErrorRef = useRef(null);

	// Extract page_id from task metadata (mock for now)
	const pageId = task?.metadata?.page_id || 1;
	const taskId = task?.id;

	/**
	 * Fetch topic suggestions from backend
	 *
	 * @param {string} query - User's input query
	 * @returns {Promise<string[]>} Array of topic suggestions
	 */
	const fetchTopics = useCallback(
		async (query = '') => {
			try {
				const response = await post('/tasks/page-optimization/topics', {
					query,
					page_id: pageId,
				});
				return response?.data?.topics || [];
			} catch (err) {
				logError(err, {
					component: 'usePageOptimization',
					action: 'fetchTopics',
				});
				return [];
			}
		},
		[pageId]
	);

	/**
	 * Select a topic and fetch proposals
	 * Starts loading animation and fetches data in parallel
	 *
	 * @param {string} topic - The selected topic
	 */
	const selectTopic = useCallback(
		async (topic) => {
			setSelectedTopic(topic);
			setPhase(OPTIMIZATION_PHASE.LOADING_PROPOSALS);
			setError(null);
			pendingDataRef.current = null;
			pendingErrorRef.current = null;

			// Start both the API call and the minimum loading timer
			const loadingStartTime = Date.now();

			try {
				const response = await post(
					'/tasks/page-optimization/proposals',
					{
						topic,
						page_id: pageId,
					}
				);

				const proposalsData = response?.data?.proposals || [];
				// Initialize proposals with expanded state and value from proposed
				const initializedProposals = proposalsData.map((p) => ({
					...p,
					value: p.proposed || p.value,
					isExpanded: true,
				}));

				// Store data to be shown after loading completes
				pendingDataRef.current = initializedProposals;

				// Calculate remaining time to wait
				const elapsedTime = Date.now() - loadingStartTime;
				const remainingTime = Math.max(
					0,
					MIN_LOADING_TIME - elapsedTime
				);

				// Wait for minimum loading time to complete
				if (remainingTime > 0) {
					await new Promise((resolve) =>
						setTimeout(resolve, remainingTime)
					);
				}

				setProposals(initializedProposals);
				setPhase(OPTIMIZATION_PHASE.EDITING);
			} catch (err) {
				logError(err, {
					component: 'usePageOptimization',
					action: 'selectTopic',
					topic,
				});

				// Store error to be shown after loading completes
				pendingErrorRef.current = err;

				// Calculate remaining time to wait
				const elapsedTime = Date.now() - loadingStartTime;
				const remainingTime = Math.max(
					0,
					MIN_LOADING_TIME - elapsedTime
				);

				// Wait for minimum loading time to complete
				if (remainingTime > 0) {
					await new Promise((resolve) =>
						setTimeout(resolve, remainingTime)
					);
				}

				setError(err);
				setPhase(OPTIMIZATION_PHASE.ERROR);
				onError?.(err);
			}
		},
		[pageId, onError]
	);

	/**
	 * Update a proposal's value
	 *
	 * @param {string} proposalId - The proposal ID to update
	 * @param {string} value - The new value
	 */
	const updateProposal = useCallback((proposalId, updates) => {
		setProposals((prev) =>
			prev.map((p) => {
				if (p.id !== proposalId) return p;
				// If updates is an object with known keys, merge it
				if (
					typeof updates === 'object' &&
					updates !== null &&
					!Array.isArray(updates)
				) {
					return { ...p, ...updates };
				}
				// Otherwise treat as simple value update
				return { ...p, value: updates };
			})
		);
	}, []);

	/**
	 * Toggle a proposal's expanded state
	 *
	 * @param {string} proposalId - The proposal ID to toggle
	 */
	const toggleProposalExpanded = useCallback((proposalId) => {
		setProposals((prev) =>
			prev.map((p) =>
				p.id === proposalId ? { ...p, isExpanded: !p.isExpanded } : p
			)
		);
	}, []);

	/**
	 * Apply all proposals
	 */
	const applyProposals = useCallback(async () => {
		setPhase(OPTIMIZATION_PHASE.APPLYING);
		setError(null);

		try {
			// Transform proposals to send to backend
			const proposalsToSend = proposals.map((p) => ({
				id: p.id,
				value: p.value,
			}));

			await post('/tasks/page-optimization/apply', {
				page_id: pageId,
				task_id: taskId,
				proposals: proposalsToSend,
			});

			setPhase(OPTIMIZATION_PHASE.SUCCESS);
			onSuccess?.();
		} catch (err) {
			logError(err, {
				component: 'usePageOptimization',
				action: 'applyProposals',
			});
			setError(err);
			setPhase(OPTIMIZATION_PHASE.ERROR);
			onError?.(err);
		}
	}, [proposals, pageId, taskId, onSuccess, onError]);

	/**
	 * Postpone the task (dismiss it from the current plan)
	 */
	const postponeTask = useCallback(async () => {
		if (!taskId) return;

		try {
			await post(`/task/dismiss/${taskId}`, {});
			return { success: true };
		} catch (err) {
			logError(err, {
				component: 'usePageOptimization',
				action: 'postponeTask',
				taskId,
			});
			return { success: false, error: err };
		}
	}, [taskId]);

	/**
	 * Reset to chat phase (start over)
	 */
	const reset = useCallback(() => {
		setPhase(OPTIMIZATION_PHASE.CHAT);
		setSelectedTopic(null);
		setProposals([]);
		setError(null);
	}, []);

	/**
	 * Go back from editing to chat
	 */
	const goBackToChat = useCallback(() => {
		setPhase(OPTIMIZATION_PHASE.CHAT);
		setProposals([]);
	}, []);

	return {
		// State
		phase,
		selectedTopic,
		proposals,
		error,
		pageId,
		taskId,

		// Computed
		isLoading: phase === OPTIMIZATION_PHASE.LOADING_PROPOSALS,
		isApplying: phase === OPTIMIZATION_PHASE.APPLYING,
		isSuccess: phase === OPTIMIZATION_PHASE.SUCCESS,
		hasError: phase === OPTIMIZATION_PHASE.ERROR,
		canApply: phase === OPTIMIZATION_PHASE.EDITING && proposals.length > 0,

		// Actions
		fetchTopics,
		selectTopic,
		updateProposal,
		toggleProposalExpanded,
		applyProposals,
		postponeTask,
		reset,
		goBackToChat,
	};
};

export default usePageOptimization;
