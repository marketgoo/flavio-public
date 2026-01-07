/**
 * Centralized localStorage management for Flavio application
 * Provides type-safe access to persistent data with error handling
 */

const STORAGE_KEYS = {
	ONBOARDING: 'flavio_onboarding',
	TOKEN: 'flavio_token',
	SIGNATURE: 'flavio_signature',
};

const storage = {
	/**
	 * Get value from localStorage with automatic JSON parsing
	 *
	 * @param {string} key - Storage key
	 * @param {*} [defaultValue=null] - Value to return if key doesn't exist or parsing fails
	 * @returns {*} Parsed value from storage, or defaultValue if not found
	 */
	get(key, defaultValue = null) {
		try {
			const item = localStorage.getItem(key);
			if (!item) return defaultValue;
			return JSON.parse(item);
		} catch (error) {
			console.error(`Error reading ${key} from localStorage:`, error);
			return defaultValue;
		}
	},

	/**
	 * Set value in localStorage with automatic JSON serialization
	 *
	 * @param {string} key - Storage key
	 * @param {*} value - Value to store (will be JSON stringified)
	 * @returns {boolean} True if successful, false if error occurred
	 */
	set(key, value) {
		try {
			localStorage.setItem(key, JSON.stringify(value));
			return true;
		} catch (error) {
			console.error(`Error writing ${key} to localStorage:`, error);
			return false;
		}
	},

	/**
	 * Remove value from localStorage
	 *
	 * @param {string} key - Storage key to remove
	 * @returns {boolean} True if successful, false if error occurred
	 */
	remove(key) {
		try {
			localStorage.removeItem(key);
			return true;
		} catch (error) {
			console.error(`Error removing ${key} from localStorage:`, error);
			return false;
		}
	},

	/**
	 * Clear all flavio_ prefixed keys from localStorage
	 *
	 * @returns {boolean} True if successful, false if error occurred
	 */
	clearAll() {
		try {
			Object.keys(localStorage)
				.filter((key) => key.startsWith('flavio_'))
				.forEach((key) => localStorage.removeItem(key));
			return true;
		} catch (error) {
			console.error('Error clearing localStorage:', error);
			return false;
		}
	},
};

// Onboarding-specific storage methods
export const onboardingStorage = {
	/**
	 * Get onboarding state with default structure
	 *
	 * @returns {Object} Onboarding state with currentStep, completedSteps, data, isCompleted, timestamps
	 */
	get: () =>
		storage.get(STORAGE_KEYS.ONBOARDING, {
			currentStep: 1,
			completedSteps: [],
			data: {
				goal: null,
				businessOffer: null,
				targetClient: null,
				localBusiness: null,
				siteName: null,
				tagline: null,
			},
			isCompleted: false,
			startedAt: new Date().toISOString(),
			lastUpdated: new Date().toISOString(),
		}),

	/**
	 * Set onboarding state with automatic timestamp update
	 *
	 * @param {Object} value - Onboarding state object
	 * @returns {boolean} True if successful, false if error occurred
	 */
	set: (value) =>
		storage.set(STORAGE_KEYS.ONBOARDING, {
			...value,
			lastUpdated: new Date().toISOString(),
		}),

	/**
	 * Remove onboarding state from localStorage
	 *
	 * @returns {boolean} True if successful, false if error occurred
	 */
	remove: () => storage.remove(STORAGE_KEYS.ONBOARDING),

	/**
	 * Clear onboarding state from localStorage (alias for remove)
	 * Used when onboarding is confirmed complete in backend
	 *
	 * @returns {boolean} True if successful, false if error occurred
	 */
	clear: () => storage.remove(STORAGE_KEYS.ONBOARDING),

	/**
	 * Check if onboarding is completed
	 * Only localStorage.isCompleted is the source of truth for completion status
	 * Backend data is used for sync, not for determining completion
	 *
	 * @returns {boolean} True if onboarding is marked as completed
	 */
	isCompleted: () => {
		const data = onboardingStorage.get();
		return data.isCompleted || false;
	},

	/**
	 * Check if there's onboarding progress in localStorage
	 * Used to determine if user has partially completed onboarding
	 *
	 * @returns {boolean} True if there's progress data in localStorage
	 */
	hasProgress: () => {
		const data = storage.get(STORAGE_KEYS.ONBOARDING);
		return data !== null && Object.keys(data).length > 0;
	},

	/**
	 * Sync with backend data if localStorage is empty
	 * This helps restore onboarding progress from backend if localStorage was cleared
	 * Determines the correct step based on what data exists in backend
	 *
	 * @returns {boolean} True if data was restored from backend
	 */
	syncWithBackend: () => {
		const localData = onboardingStorage.get();
		const backendData = window.flavioData?.siteInfo;

		// If localStorage already has data or is completed, don't sync
		if (localData.isCompleted || localData.data.goal) {
			return false;
		}

		// If backend has data and localStorage is empty, restore it
		const hasChatData =
			backendData?.success === true &&
			backendData.goal &&
			backendData.business_offer &&
			backendData.target_client &&
			backendData.local_business;

		if (hasChatData) {
			// Backend has Chat data (step 3 completed)
			// Restore data and move to step 4 (Confirmation)
			onboardingStorage.set({
				...localData,
				currentStep: 4, // Go to Confirmation
				completedSteps: [1, 2, 3], // Mark Welcome, Goal, Chat as completed
				data: {
					...localData.data,
					goal: backendData.goal,
					businessOffer: backendData.business_offer,
					targetClient: backendData.target_client,
					localBusiness: backendData.local_business,
					// Note: siteName and tagline come from Confirmation step
					// They are not stored in window.flavioData.siteInfo
				},
			});
			return true;
		}

		return false;
	},
};

// Authentication-specific storage methods
export const authStorage = {
	/**
	 * Get JWT token from localStorage
	 *
	 * @returns {string|null} JWT token string, or null if not found
	 */
	getToken: () => storage.get(STORAGE_KEYS.TOKEN),

	/**
	 * Set JWT token in localStorage
	 *
	 * @param {string} token - JWT token string
	 * @returns {boolean} True if successful, false if error occurred
	 */
	setToken: (token) => storage.set(STORAGE_KEYS.TOKEN, token),

	/**
	 * Remove JWT token from localStorage
	 *
	 * @returns {boolean} True if successful, false if error occurred
	 */
	removeToken: () => storage.remove(STORAGE_KEYS.TOKEN),

	/**
	 * Get temporary signature from localStorage
	 *
	 * @returns {string|null} Signature string, or null if not found
	 */
	getSignature: () => storage.get(STORAGE_KEYS.SIGNATURE),

	/**
	 * Set temporary signature in localStorage
	 *
	 * @param {string} signature - Signature string
	 * @returns {boolean} True if successful, false if error occurred
	 */
	setSignature: (signature) => storage.set(STORAGE_KEYS.SIGNATURE, signature),

	/**
	 * Remove temporary signature from localStorage
	 *
	 * @returns {boolean} True if successful, false if error occurred
	 */
	removeSignature: () => storage.remove(STORAGE_KEYS.SIGNATURE),
};

export default storage;
