# Implementation Plan: Critical Fixes → Code Simplification

**Project**: Portfolio Pitch Site Quality Review Implementation
**Total Estimated Time**: 19 hours over 2 weeks
**Priority**: Critical bugs first, then systematic simplification

---

## Phase 1: Critical Bug Fixes (Day 1 - 2 hours)

**Goal**: Fix all memory leaks and critical functional bugs
**Risk**: HIGH - These issues cause production failures
**Dependencies**: None - can start immediately

### Task 1.1: Fix Keyboard Navigation Memory Leak (30 min)

**File**: `src/utils/keyboard.js`
**Issue**: Event listener never removed due to bind() creating new function reference
**Priority**: CRITICAL

**Changes**:
```javascript
class KeyboardNavigationController {
  constructor() {
    this.enabled = true;
    this.sections = ['intro-hero', 'proven-excellence', 'strategic-vision', 'immediate-value']; // Added intro-hero
    this.currentIndex = 0;
    this.boundHandleKeyDown = this.handleKeyDown.bind(this); // NEW: Store bound reference
  }

  init() {
    document.addEventListener('keydown', this.boundHandleKeyDown); // Use stored reference
    console.log('[Keyboard] Navigation enabled (↑↓ arrows, Home, End, Tab)');
  }

  destroy() {
    document.removeEventListener('keydown', this.boundHandleKeyDown); // Use same reference
    console.log('[Keyboard] Navigation destroyed');
  }
}
```

**Verification**:
1. Open DevTools → Memory tab
2. Take heap snapshot
3. Navigate between sections multiple times
4. Take another heap snapshot
5. Compare - should not see growing event listener count

**Success Criteria**: Event listeners properly removed on destroy()

---

### Task 1.2: Fix Window Load Event Listener Leak (20 min)

**File**: `src/App.jsx`
**Issue**: Load event listener added but never removed
**Priority**: CRITICAL

**Changes**:
```javascript
useEffect(() => {
  // Initialize utilities
  smoothScrollController.init();
  sessionTracker.init();
  analyticsTracker.init();
  keyboardNavController.init();

  // Track performance after load - FIXED VERSION
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

  // Cleanup - FIXED VERSION
  return () => {
    smoothScrollController.destroy();
    keyboardNavController.destroy();
    window.removeEventListener('section-change', handleSectionChange);
    window.removeEventListener('load', handleLoad); // NEW: Remove load listener
  };
}, []);
```

**Verification**:
1. Use React DevTools → Components
2. Unmount/remount App component
3. Check DevTools → Event Listeners
4. Verify no duplicate 'load' listeners

**Success Criteria**: All event listeners cleaned up on unmount

---

### Task 1.3: Fix Analytics State Inversion Bug (15 min)

**File**: `src/components/shared/ExpandableItem.jsx`
**Issue**: Uses old state value for analytics, causing backwards data
**Priority**: CRITICAL

**Changes**:
```javascript
// BEFORE (line 44-53):
const handleClick = (e) => {
  e.preventDefault();
  setIsExpanded(!isExpanded);

  // Track expansion
  if (id) {
    const eventName = isExpanded ? 'item_collapsed' : 'item_expanded';  // BUG: uses OLD state
    analyticsTracker.trackEvent?.(eventName, { item_id: id });
  }
};

// AFTER:
const handleClick = (e) => {
  e.preventDefault();
  const newExpandedState = !isExpanded; // NEW: Calculate first
  setIsExpanded(newExpandedState);

  // Track expansion with correct state
  if (id) {
    const eventName = newExpandedState ? 'item_expanded' : 'item_collapsed'; // Use new state
    analyticsTracker.trackEvent?.(eventName, { item_id: id });
  }
};
```

**Verification**:
1. Open DevTools → Console
2. Click to expand an item - should log "item_expanded"
3. Click to collapse - should log "item_collapsed"
4. Check localStorage → verify analytics events are correct

**Success Criteria**: Analytics events match actual expand/collapse state

---

### Task 1.4: Fix Parallax Calculation Bug (30 min)

**File**: `src/components/sections/ParallaxBackground.jsx`
**Issue**: Double-counts scrollY in viewport calculations
**Priority**: HIGH

