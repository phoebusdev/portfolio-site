import Lenis from 'lenis';

class SmoothScrollController {
  constructor() {
    this.lenis = null;
    this.rafId = null;
    this.observers = [];
    this.currentSection = null;
  }

  init() {
    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      console.log('[SmoothScroll] Reduced motion preferred - skipping smooth scroll');
      return;
    }

    // Initialize Lenis with custom settings
    this.lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Custom easing
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      smoothTouch: false, // Keep native inertia on mobile
      touchMultiplier: 2,
    });

    // Start animation loop
    this.startRAF();

    // Setup section tracking
    this.setupIntersectionObserver();

    console.log('[SmoothScroll] Initialized');
  }

  startRAF() {
    const raf = (time) => {
      this.lenis?.raf(time);
      this.rafId = requestAnimationFrame(raf);
    };

    this.rafId = requestAnimationFrame(raf);
  }

  stopRAF() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  setupIntersectionObserver() {
    // Track which section is currently in view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.getAttribute('data-section');
            if (sectionId !== this.currentSection) {
              this.currentSection = sectionId;
              this.emitSectionChange(sectionId);
            }
          }
        });
      },
      {
        rootMargin: '-50% 0px -50% 0px', // Trigger when section is centered
        threshold: 0,
      }
    );

    // Observe all sections
    const sections = document.querySelectorAll('[data-section]');
    sections.forEach((section) => observer.observe(section));

    this.observers.push(observer);
  }

  emitSectionChange(sectionId) {
    // Dispatch custom event for section change
    window.dispatchEvent(
      new CustomEvent('section-change', {
        detail: { sectionId },
      })
    );

    // Update URL hash without scrolling
    if (window.history.replaceState) {
      window.history.replaceState(null, null, `#${sectionId}`);
    }

    console.log(`[SmoothScroll] Section changed: ${sectionId}`);
  }

  scrollTo(target, options = {}) {
    if (!this.lenis) {
      // Fallback to native scroll if Lenis not initialized
      const element = typeof target === 'string' ? document.querySelector(target) : target;
      element?.scrollIntoView({ behavior: 'smooth', ...options });
      return;
    }

    this.lenis.scrollTo(target, {
      offset: options.offset || 0,
      duration: options.duration || 1.2,
      easing: options.easing,
      onComplete: options.onComplete,
    });
  }

  getCurrentSection() {
    return this.currentSection;
  }

  getScrollProgress() {
    if (!this.lenis) return 0;
    return this.lenis.progress || 0;
  }

  destroy() {
    this.stopRAF();
    this.lenis?.destroy();
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
    console.log('[SmoothScroll] Destroyed');
  }
}

// Singleton instance
const smoothScrollController = new SmoothScrollController();

export default smoothScrollController;
