// Analytics event tracker - Privacy-focused, no external services for MVP

import sessionTracker from './session.js';

class AnalyticsTracker {
  constructor() {
    this.enabled = true;
    this.events = [];
  }

  init() {
    // Check if analytics should be disabled
    if (navigator.doNotTrack === '1' || window.doNotTrack === '1') {
      console.log('[Analytics] Do Not Track enabled - analytics disabled');
      this.enabled = false;
      return;
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get('analytics') === 'off') {
      console.log('[Analytics] Disabled via URL parameter');
      this.enabled = false;
      return;
    }

    // Track page view
    this.trackEvent('page_view', {
      path: window.location.pathname,
      referrer: document.referrer || 'direct',
      timestamp: Date.now(),
    });

    console.log('[Analytics] Initialized');
  }

  trackEvent(eventName, eventData = {}) {
    if (!this.enabled) return;

    const event = {
      name: eventName,
      timestamp: Date.now(),
      data: eventData,
    };

    this.events.push(event);

    // Log to console in development
    if (import.meta.env.DEV) {
      console.log(`[Analytics] ${eventName}`, eventData);
    }

    // Keep only last 100 events
    if (this.events.length > 100) {
      this.events = this.events.slice(-100);
    }
  }

  // Event tracking methods

  trackSectionView(sectionId) {
    this.trackEvent('section_viewed', {
      section_id: sectionId,
    });

    sessionTracker.trackSectionView(sectionId);
  }

  trackSectionExit(sectionId, timeSpent) {
    this.trackEvent('section_exited', {
      section_id: sectionId,
      time_spent_seconds: timeSpent,
    });

    sessionTracker.trackSectionExit(sectionId);
  }

  trackWorkItemExplored(workItemId) {
    this.trackEvent('work_item_explored', {
      work_item_id: workItemId,
    });

    sessionTracker.trackItemExplored('work', workItemId);
  }

  trackInsightExplored(insightId) {
    this.trackEvent('insight_explored', {
      insight_id: insightId,
    });

    sessionTracker.trackItemExplored('insight', insightId);
  }

  trackProductDemoLaunched(productId, demoType) {
    this.trackEvent('product_demo_launched', {
      product_id: productId,
      demo_type: demoType, // 'live' | 'video' | 'interactive'
    });

    sessionTracker.trackItemExplored('product', productId);
  }

  trackContactClick(source) {
    this.trackEvent('contact_clicked', {
      source, // 'cta' | 'product' | 'section-end'
    });
  }

  trackScrollDepth(percentage) {
    // Track scroll depth milestones
    this.trackEvent('scroll_depth', {
      percentage: Math.round(percentage),
    });
  }

  trackInteraction(type, target, metadata = {}) {
    this.trackEvent('interaction', {
      type, // 'click' | 'hover' | 'keypress'
      target,
      ...metadata,
    });

    sessionTracker.trackInteraction(type, target, metadata);
  }

  // Performance tracking

  trackPerformance() {
    if (!window.performance || !window.performance.timing) return;

    const timing = window.performance.timing;
    const loadTime = timing.loadEventEnd - timing.navigationStart;
    const domReady = timing.domContentLoadedEventEnd - timing.navigationStart;
    const firstPaint = window.performance.getEntriesByType('paint')[0]?.startTime || 0;

    this.trackEvent('performance', {
      load_time_ms: loadTime,
      dom_ready_ms: domReady,
      first_paint_ms: Math.round(firstPaint),
    });

    console.log('[Analytics] Performance tracked:', {
      loadTime: `${loadTime}ms`,
      domReady: `${domReady}ms`,
      firstPaint: `${Math.round(firstPaint)}ms`,
    });
  }

  // Export analytics for analysis

  getEvents() {
    return this.events;
  }

  exportEvents() {
    const session = sessionTracker.getSession();
    const stats = sessionTracker.getSessionStats();

    return {
      session: {
        id: session?.sessionId,
        start_time: session?.startTime,
        stats,
      },
      events: this.events,
      exported_at: Date.now(),
    };
  }

  downloadEvents() {
    const data = this.exportEvents();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    console.log('[Analytics] Events downloaded');
  }

  clearEvents() {
    this.events = [];
    console.log('[Analytics] Events cleared');
  }
}

// Singleton instance
const analyticsTracker = new AnalyticsTracker();

export default analyticsTracker;