**Changes**:
```javascript
// BEFORE (lines 32-60):
if (enableContentParallax && !isMobile) {
  const section = scene.closest('section');
  if (section) {
    const contentElements = section.querySelectorAll('[data-parallax]');

    contentElements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      const elementTop = rect.top + scrollY;  // WRONG: double-counts scrollY
      const elementHeight = rect.height;
      const viewportHeight = window.innerHeight;

      if (elementTop < scrollY + viewportHeight + 100 && elementTop + elementHeight > scrollY - 100) {
        const speed = parseFloat(element.dataset.parallax) || 0.1;
        const elementCenter = elementTop + elementHeight / 2;
        const viewportCenter = scrollY + viewportHeight / 2;
        const distanceFromCenter = elementCenter - viewportCenter;
        const yPos = distanceFromCenter * speed;
        element.style.transform = `translate3d(0, ${yPos}px, 0)`;
        element.style.willChange = 'transform';
      }
    });
  }
}

// AFTER:
if (enableContentParallax && !isMobile) {
  const section = scene.closest('section');
  if (section) {
    const contentElements = section.querySelectorAll('[data-parallax]');
    const viewportHeight = window.innerHeight;
    const viewportCenter = viewportHeight / 2;

    contentElements.forEach((element) => {
      const rect = element.getBoundingClientRect();

      // Only apply parallax when element is in or near viewport
      const inViewport = rect.top < viewportHeight + 100 && rect.bottom > -100;

      if (inViewport) {
        const speed = parseFloat(element.dataset.parallax) || 0.1;

        // Calculate parallax based on viewport-relative position
        const elementCenter = rect.top + rect.height / 2;
        const distanceFromCenter = elementCenter - viewportCenter;

        // Parallax effect: elements move slower based on distance from viewport center
        const yPos = distanceFromCenter * speed;

        element.style.transform = `translate3d(0, ${yPos}px, 0)`;
        element.style.willChange = 'transform';
      }
    });
  }
}
```

**Verification**:
1. Scroll through sections slowly
2. Watch card animations - should move smoothly without jumps
3. Check no visual glitches at section boundaries
4. Test on different viewport sizes

**Success Criteria**: Smooth parallax motion without jumps or calculation errors

---

### Task 1.5: Fix Stale Mobile Check (15 min)

**File**: `src/components/sections/ParallaxBackground.jsx`
**Issue**: Mobile check happens once on mount, doesn't respond to resize
**Priority**: HIGH

**Changes**:
```javascript
// BEFORE (line 17):
const isMobile = window.innerWidth < 768;  // Checked only once

// AFTER - Move check inside scroll handler:
const handleScroll = () => {
  const scrollY = window.scrollY;
  const isMobile = window.innerWidth < 768;  // NEW: Re-check on each scroll

  // Handle background layers
  const layers = scene.querySelectorAll('.parallax-layer');
  // ... rest of code
};
```

**Verification**:
1. Open site on desktop (>768px)
2. Resize to mobile (<768px)
3. Parallax should disable automatically
4. Resize back to desktop
5. Parallax should re-enable

**Success Criteria**: Parallax responds to window resize events

---

### Task 1.6: Fix Particle System Dependency (10 min)

**File**: `src/components/effects/ParticleSystem.jsx`
**Issue**: Missing `count` in dependency array
**Priority**: MEDIUM

**Changes**:
```javascript
// BEFORE (line 49):
}, []); // Fixed: removed count from dependencies

// AFTER:
}, [count]); // Add count back since JSX depends on it
```

**Verification**:
1. Pass different `count` prop to ParticleSystem
2. Verify animations restart with correct particle count
3. Check no orphaned animations

**Success Criteria**: Particle animations update when count prop changes

---

## Phase 2: Error Handling Infrastructure (Day 2 - 3 hours)

**Goal**: Add proper error boundaries and centralized error logging
**Risk**: MEDIUM - Improves user experience significantly
**Dependencies**: None

### Task 2.1: Create Error Boundary Component (45 min)

**File**: `src/components/ErrorBoundary.jsx` (NEW)
**Priority**: CRITICAL

