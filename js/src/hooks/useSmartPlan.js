/**
 * useSmartPlan Hook
 *
 * Manages Smart Plan tasks: fetching from backend, real-time updates via WebSocket,
 * and task actions (apply, complete, postpone, dismiss).
 *
 * Task schema from backend:
 * {
 *   id: string,
 *   type: string,              // e.g., 'ssl', 'structured-data', 'meta-description'
 *   title: string,
 *   description: string,
 *   badge: string,             // Category label
 *   priority: number,          // 0-10 (higher = more important)
 *   status: 'pending' | 'completed' | 'dismissed' | 'postponed',
 *   action_type: 'apply' | 'mark-done',
 *   api_endpoint: string,      // For 'apply' actions
 *   active_from: string,       // ISO date
 *   postponed_until: string,   // ISO date or null
 *   completed_date: string,    // ISO date or null
 * }
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { get, post } from '@/api/client';
import { logError } from '@/errors/logger';
import {
	TASK_STATUS,
	SMART_PLAN_STATE,
	STATUS_DISPLAY_DURATION,
} from '@/constants/taskStatus';
import {
	transformTask,
	getDisplayTasks,
} from '@/features/dashboard/utils/taskTransformers';

// Re-export TASK_STATUS for backward compatibility
export { TASK_STATUS };

/**
 * Hook for managing Smart Plan tasks
 *
 * @param {Object} options - Configuration options
 * @param {boolean} [options.autoFetch=true] - Fetch tasks on mount
 * @param {number} [options.maxTasks=2] - Max tasks to display
 * @returns {Object} Smart Plan state and controls
 */
