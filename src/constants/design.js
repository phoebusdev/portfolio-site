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
    DRAMATIC: 0.8,
  },
  CONTENT: {
    NAME: 0.06,
    HEADER: 0.08,
    INTRO: 0.1,
    ITEMS_BASE: 0.12,
    ITEMS_VARIANCE: 0.02,
    ITEMS_VARIANCE_STRATEGIC: 0.03,
    ANNOTATION: 0.1,
    CONTACT: 0.06,
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
    color: 'rgba(0,0,0,0.03)',
  },
  MEDIUM: {
    size: 600,
    duration: 35,
    color: 'rgba(255,255,255,0.02)',
  },
  LARGE: {
    size: 700,
    duration: 38,
    color: 'rgba(255,255,255,0.02)',
  },
  EXTRA_LARGE: {
    size: 800,
    duration: 40,
    color: 'rgba(168, 85, 247, 0.04)',
  },
  MUTED: {
    size: 700,
    duration: 40,
    color: 'rgba(255,255,255,0.015)',
  },
  BLUE: {
    size: 600,
    duration: 40,
    color: 'rgba(59, 130, 246, 0.03)',
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

// Noise overlay
export const NOISE = {
  DEFAULT_OPACITY: 0.03,
};

// Particle system
export const PARTICLES = {
  DEFAULT_COUNT: 15,
};