**Create new file**:
```javascript
import React from 'react';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });

    // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-fallback">
          <div className="error-content">
            <h1>Something went wrong</h1>
            <p>We apologize for the inconvenience. Please try refreshing the page.</p>
            <button onClick={this.handleReset} className="error-reset-button">
              Refresh Page
            </button>

            {import.meta.env.DEV && this.state.error && (
              <details className="error-details">
                <summary>Error Details (Development Only)</summary>
                <pre>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

**Create**: `src/components/ErrorBoundary.css`
```css
.error-boundary-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.error-content {
  max-width: 600px;
  background: rgba(255, 255, 255, 0.95);
  padding: 3rem;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.error-content h1 {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #1a202c;
}

.error-content p {
  font-size: 1.1rem;
  margin-bottom: 2rem;
  color: #4a5568;
}

.error-reset-button {
  padding: 0.75rem 2rem;
  font-size: 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.error-reset-button:hover {
  background: #5568d3;
}

.error-details {
  margin-top: 2rem;
  text-align: left;
}

.error-details summary {
  cursor: pointer;
  font-weight: 600;
  color: #667eea;
  margin-bottom: 1rem;
}

.error-details pre {
  background: #f7fafc;
  padding: 1rem;
  border-radius: 6px;
  overflow: auto;
  font-size: 0.875rem;
  color: #2d3748;
}
```

**Verification**:
1. Temporarily throw error in component
2. Verify error boundary catches it
3. Check error UI displays correctly
4. Verify refresh button works

**Success Criteria**: Error boundary catches and displays errors gracefully

---

### Task 2.2: Wrap App with Error Boundary (10 min)

**File**: `src/main.jsx`
**Priority**: CRITICAL

**Changes**:
```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx'; // NEW
import './styles/theme.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
```

**Verification**:
1. App loads normally
2. Error boundary only activates on errors
3. No impact on normal operation

**Success Criteria**: Error boundary wraps entire app

---

### Task 2.3: Create Centralized Error Logger (30 min)

**File**: `src/utils/errorLogger.js` (NEW)
**Priority**: HIGH

**Create new file**:
```javascript
/**
 * Centralized Error Logging Utility
 *
 * In production, replace console.error with your error tracking service
 * (Sentry, LogRocket, etc.)
 */

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
```

**Verification**:
1. Import and use in any component
2. Verify errors logged with context
3. Check deduplication works
4. Test in dev vs prod mode

**Success Criteria**: Centralized logging ready for use

---

### Task 2.4: Create Reusable Loading/Error State Components (30 min)

**File**: `src/components/ui/LoadingState.jsx` (NEW)
**Priority**: MEDIUM

**Create new file**:
```javascript
import './LoadingState.css';

export function LoadingState({ message = "Loading..." }) {
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <div className="loading-spinner" aria-hidden="true">
        <div className="spinner-circle"></div>
      </div>
      <p className="loading-message">{message}</p>
    </div>
  );
}
```

**File**: `src/components/ui/ErrorState.jsx` (NEW)

**Create new file**:
```javascript
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
```

**Create**: `src/components/ui/LoadingState.css`
```css
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  min-height: 200px;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  margin-bottom: 1rem;
}

.spinner-circle {
  width: 100%;
  height: 100%;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top-color: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-message {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
}
```

**Create**: `src/components/ui/ErrorState.css`
```css
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  min-height: 200px;
  text-align: center;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.8;
}

.error-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: rgba(255, 255, 255, 0.95);
}

.error-message {
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
  color: rgba(255, 255, 255, 0.7);
  max-width: 400px;
}