const useSmartPlan = ({ autoFetch = true, maxTasks = 2 } = {}) => {
	const [allTasks, setAllTasks] = useState([]);
	const [planState, setPlanState] = useState(SMART_PLAN_STATE.LOADING);
	const [error, setError] = useState(null);

	// Store timeout IDs for cleanup on unmount
	const timeoutRefs = useRef([]);

	// Cleanup timeouts on unmount to prevent memory leaks
	useEffect(() => {
		return () => {
			timeoutRefs.current.forEach(clearTimeout);
			timeoutRefs.current = [];
		};
	}, []);

	/**
	 * Fetch tasks from backend
	 * Tasks are at: response.data.attributes.site.progress.tasks
	 */
	const fetchTasks = useCallback(async () => {
		setPlanState(SMART_PLAN_STATE.LOADING);
		setError(null);

		try {
			const response = await get('/data');

			// Tasks are at: response.data.attributes.site.tasks (not progress.tasks)
			const rawTasks = response?.data?.attributes?.site?.tasks || [];

			if (!Array.isArray(rawTasks) || rawTasks.length === 0) {
				setAllTasks([]);
				setPlanState(SMART_PLAN_STATE.EMPTY);
				return;
			}

			// Transform all tasks (filter out unknown ones)
			const tasks = rawTasks.map(transformTask).filter(Boolean);
			setAllTasks(tasks);

			// Determine state based on pending tasks
			const pendingTasks = tasks.filter(
				(t) => t.status === TASK_STATUS.PENDING
			);
			setPlanState(
				pendingTasks.length > 0
					? SMART_PLAN_STATE.READY
					: SMART_PLAN_STATE.EMPTY
			);

			console.log('[SmartPlan] Loaded tasks:', {
				total: tasks.length,
				pending: pendingTasks.length,
			});
		} catch (err) {
			logError(err, {
				component: 'useSmartPlan',
				action: 'fetchTasks',
			});
			setError(err);
			setPlanState(SMART_PLAN_STATE.ERROR);
		}
	}, []);

	/**
	 * Update a task's status locally
	 */
	const updateTaskStatus = useCallback((taskId, newStatus) => {
		setAllTasks((prev) =>
			prev.map((task) =>
				task.id === taskId ? { ...task, status: newStatus } : task
			)
		);
	}, []);

	/**
	 * Execute a task action with state transitions
	 * Shared logic for applyTask and completeTask
	 *
	 * @param {Object} task - Task to execute
	 * @param {string} endpoint - API endpoint to call
	 * @param {string} actionName - Name for error logging
	 * @returns {Promise<{success: boolean, error?: Error}>}
	 */
	const executeTaskWithTransition = useCallback(
		async (task, endpoint, actionName) => {
			updateTaskStatus(task.id, TASK_STATUS.APPLYING);

			try {
				await post(endpoint, {});
				updateTaskStatus(task.id, TASK_STATUS.COMPLETED);

				// After 3s, remove from visible list
				const successTimeoutId = setTimeout(() => {
					updateTaskStatus(task.id, TASK_STATUS.DISMISSED);
				}, STATUS_DISPLAY_DURATION);
				timeoutRefs.current.push(successTimeoutId);

				return { success: true };
			} catch (err) {
				logError(err, {
					component: 'useSmartPlan',
					action: actionName,
					id: task.id,
					taskId: task.taskId,
				});
				updateTaskStatus(task.id, TASK_STATUS.INCOMPLETE);

				// After 3s, return to PENDING so user can retry
				const errorTimeoutId = setTimeout(() => {
					updateTaskStatus(task.id, TASK_STATUS.PENDING);
				}, STATUS_DISPLAY_DURATION);
				timeoutRefs.current.push(errorTimeoutId);

				return { success: false, error: err };
			}
		},
		[updateTaskStatus]
	);

	/**
	 * Apply an optimization task (tasks with apiEndpoint)
	 */
	const applyTask = useCallback(
		async (task) => {
			if (!task.apiEndpoint) {
				updateTaskStatus(task.id, TASK_STATUS.INCOMPLETE);
				return {
					success: false,
					error: 'No API endpoint for this task',
				};
			}
			return executeTaskWithTransition(task, task.apiEndpoint, 'applyTask');
		},
		[executeTaskWithTransition, updateTaskStatus]
	);

	/**
	 * Mark a task as done (manual tasks without apiEndpoint)
	 * Uses dismiss endpoint since there's no "complete" endpoint
	 */
	const completeTask = useCallback(
		async (task) => {
			return executeTaskWithTransition(
				task,
				`/task/dismiss/${task.id}`,
				'completeTask'
			);
		},
		[executeTaskWithTransition]
	);

	/**
	 * Dismiss a task (hide from plan)
	 * Uses endpoint: POST /task/dismiss/{id}
	 * NOTE: Uses numeric id (339), not taskId string ("structureddata")
	 */
	const dismissTask = useCallback(
		async (task) => {
			try {
				await post(`/task/dismiss/${task.id}`, {});
				updateTaskStatus(task.id, TASK_STATUS.DISMISSED);
				return { success: true };
			} catch (err) {
				logError(err, {
					component: 'useSmartPlan',
					action: 'dismissTask',
					id: task.id,
					taskId: task.taskId,
				});
				return { success: false, error: err };
			}
		},
		[updateTaskStatus]
	);

	// Computed: tasks to display (filtered, sorted, limited)
	const displayTasks = useMemo(
		() => getDisplayTasks(allTasks, maxTasks),
		[allTasks, maxTasks]
	);

	// Computed: check if all tasks are complete
	// Only true when displayTasks is empty (no visible tasks)
	// This ensures COMPLETED/INCOMPLETE states are shown before empty state
	const allTasksComplete = useMemo(() => {
		return allTasks.length > 0 && displayTasks.length === 0;
	}, [allTasks, displayTasks]);

	// Computed: check if any task is applying
	const hasApplyingTask = useMemo(
		() => allTasks.some((t) => t.status === TASK_STATUS.APPLYING),
		[allTasks]
	);

	// Auto-fetch on mount
	useEffect(() => {
		if (autoFetch) {
			fetchTasks();
		}
	}, [autoFetch, fetchTasks]);

	// NOTE: WebSocket connection is handled by useScan hook when user clicks "Refresh"
	// We don't auto-connect here to avoid duplicate connections
	// The onScanComplete callback in SmartPlan.jsx calls fetchTasks() to refresh data

	return {
		// State
		tasks: displayTasks,
		allTasks,
		planState,
		error,
		isLoading: planState === SMART_PLAN_STATE.LOADING,
		isEmpty: planState === SMART_PLAN_STATE.EMPTY,
		hasError: planState === SMART_PLAN_STATE.ERROR,
		allTasksComplete,
		hasApplyingTask,

		// Actions
		fetchTasks,
		applyTask,
		completeTask,
		dismissTask,
		updateTaskStatus,
	};
};

export default useSmartPlan;
