/**
 * Task Status Constants
 *
 * Shared constants for task management across the Smart Plan feature.
 * Used by useSmartPlan hook and potentially other components.
 */

/**
 * Task status constants (matching backend + frontend-only states)
 */
export const TASK_STATUS = {
    // Backend states
    PENDING: 'pending',
    COMPLETED: 'completed',
    DISMISSED: 'dismissed',
    POSTPONED: 'postponed',
    // Frontend-only states
    APPLYING: 'applying',
    INCOMPLETE: 'incomplete',
};

/**
 * Smart Plan hook states (internal use)
 */
export const SMART_PLAN_STATE = {
    LOADING: 'loading',
    READY: 'ready',
    ERROR: 'error',
    EMPTY: 'empty',
};

/**
 * Statuses that should be displayed in the task list
 * - PENDING: Not started
 * - APPLYING: In progress
 * - COMPLETED: Success (shown temporarily)
 * - INCOMPLETE: Failed (shown temporarily, then back to PENDING)
 */
export const VISIBLE_STATUSES = [
    TASK_STATUS.PENDING,
    TASK_STATUS.APPLYING,
    TASK_STATUS.COMPLETED,
    TASK_STATUS.INCOMPLETE,
];

/**
 * Delay in ms before transitioning from COMPLETED/INCOMPLETE state
 */
export const STATUS_DISPLAY_DURATION = 3000;
