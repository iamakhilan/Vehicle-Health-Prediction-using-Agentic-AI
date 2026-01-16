/**
 * Error Handling Utilities
 * 
 * Provides error handling helpers for agent operations.
 */

/**
 * Wraps an async agent function with error handling
 * @param {Function} agentFn - The agent function to wrap
 * @param {string} agentName - Name of the agent for error messages
 * @returns {Function} Wrapped function with error handling
 */
export const withErrorHandling = (agentFn, agentName) => {
    return async (...args) => {
        try {
            return await agentFn(...args);
        } catch (error) {
            console.error(`${agentName} error:`, error);
            throw new Error(`${agentName} failed: ${error.message}`);
        }
    };
};

/**
 * Retries an operation with exponential backoff
 * @param {Function} operation - The operation to retry
 * @param {number} maxRetries - Maximum number of retry attempts
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise} Result of the operation
 */
export const retryWithBackoff = async (operation, maxRetries = 3, baseDelay = 1000) => {
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;
            
            if (attempt < maxRetries) {
                const delay = baseDelay * Math.pow(2, attempt);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    
    throw lastError;
};
