// Error utility functions for centralized error handling

/**
 * Log error to console and optionally to external service
 */
export const logError = (error, errorInfo = null) => {
    console.error('Error caught:', error);
    if (errorInfo) {
        console.error('Error info:', errorInfo);
    }

    // TODO: Integrate with error reporting service (Sentry, LogRocket, etc.)
    // Example: Sentry.captureException(error, { extra: errorInfo });
};

/**
 * Extract user-friendly error message from error object
 */
export const getErrorMessage = (error) => {
    if (!error) return 'An unexpected error occurred';

    // API error with response
    if (error.response?.data?.error) {
        return error.response.data.error;
    }

    if (error.response?.data?.message) {
        return error.response.data.message;
    }

    // Network error
    if (error.message === 'Network Error') {
        return 'Unable to connect to the server. Please check your internet connection.';
    }

    // Timeout error
    if (error.code === 'ECONNABORTED') {
        return 'Request timed out. Please try again.';
    }

    // Generic error message
    if (error.message) {
        return error.message;
    }

    return 'An unexpected error occurred';
};

/**
 * Store error context in sessionStorage for error pages
 */
export const setErrorContext = (errorData) => {
    try {
        sessionStorage.setItem('awm_error_context', JSON.stringify({
            ...errorData,
            timestamp: new Date().toISOString(),
        }));
    } catch (e) {
        console.error('Failed to store error context:', e);
    }
};

/**
 * Retrieve error context from sessionStorage
 */
export const getErrorContext = () => {
    try {
        const context = sessionStorage.getItem('awm_error_context');
        return context ? JSON.parse(context) : null;
    } catch (e) {
        console.error('Failed to retrieve error context:', e);
        return null;
    }
};

/**
 * Clear error context from sessionStorage
 */
export const clearErrorContext = () => {
    try {
        sessionStorage.removeItem('awm_error_context');
    } catch (e) {
        console.error('Failed to clear error context:', e);
    }
};

/**
 * Generate unique error ID for tracking
 */
export const generateErrorId = () => {
    return `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};

/**
 * Report error to external service (placeholder for future integration)
 */
export const reportError = (error, context = {}) => {
    const errorId = generateErrorId();

    logError(error, context);

    // Store error for potential user reporting
    setErrorContext({
        errorId,
        message: getErrorMessage(error),
        context,
    });

    // TODO: Send to error tracking service
    // Example: 
    // fetch('/api/errors/report', {
    //   method: 'POST',
    //   body: JSON.stringify({ errorId, error: error.toString(), context })
    // });

    return errorId;
};

/**
 * Check if user is online
 */
export const isOnline = () => {
    return navigator.onLine;
};

/**
 * Format error timestamp for display
 */
export const formatErrorTime = (timestamp) => {
    if (!timestamp) return '';

    try {
        const date = new Date(timestamp);
        return date.toLocaleString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    } catch (e) {
        return '';
    }
};
