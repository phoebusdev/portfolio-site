import './ErrorState.css';

export function ErrorState({
  error,
  section,
  onRetry,
  showRetry = true
}) {
  return (
    <div className="error-state" role="alert">
      <div className="error-icon" aria-hidden="true">⚠️</div>
      <h3 className="error-title">
        {section ? `Unable to load ${section}` : 'Something went wrong'}
      </h3>
      <p className="error-message">
        {typeof error === 'string' ? error : 'Please try refreshing the page'}
      </p>
      {showRetry && onRetry && (
        <button onClick={onRetry} className="error-retry-button">
          Try Again
        </button>
      )}
      {import.meta.env.DEV && typeof error === 'object' && (
        <details className="error-details-dev">
          <summary>Error Details</summary>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </details>
      )}
    </div>
  );
}
