import { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import smoothScrollController from './utils/scroll.js';
import sessionTracker from './utils/session.js';
import analyticsTracker from './utils/analytics.js';
import keyboardNavController from './utils/keyboard.js';
import Navigation from './components/navigation/Navigation.jsx';
import HomePage from './pages/HomePage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import PressPage from './pages/PressPage.jsx';
import ResourcesPage from './pages/ResourcesPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import WorkPage from './pages/WorkPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import NoiseOverlay from './components/effects/NoiseOverlay.jsx';
import ParticleSystem from './components/effects/ParticleSystem.jsx';
import './styles/animations.css';
import './styles/layout.css';
import './styles/depth.css';

function App() {
  const [isReady, setIsReady] = useState(false);
  const [currentSection, setCurrentSection] = useState(null);
  const location = useLocation();

  useEffect(() => {
    // Initialize utilities
    smoothScrollController.init();
    sessionTracker.init();
    analyticsTracker.init();
    keyboardNavController.init();

    // Track performance after load
    const handleLoad = () => {
      setTimeout(() => {
        analyticsTracker.trackPerformance();
      }, 100);
    };

    window.addEventListener('load', handleLoad);

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
      window.removeEventListener('load', handleLoad);
    };
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

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
      {/* Global ambient effects */}
      <NoiseOverlay opacity={0.03} />
      <ParticleSystem count={20} />

      {/* Navigation */}
      <Navigation />

      {/* Main content with routes */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/press" element={<PressPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/work" element={<WorkPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
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