.error-retry-button {
  padding: 0.625rem 1.5rem;
  font-size: 0.95rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.error-retry-button:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.error-details-dev {
  margin-top: 1.5rem;
  text-align: left;
  max-width: 500px;
  width: 100%;
}

.error-details-dev summary {
  cursor: pointer;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 0.5rem;
}

.error-details-dev pre {
  background: rgba(0, 0, 0, 0.3);
  padding: 1rem;
  border-radius: 4px;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
  overflow: auto;
  max-height: 200px;
}
```

**Verification**:
1. Import and render LoadingState
2. Import and render ErrorState
3. Test styling matches design
4. Verify retry button works

**Success Criteria**: Reusable state components ready

---

## Phase 3: Fix Silent Failures (Day 3 - 4 hours)

**Goal**: Add error states and recovery UI to all data loading operations
**Risk**: LOW - Pure improvements, no breaking changes
**Dependencies**: Phase 2 (needs ErrorState component)

### Task 3.1: Fix Section Data Loading Errors (45 min)

**File**: `src/hooks/useSectionData.js`
**Priority**: HIGH

**Changes**:
```javascript
import { useEffect, useState } from 'react';
import { logError } from '../utils/errorLogger.js';

export function useSectionData(sectionType) {
  const [sectionData, setSectionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    import('@content/sections.json')
      .then((module) => {
        const section = module.default.sections.find(
          (s) => s.sectionType === sectionType
        );

        if (!section) {
          throw new Error(`Section "${sectionType}" not found in sections.json`);
        }

        setSectionData(section);
        setLoading(false);
      })
      .catch((err) => {
        // Log with context for debugging
        logError('SECTION_DATA_LOAD_FAILED', {
          sectionType,
          error: err.message,
          stack: err.stack
        });

        // Set user-friendly error
        setError({
          message: 'Unable to load this section',
          canRetry: true
        });
        setLoading(false);
      });
  }, [sectionType]);

  return { sectionData, loading, error };
}
```

**Verification**:
1. Test normal loading
2. Simulate error (invalid section type)
3. Verify error logged with context
4. Check error state returned

**Success Criteria**: Error state properly tracked and logged

---

### Task 3.2: Update Section Components with Error States (60 min)

**Files**:
- `src/components/sections/ProvenExcellence.jsx`
- `src/components/sections/StrategicVision.jsx`
- `src/components/sections/ImmediateValue.jsx`

**Priority**: HIGH

**Example for ProvenExcellence.jsx**:
```javascript
import { useEffect, useState } from 'react';
import ParallaxBackground from './ParallaxBackground.jsx';
import LayeredBackground from '../effects/LayeredBackground.jsx';
import GlowOrb from '../effects/GlowOrb.jsx';
import WorkCard from '../work-items/WorkCard.jsx';
import { useSectionData } from '../../hooks/useSectionData.js';
import { LoadingState } from '../ui/LoadingState.jsx'; // NEW
import { ErrorState } from '../ui/ErrorState.jsx'; // NEW
import { logError } from '../../utils/errorLogger.js'; // NEW
import './Section.css';

