import { useState } from 'react';
import './SitePreview.css';

function SitePreview({ url, title }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (!url) {
    return null;
  }

  return (
    <div className="site-preview">
      <div className="preview-browser-bar">
        <div className="browser-dots">
          <span className="dot red"></span>
          <span className="dot yellow"></span>
          <span className="dot green"></span>
        </div>
        <div className="browser-url">{url}</div>
      </div>
      <div className="preview-container">
        {isLoading && (
          <div className="preview-loading">
            <div className="loading-spinner"></div>
            <p>Loading preview...</p>
          </div>
        )}
        {hasError ? (
          <div className="preview-error">
            <p>Preview unavailable</p>
            <a href={url} target="_blank" rel="noopener noreferrer">
              Open in new tab →
            </a>
          </div>
        ) : (
          <iframe
            src={url}
            title={`Preview of ${title}`}
            className={`preview-iframe ${isLoading ? 'loading' : ''}`}
            onLoad={handleLoad}
            onError={handleError}
            sandbox="allow-scripts allow-same-origin"
            loading="lazy"
          />
        )}
      </div>
    </div>
  );
}

export default SitePreview;
