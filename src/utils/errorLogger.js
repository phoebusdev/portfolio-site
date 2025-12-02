/**
 * Centralized Error Logging Utility
 *
 * In production, replace console.error with your error tracking service
 * (Sentry, LogRocket, etc.)
 */

/* eslint-disable no-console */

class ErrorLogger {
  constructor() {
    this.enabled = true;
    this.errorCount = 0;
    this.errorCache = new Set(); // Prevent duplicate error spam
  }

  /**
   * Log error with context
   * @param {string} errorId - Unique identifier for this error type
   * @param {Object} context - Additional context (component, user action, etc.)
   */
  logError(errorId, context = {}) {
    // Create fingerprint to detect duplicates
    const fingerprint = `${errorId}:${JSON.stringify(context)}`;

    // Don't log duplicate errors within 5 seconds
    if (this.errorCache.has(fingerprint)) {
      return;
    }

    this.errorCache.add(fingerprint);
    setTimeout(() => this.errorCache.delete(fingerprint), 5000);

    this.errorCount++;

    const errorData = {
      id: errorId,
      timestamp: new Date().toISOString(),
      context,
      count: this.errorCount,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // In production, send to error tracking service
    if (import.meta.env.PROD) {
      // TODO: Send to Sentry, LogRocket, etc.
      // Example: Sentry.captureException(new Error(errorId), { extra: errorData });
    }

    // Always log to console in development
    if (import.meta.env.DEV) {
      console.error(`[Error ${errorId}]`, errorData);
    }
  }

  /**
   * Log warning (less severe than error)
   */
  logWarning(warningId, context = {}) {
    if (import.meta.env.DEV) {
      console.warn(`[Warning ${warningId}]`, context);
    }
  }

  /**
   * Track non-error issues (performance, UX, etc.)
   */
  logInfo(infoId, context = {}) {
    if (import.meta.env.DEV) {
      console.log(`[Info ${infoId}]`, context);
    }
  }
}

// Singleton instance
const errorLogger = new ErrorLogger();

// Export convenience functions
export const logError = (errorId, context) => errorLogger.logError(errorId, context);
export const logWarning = (warningId, context) => errorLogger.logWarning(warningId, context);
export const logInfo = (infoId, context) => errorLogger.logInfo(infoId, context);

export default errorLogger;
