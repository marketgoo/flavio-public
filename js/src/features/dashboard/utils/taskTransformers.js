/**
 * Task Transformers
 *
 * Pure functions for transforming and filtering Smart Plan tasks.
 * No React dependencies - can be tested independently.
 */

import { TASK_DEFINITIONS } from '@/features/dashboard/config/taskDefinitions';
import { TASK_STATUS, VISIBLE_STATUSES } from '@/constants/taskStatus';

/**
 * Transform backend task to frontend format
 *
 * @param {Object} backendTask - Task from backend API
 * @returns {Object|null} Frontend task object or null if unknown task
 */
export const transformTask = (backendTask) => {
    const isKnownTask = backendTask.task_id in TASK_DEFINITIONS;

    // Skip unknown tasks - only show supported ones
    if (!isKnownTask) {
        console.warn(
            `[SmartPlan] Skipping unknown task: "${backendTask.task_id}"`
        );
        return null;
    }

    const taskDef = TASK_DEFINITIONS[backendTask.task_id];

    // Calculate priority from impact (0-1 scale to 0-100)
    const priority = backendTask.impact
        ? Math.round(backendTask.impact * 100)
        : 0;

    // Determine status from pass field only
    // Tasks that passed on backend should be DISMISSED (not visible)
    // COMPLETED status is only for tasks completed during current session (shown temporarily)
    // Note: completed_at is ignored as it may contain creation dates, not actual completion
    let status = TASK_STATUS.PENDING;
    if (backendTask.pass) {
        status = TASK_STATUS.DISMISSED;
    }

    return {
        id: backendTask.id,
        taskId: backendTask.task_id,
        type: backendTask.task_id,
        title: taskDef.title,
        description: taskDef.description,
        tags: taskDef.tags || [],
        priority,
        status,
        actionType: taskDef.actionType,
        apiEndpoint: taskDef.apiEndpoint,
        difficulty: backendTask.difficulty,
        section: backendTask.section,
        createdAt: backendTask.created_at
            ? new Date(backendTask.created_at)
            : null,
        completedAt: backendTask.completed_at
            ? new Date(backendTask.completed_at)
            : null,
        metadata: backendTask.metadata,
        iconType: taskDef.icon,
        // Keep original for reference
        _raw: backendTask,
    };
};

/**
 * Filter and sort tasks for display
 * - Show pending, applying, and incomplete tasks
 * - Sort by priority (highest first)
 * - Limit to top N tasks
 *
 * @param {Array} tasks - All tasks
 * @param {number} [limit=2] - Max tasks to show
 * @returns {Array} Filtered and sorted tasks
 */
export const getDisplayTasks = (tasks, limit = 2) =>
    tasks
        .filter((task) => VISIBLE_STATUSES.includes(task.status))
        .sort((a, b) => b.priority - a.priority)
        .slice(0, limit);

/**
 * Transform array of backend tasks
 *
 * @param {Array} backendTasks - Array of tasks from backend
 * @returns {Array} Array of frontend task objects (unknown tasks filtered out)
 */
export const transformTasks = (backendTasks) =>
    backendTasks.map(transformTask).filter(Boolean);
