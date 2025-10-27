import { useEffect, useState } from 'react';
import './LoadingState.css';

function LoadingState({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Simulate loading progress (replace with actual asset loading)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsComplete(true);
          setTimeout(() => {
            onComplete?.();
          }, 500);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className={`loading-state ${isComplete ? 'complete' : ''}`}>
      <div className="loading-content">
        <div className="loading-bar-container">
          <div
            className="loading-bar"
            style={{
              transform: `scaleX(${progress / 100})`,
            }}
          />
        </div>
        <div className="loading-text">
          {progress < 100 ? `${Math.round(progress)}%` : 'Ready'}
        </div>
      </div>
    </div>
  );
}

export default LoadingState;
