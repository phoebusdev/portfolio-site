// Session tracking utility - localStorage based
// No PII, respects Do Not Track

const SESSION_KEY = 'pitch-site-session';
const SESSION_EXPIRY_DAYS = 30;

class SessionTracker {
  constructor() {
    this.session = null;
    this.enabled = true;
  }

  init() {
    // Check Do Not Track
    if (navigator.doNotTrack === '1' || window.doNotTrack === '1') {
      console.log('[Session] Do Not Track enabled - tracking disabled');
      this.enabled = false;
      return;
    }

    // Check URL parameter to disable
    const params = new URLSearchParams(window.location.search);
    if (params.get('analytics') === 'off') {
      console.log('[Session] Analytics disabled via URL parameter');
      this.enabled = false;
      return;
    }

    // Load existing session or create new
    this.session = this.loadSession() || this.createSession();
    this.updateSession();

    console.log('[Session] Initialized', this.session.sessionId);
  }

  createSession() {
    return {
      sessionId: this.generateUUID(),
      startTime: Date.now(),
      currentSection: null,
      scrollPosition: 0,
      sectionsViewed: [],
      itemsExplored: [],
      timePerSection: {},
      interactionHistory: [],
      lastActivity: Date.now(),
    };
  }

  loadSession() {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (!stored) return null;

      const session = JSON.parse(stored);

      // Check if session expired (30 days)
      const daysSinceLastActivity = (Date.now() - session.lastActivity) / (1000 * 60 * 60 * 24);
      if (daysSinceLastActivity > SESSION_EXPIRY_DAYS) {
        console.log('[Session] Expired, creating new');
        return null;
      }

      return session;
    } catch (error) {
      console.error('[Session] Failed to load:', error);
      return null;
    }
  }

  saveSession() {
    if (!this.enabled || !this.session) return;

    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(this.session));
    } catch (error) {
      console.error('[Session] Failed to save:', error);
    }
  }

  updateSession() {
    if (!this.enabled || !this.session) return;

    this.session.lastActivity = Date.now();
    this.session.scrollPosition = window.scrollY;
    this.saveSession();
  }

  trackSectionView(sectionId) {
    if (!this.enabled || !this.session) return;

    this.session.currentSection = sectionId;

    if (!this.session.sectionsViewed.includes(sectionId)) {
      this.session.sectionsViewed.push(sectionId);
    }

    // Initialize section time tracking
    if (!this.session.timePerSection[sectionId]) {
      this.session.timePerSection[sectionId] = {
        firstView: Date.now(),
        totalSeconds: 0,
        lastEnter: Date.now(),
      };
    } else {
      this.session.timePerSection[sectionId].lastEnter = Date.now();
    }

    this.saveSession();
  }

  trackSectionExit(sectionId) {
    if (!this.enabled || !this.session) return;

    const sectionTime = this.session.timePerSection[sectionId];
    if (sectionTime && sectionTime.lastEnter) {
      const timeSpent = (Date.now() - sectionTime.lastEnter) / 1000;
      sectionTime.totalSeconds += timeSpent;
    }

    this.saveSession();
  }

  trackItemExplored(type, id) {
    if (!this.enabled || !this.session) return;

    this.session.itemsExplored.push({
      type, // 'work' | 'insight' | 'product'
      id,
      timestamp: Date.now(),
    });

    this.saveSession();
  }

  trackInteraction(type, target, metadata = {}) {
    if (!this.enabled || !this.session) return;

    this.session.interactionHistory.push({
      type, // 'click' | 'hover' | 'scroll' | 'keypress'
      target,
      timestamp: Date.now(),
      metadata,
    });

    // Keep only last 50 interactions to prevent bloat
    if (this.session.interactionHistory.length > 50) {
      this.session.interactionHistory = this.session.interactionHistory.slice(-50);
    }

    this.saveSession();
  }

  getSession() {
    return this.session;
  }

  getSessionStats() {
    if (!this.session) return null;

    const totalTime = (Date.now() - this.session.startTime) / 1000;

    return {
      sessionId: this.session.sessionId,
      totalTimeSeconds: totalTime,
      sectionsViewed: this.session.sectionsViewed.length,
      itemsExplored: this.session.itemsExplored.length,
      interactions: this.session.interactionHistory.length,
      currentSection: this.session.currentSection,
    };
  }

  clearSession() {
    try {
      localStorage.removeItem(SESSION_KEY);
      this.session = null;
      console.log('[Session] Cleared');
    } catch (error) {
      console.error('[Session] Failed to clear:', error);
    }
  }

  generateUUID() {
    // Simple UUID v4 generator
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}

// Singleton instance
const sessionTracker = new SessionTracker();

export default sessionTracker;