function ProvenExcellence() {
  const { sectionData, loading: sectionLoading, error: sectionError } = useSectionData('proven-excellence');
  const [workItems, setWorkItems] = useState([]);
  const [workItemsLoading, setWorkItemsLoading] = useState(true); // NEW
  const [workItemsError, setWorkItemsError] = useState(null); // NEW

  useEffect(() => {
    import('@content/work.json')
      .then((module) => {
        const items = module.default.workItems || [];
        if (items.length === 0) {
          logWarning('WORK_ITEMS_EMPTY', { section: 'proven-excellence' });
        }
        setWorkItems(items);
        setWorkItemsLoading(false); // NEW
      })
      .catch((err) => {
        logError('WORK_ITEMS_LOAD_FAILED', {
          section: 'proven-excellence',
          error: err.message,
          stack: err.stack
        });
        setWorkItemsError('Unable to load portfolio items'); // NEW
        setWorkItemsLoading(false); // NEW
      });
  }, []);

  // Retry function
  const handleRetry = () => {
    window.location.reload();
  };

  // Show loading state
  if (sectionLoading || workItemsLoading) {
    return (
      <section className="section scroll-snap-section section-proven-excellence" data-section="proven-excellence">
        <ParallaxBackground intensity={0.6} />
        <LoadingState message="Loading portfolio..." />
      </section>
    );
  }

  // Show error state
  if (sectionError) {
    return (
      <section className="section scroll-snap-section section-proven-excellence" data-section="proven-excellence">
        <ParallaxBackground intensity={0.6} />
        <ErrorState
          error={sectionError.message}
          section="Proven Excellence"
          onRetry={handleRetry}
        />
      </section>
    );
  }

  return (
    <section
      className="section scroll-snap-section section-proven-excellence"
      data-section="proven-excellence"
    >
      <ParallaxBackground intensity={0.6} />
      <LayeredBackground />
      <GlowOrb size={600} color="rgba(255,255,255,0.02)" duration={30} />

      <div className="parallax-scene">
        <div className="section-padding content-left">
          <div className="section-header anim-fade-in-up" data-parallax="0.08">
            <h1 className="section-heading text-shadow-medium">{sectionData.heading}</h1>
            {sectionData.subheading && (
              <p className="section-subheading">{sectionData.subheading}</p>
            )}
          </div>

          <div className="section-intro space-organic-md" data-parallax="0.1">
            <p>{sectionData.introductoryContent}</p>
          </div>

          {/* Show work items error if load failed */}
          {workItemsError ? (
            <ErrorState
              error={workItemsError}
              section="work items"
              onRetry={handleRetry}
            />
          ) : (
            <div className="work-items-grid">
              {workItems.map((item, index) => (
                <div key={item.id} data-parallax={0.12 + (index % 3) * 0.02}>
                  <WorkCard workItem={item} index={index} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default ProvenExcellence;
```

**Apply similar changes to**:
- StrategicVision.jsx (for insights.json)
- ImmediateValue.jsx (for products.json)

**Verification**:
1. Test normal data loading
2. Simulate network error (rename JSON file)
3. Verify error UI displays
4. Test retry button works
5. Check errors logged properly

**Success Criteria**: All sections have proper error states and recovery

---

### Task 3.3: Add Try-Catch to Utility Initializations (30 min)

**File**: `src/App.jsx`
**Priority**: MEDIUM

**Changes**:
```javascript
import { logError } from './utils/errorLogger.js'; // NEW

useEffect(() => {
  const failedUtilities = []; // NEW

  // Initialize utilities with error handling
  try {
    smoothScrollController.init();
  } catch (error) {
    logError('SMOOTH_SCROLL_INIT_FAILED', { error: error.message });
    failedUtilities.push('smooth-scroll');
  }

  try {
    sessionTracker.init();
  } catch (error) {
    logError('SESSION_TRACKER_INIT_FAILED', { error: error.message });
    failedUtilities.push('session-tracking');
  }

  try {
    analyticsTracker.init();
  } catch (error) {
    logError('ANALYTICS_INIT_FAILED', { error: error.message });
    failedUtilities.push('analytics');
  }

  try {
    keyboardNavController.init();
  } catch (error) {
    logError('KEYBOARD_NAV_INIT_FAILED', { error: error.message });
    failedUtilities.push('keyboard-nav');
  }

  if (failedUtilities.length > 0) {
    console.warn('[App] Some utilities failed to initialize:', failedUtilities);
  }

  // Track performance after load
  const handleLoad = () => {
    setTimeout(() => {
      try {
        analyticsTracker.trackPerformance();
      } catch (error) {
        logError('PERFORMANCE_TRACKING_FAILED', { error: error.message });
      }
    }, 100);
  };

  window.addEventListener('load', handleLoad);

  // ... rest of code
}, []);
```

**Verification**:
1. All utilities initialize successfully
2. Simulate error (modify utility to throw)
3. Verify error caught and logged
4. App continues working with failed utility

**Success Criteria**: Utility failures don't crash app

---

## Phase 4: Code Simplification (Week 2, Days 1-3 - 8 hours)

**Goal**: Reduce code duplication by 40% through systematic refactoring
**Risk**: LOW - Well-tested refactoring with no behavior changes
**Dependencies**: Phases 1-3 complete

### Task 4.1: Create Design Constants File (30 min)

**File**: `src/constants/design.js` (NEW)
**Priority**: HIGH

**Create new file**:
```javascript
/**
 * Design System Constants
 * Central source of truth for all magic numbers in the codebase
 */

// Parallax configuration
export const PARALLAX = {
  INTENSITY: {
    LOW: 0.4,
    MEDIUM: 0.5,
    HIGH: 0.6,
  },
  CONTENT: {
    HEADER: 0.08,
    INTRO: 0.1,
    ITEMS_BASE: 0.12,
    ITEMS_VARIANCE: 0.02,
  },
};

// Animation timing
export const ANIMATION = {
  DURATION: {
    FAST: 0.3,
    NORMAL: 0.4,
    SLOW: 0.6,
  },
  EASING: {
    STANDARD: [0.42, 0, 0.58, 1],
    EASE_IN: [0.32, 0, 0.67, 0],
    EASE_OUT: [0.33, 1, 0.68, 1],
  },
  DELAY: {
    STEP: 0.1,
    STAGGER_PARTICLES: 0.15,
  },
};

// Glow orb configurations
export const GLOW_ORBS = {
  SMALL: {
    size: 400,
    duration: 30,
    opacity: 'rgba(255,255,255,0.015)',
  },
  MEDIUM: {
    size: 600,
    duration: 35,
    opacity: 'rgba(255,255,255,0.02)',
  },
  LARGE: {
    size: 800,
    duration: 40,
    opacity: 'rgba(255,255,255,0.025)',
  },
};

// Smooth scroll configuration
export const SMOOTH_SCROLL = {
  DURATION: 1.2,
  EASING: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  TOUCH_MULTIPLIER: 2,
};

// Responsive breakpoints
export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1280,
};

// Session tracking
export const SESSION = {
  EXPIRY_DAYS: 30,
  STORAGE_KEY: 'pitch-site-session',
};

// Analytics
export const ANALYTICS = {
  MAX_EVENTS: 100,
  STORAGE_KEY: 'pitch-site-analytics',
};
```

**Verification**:
1. Import in any component
2. Use constants instead of magic numbers
3. Verify values work correctly
4. Update documentation

**Success Criteria**: All magic numbers centralized

---

### Task 4.2: Create BaseSection Component (120 min)

**File**: `src/components/sections/BaseSection.jsx` (NEW)
**Priority**: HIGH

**Create new file**:
```javascript
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import ParallaxBackground from './ParallaxBackground.jsx';
import LayeredBackground from '../effects/LayeredBackground.jsx';
import GlowOrb from '../effects/GlowOrb.jsx';
import { LoadingState } from '../ui/LoadingState.jsx';
import { ErrorState } from '../ui/ErrorState.jsx';
import { useSectionData } from '../../hooks/useSectionData.js';
import { logError, logWarning } from '../../utils/errorLogger.js';
import { PARALLAX, GLOW_ORBS } from '../../constants/design.js';
import './Section.css';

/**
 * BaseSection - Unified section component
 * Eliminates 70% code duplication across section components
 *
 * @param {string} sectionId - Section identifier (e.g., 'proven-excellence')
 * @param {Function} contentLoader - Async function to load additional content
 * @param {Function} renderContent - Function to render main content (sectionData, additionalData) => JSX
 * @param {Object} backgroundEffects - Customizable background effects
 * @param {string} className - Additional CSS classes
 * @param {string} contentAlign - Content alignment ('content-left', 'content-center', 'content-right')
 */
function BaseSection({
  sectionId,
  contentLoader,
  renderContent,
  backgroundEffects = {},
  className = '',
  contentAlign = 'content-left',
  loadingMessage = 'Loading...',
}) {
  const { sectionData, loading: sectionLoading, error: sectionError } = useSectionData(sectionId);
  const [additionalData, setAdditionalData] = useState(null);
  const [contentLoading, setContentLoading] = useState(!!contentLoader);
  const [contentError, setContentError] = useState(null);

  useEffect(() => {
    if (contentLoader) {
      contentLoader()
        .then((data) => {
          if (Array.isArray(data) && data.length === 0) {
            logWarning('CONTENT_EMPTY', { section: sectionId });
          }
          setAdditionalData(data);
          setContentLoading(false);
        })
        .catch((err) => {
          logError('CONTENT_LOAD_FAILED', {
            section: sectionId,
            error: err.message,
            stack: err.stack,
          });
          setContentError(`Unable to load ${sectionId} content`);
          setContentLoading(false);
        });
    }
  }, [contentLoader, sectionId]);

  const handleRetry = () => {
    window.location.reload();
  };

  // Show loading state
  if (sectionLoading || contentLoading) {
    return (
      <section
        className={`section scroll-snap-section section-${sectionId} ${className}`}
        data-section={sectionId}
      >
        <ParallaxBackground intensity={backgroundEffects.parallaxIntensity || PARALLAX.INTENSITY.MEDIUM} />
        <LoadingState message={loadingMessage} />
      </section>
    );
  }

  // Show error state
  if (sectionError) {
    return (
      <section
        className={`section scroll-snap-section section-${sectionId} ${className}`}
        data-section={sectionId}
      >
        <ParallaxBackground intensity={backgroundEffects.parallaxIntensity || PARALLAX.INTENSITY.MEDIUM} />
        <ErrorState
          error={sectionError.message}
          section={sectionId.replace('-', ' ')}
          onRetry={handleRetry}
        />
      </section>
    );
  }

  return (
    <section
      className={`section scroll-snap-section section-${sectionId} ${className}`}
      data-section={sectionId}
    >
      {/* Background Effects */}
      <ParallaxBackground
        intensity={backgroundEffects.parallaxIntensity || PARALLAX.INTENSITY.MEDIUM}
        enableContentParallax={backgroundEffects.enableContentParallax !== false}
      />
      {backgroundEffects.showLayeredBackground !== false && <LayeredBackground />}
      {backgroundEffects.glowOrbs?.map((orb, i) => (
        <GlowOrb
          key={i}
          size={orb.size || GLOW_ORBS.MEDIUM.size}
          color={orb.color || GLOW_ORBS.MEDIUM.opacity}
          duration={orb.duration || GLOW_ORBS.MEDIUM.duration}
        />
      ))}

      <div className="parallax-scene">
        <div className={`section-padding ${contentAlign}`}>
          {/* Section Header */}
          <div className="section-header anim-fade-in-up" data-parallax={PARALLAX.CONTENT.HEADER}>
            <h1 className="section-heading text-shadow-medium">{sectionData.heading}</h1>
            {sectionData.subheading && (
              <p className="section-subheading">{sectionData.subheading}</p>
            )}
          </div>

          {/* Introductory Content */}
          {sectionData.introductoryContent && (
            <div className="section-intro space-organic-md" data-parallax={PARALLAX.CONTENT.INTRO}>
              <p>{sectionData.introductoryContent}</p>
            </div>
          )}

          {/* Main Content */}
          {contentError ? (
            <ErrorState
              error={contentError}
              section={`${sectionId} items`}
              onRetry={handleRetry}
            />
          ) : (
            renderContent(sectionData, additionalData)
          )}
        </div>
      </div>
    </section>
  );
}

BaseSection.propTypes = {
  sectionId: PropTypes.string.isRequired,
  contentLoader: PropTypes.func,
  renderContent: PropTypes.func.isRequired,
  backgroundEffects: PropTypes.shape({
    parallaxIntensity: PropTypes.number,
    enableContentParallax: PropTypes.bool,
    showLayeredBackground: PropTypes.bool,
    glowOrbs: PropTypes.arrayOf(
      PropTypes.shape({
        size: PropTypes.number,
        color: PropTypes.string,
        duration: PropTypes.number,
      })
    ),
  }),
  className: PropTypes.string,
  contentAlign: PropTypes.oneOf(['content-left', 'content-center', 'content-right']),
  loadingMessage: PropTypes.string,
};

export default BaseSection;
```

**Verification**:
1. Component compiles without errors
2. Props validated with PropTypes
3. Test with sample data
4. Verify all background effects work

**Success Criteria**: BaseSection component ready for use

---

### Task 4.3: Refactor ProvenExcellence to Use BaseSection (30 min)

**File**: `src/components/sections/ProvenExcellence.jsx`
**Priority**: HIGH

**Changes**:
```javascript
import BaseSection from './BaseSection.jsx';
import WorkCard from '../work-items/WorkCard.jsx';
import { PARALLAX } from '../../constants/design.js';

function ProvenExcellence() {
  return (
    <BaseSection
      sectionId="proven-excellence"
      loadingMessage="Loading portfolio..."
      contentLoader={async () => {
        const module = await import('@content/work.json');
        return module.default.workItems || [];
      }}
      renderContent={(sectionData, workItems) => (
        <div className="work-items-grid">
          {workItems?.map((item, index) => (
            <div key={item.id} data-parallax={PARALLAX.CONTENT.ITEMS_BASE + (index % 3) * PARALLAX.CONTENT.ITEMS_VARIANCE}>
              <WorkCard workItem={item} index={index} />
            </div>
          ))}
        </div>
      )}
      backgroundEffects={{
        parallaxIntensity: 0.6,
        glowOrbs: [{ size: 600, color: 'rgba(255,255,255,0.02)', duration: 30 }],
      }}
    />
  );
}

export default ProvenExcellence;
```

**Verification**:
1. Section renders identically to before
2. Work items load correctly
3. Background effects work
4. Error states work
5. No visual regressions

**Success Criteria**: ProvenExcellence fully migrated

---

### Task 4.4: Refactor StrategicVision to Use BaseSection (30 min)

**File**: `src/components/sections/StrategicVision.jsx`
**Priority**: HIGH

**Apply similar refactoring as ProvenExcellence**

---

### Task 4.5: Refactor ImmediateValue to Use BaseSection (30 min)

**File**: `src/components/sections/ImmediateValue.jsx`
**Priority**: HIGH

**Apply similar refactoring as ProvenExcellence**

---

### Task 4.6: Simplify Markdown Parser (60 min)

**File**: `src/utils/markdownParser.js`
**Priority**: MEDIUM

**Changes**: Unify parsing functions into generic versions (see detailed code in earlier report)

---

### Task 4.7: Create Unified ContentCard Component (60 min)

**File**: `src/components/shared/ContentCard.jsx` (NEW)
**Priority**: MEDIUM

**Create new file** that wraps ExpandableItem with type-specific configuration (see detailed code in earlier report)

---

### Task 4.8: Update Constants Usage Throughout Codebase (45 min)

**Files**: Multiple
**Priority**: LOW

**Task**: Replace all magic numbers with imported constants:
- Parallax intensities
- Animation durations
- Glow orb configurations
- Breakpoint checks

**Verification**:
1. Search for magic numbers: `0.08`, `0.1`, `0.12`, `600`, `768`, etc.
2. Replace with constants
3. Test all animations still work
4. No visual regressions

**Success Criteria**: All magic numbers replaced

---

## Phase 5: Final Quality Pass (Week 2, Day 4 - 2 hours)

**Goal**: Verify all changes, run tests, ensure no regressions
**Risk**: LOW - Final validation
**Dependencies**: All previous phases complete

### Task 5.1: Run Full Test Suite (30 min)

**Commands**:
```bash
# Run linting
npm run lint

# Run build
npm run build

# Check bundle size
npm run build -- --debug

# Visual inspection
npm run dev
```

**Verification**:
1. No linting errors
2. Build succeeds
3. Bundle size acceptable
4. Manual testing of all features

**Success Criteria**: All tests pass

---

### Task 5.2: Browser Testing (30 min)

**Test Matrix**:
- Chrome (desktop)
- Firefox (desktop)
- Safari (desktop)
- Chrome (mobile)
- Safari (mobile)

**Test Cases**:
1. All sections load correctly
2. Animations work smoothly
3. Error states display properly
4. Keyboard navigation works
5. No console errors
6. No memory leaks

**Success Criteria**: Works across all browsers

---

### Task 5.3: Performance Testing (30 min)

**Tools**: Chrome DevTools Performance panel

**Tests**:
1. Record page load
2. Check FPS during scroll
3. Memory profiler for leaks
4. Network throttling test

**Success Criteria**:
- 60 FPS scrolling
- No memory leaks
- Fast load time (<3s)

---

### Task 5.4: Accessibility Audit (30 min)

**Tools**:
- Lighthouse
- axe DevTools
- Manual keyboard testing

**Tests**:
1. Run Lighthouse accessibility audit
2. Test keyboard navigation
3. Test screen reader (VoiceOver/NVDA)
4. Check color contrast
5. Verify ARIA labels

**Success Criteria**:
- Lighthouse score >95
- Full keyboard accessibility
- No axe violations

---

## Summary & Metrics

### Estimated Time Breakdown
- **Phase 1** (Critical Fixes): 2 hours
- **Phase 2** (Error Infrastructure): 3 hours
- **Phase 3** (Silent Failures): 4 hours
- **Phase 4** (Simplification): 8 hours
- **Phase 5** (Quality Pass): 2 hours
- **Total**: 19 hours

### Expected Outcomes
- ✅ 4 critical memory leaks fixed
- ✅ 15 silent failures now have user feedback
- ✅ Error boundary protects entire app
- ✅ Centralized error logging
- ✅ ~40% code reduction (from ~1200 to ~720 lines)
- ✅ All magic numbers centralized
- ✅ Consistent error handling patterns
- ✅ Production-ready error recovery

### Code Reduction Stats
| Component/File | Before | After | Reduction |
|---------------|--------|-------|-----------|
| ProvenExcellence.jsx | 66 lines | 28 lines | 58% |
| StrategicVision.jsx | 65 lines | 27 lines | 58% |
| ImmediateValue.jsx | 64 lines | 26 lines | 59% |
| markdownParser.js | 192 lines | 120 lines | 37% |
| **Total** | ~1200 lines | ~720 lines | **40%** |

### Risk Mitigation
- Each phase independently testable
- No breaking changes to public APIs
- Incremental refactoring with verification
- Can rollback individual tasks if issues arise

---

## Next Steps

After completing this plan:

1. **Add PropTypes or TypeScript** for better type safety
2. **Integrate error tracking service** (Sentry, LogRocket)
3. **Add automated tests** (Jest, React Testing Library)
4. **Performance monitoring** (Web Vitals)
5. **Accessibility testing** in CI/CD pipeline

---

**Ready to start implementation?**

I recommend beginning with Phase 1 (Critical Fixes) immediately, as these are production bugs. Each task is independent and can be done incrementally with immediate testing.
