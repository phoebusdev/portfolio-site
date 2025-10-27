import { useEffect, useState } from 'react';
import smoothScrollController from './utils/scroll.js';
import sessionTracker from './utils/session.js';
import analyticsTracker from './utils/analytics.js';
import keyboardNavController from './utils/keyboard.js';
import ProvenExcellence from './components/sections/ProvenExcellence.jsx';
import StrategicVision from './components/sections/StrategicVision.jsx';
import ImmediateValue from './components/sections/ImmediateValue.jsx';
import './styles/animations.css';
import './styles/layout.css';

function App() {
  const [isReady, setIsReady] = useState(false);
  const [currentSection, setCurrentSection] = useState(null);

  useEffect(() => {
    // Initialize utilities
    smoothScrollController.init();
    sessionTracker.init();
    analyticsTracker.init();
    keyboardNavController.init();

    // Track performance after load
    window.addEventListener('load', () => {
      setTimeout(() => {
        analyticsTracker.trackPerformance();
      }, 100);
    });

    // Listen for section changes
    const handleSectionChange = (event) => {
      setCurrentSection(event.detail.sectionId);
      analyticsTracker.trackSectionView(event.detail.sectionId);
    };

    window.addEventListener('section-change', handleSectionChange);

    setIsReady(true);

    // Cleanup
    return () => {
      smoothScrollController.destroy();
      keyboardNavController.destroy();
      window.removeEventListener('section-change', handleSectionChange);
    };
  }, []);

  if (!isReady) {
    return (
      <div className="app">
        <div className="loading-container">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <main className="scroll-snap-container">
        <ProvenExcellence />
        <StrategicVision />
        <ImmediateValue />
      </main>

      {/* Current section indicator (debug) */}
      {import.meta.env.DEV && currentSection && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            padding: '10px',
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            borderRadius: '4px',
            fontSize: '12px',
            zIndex: 9999,
          }}
        >
          Current: {currentSection}
        </div>
      )}
    </div>
  );
}

export default App;
