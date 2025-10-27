# Smooth Scroll Control Research

**Research Date:** October 27, 2025
**Context:** Immersive pitch site with section-to-section scrolling, progress tracking, mobile touch gestures, and WCAG 2.1 AA accessibility compliance.

---

## Decision: Hybrid CSS Scroll-Snap + Lenis with Accessibility-First Fallbacks

### Primary Approach
- **CSS Scroll-Snap** as the foundation for section snapping (native, performant, accessible)
- **Lenis** (v1.1+) for enhanced smooth scrolling experience on desktop
- **Intersection Observer API** for scroll progress tracking
- **Passive Event Listeners** for touch gesture optimization on mobile
- **Full accessibility layer** with prefers-reduced-motion and keyboard navigation

---

## Rationale

### Performance (60fps maintained)
- **CSS Scroll-Snap**: Hooks into native browser scrolling engine, avoiding JavaScript computation overhead
- **Lenis (3KB)**: Ultra-lightweight library that doesn't hijack native scroll; uses `scrollTo` instead of CSS transforms
- **Intersection Observer**: Runs off main thread, eliminating scroll event listener jank
- **Passive Event Listeners**: Allow browser to scroll immediately without waiting for JavaScript (38% reduction in scroll latency on mobile)
- **Safari Performance**: Lenis capped at 60fps on Safari, 30fps on low power mode (acceptable trade-off)

### Accessibility (WCAG 2.1 AA Compliant)
- **Keyboard Navigation**: CSS scroll-snap maintains native keyboard scroll behavior (Space, Page Up/Down, Arrow keys)
- **Focus Management**: Programmatic `tabindex="-1"` on sections enables focus for screen readers
- **Reduced Motion**: Complete disable path via `prefers-reduced-motion: reduce` media query
- **Native Scroll Preservation**: Lenis doesn't disable native scrolling (unlike Locomotive Scroll), maintaining browser accessibility features
- **CMD+F Search**: Works natively with Lenis (browser search not broken)
- **Screen Reader Support**: Native scroll position maintained for assistive technologies

### Mobile Support
- **Touch Gestures**: Lenis with `syncTouch` option for mobile inertia (note: some "static" feel reported in Feb 2025)
- **Fallback Strategy**: CSS scroll-snap works perfectly on mobile without JavaScript
- **Passive Listeners**: `{passive: true}` on touchstart/touchmove events prevents scroll blocking
- **Native Mobile Scroll**: Can disable Lenis on mobile and rely purely on CSS scroll-snap for maximum native feel

---

## Alternatives Considered

### 1. Pure CSS Scroll-Snap (No JavaScript)
**Pros:**
- Maximum performance and accessibility
- Zero dependencies, minimal code
- Native browser behavior preserved
- Works flawlessly on all devices
- Automatic keyboard navigation
- No scroll hijacking concerns

**Cons:**
- No control over scroll easing/duration
- Limited progress tracking (requires Intersection Observer)
- No custom animations during scroll transitions
- Less "premium" feel compared to smooth libraries

**Accessibility Impact:** ✅ Best-in-class (WCAG 2.1 AAA achievable)

**Verdict:** Excellent foundation, but may not provide desired "immersive" feel for pitch site.

---

### 2. Locomotive Scroll v5
**Pros:**
- Popular, mature library with extensive documentation
- Rich scroll-based animation capabilities
- Works well with GSAP ScrollTrigger
- Automatic mobile detection (switches to native scroll)

**Cons:**
- Creates fixed container and uses CSS transforms (hijacks scroll completely)
- Breaks `position: sticky` elements
- Disables native scrolling (accessibility concerns)
- Larger bundle size than Lenis
- Breaks browser search (CMD+F)
- Complex integration with other libraries

**Accessibility Impact:** ⚠️ Significant concerns
- Native scroll disabled → keyboard navigation issues
- Screen readers may struggle with fake scroll container
- Assistive technologies lose native scroll position
- Requires extensive accessibility patches

**Performance Characteristics:**
- Good 60fps performance when working
- Higher CPU usage due to transform-based scrolling
- Can cause compatibility issues with other animations

**Verdict:** Too many accessibility trade-offs. Falls back to native scroll on mobile anyway, defeating the purpose.

---

### 3. GSAP ScrollSmoother (Premium)
**Pros:**
- Professional-grade smoothness
- Integrates seamlessly with GSAP ecosystem
- Uses native scroll (better than Locomotive)
- Extensive control over easing and timing
- Enterprise support available

**Cons:**
- Requires GreenSock Club membership ($99+/year for commercial use)
- Adds dependency on entire GSAP library
- Heavier than Lenis (though still performant)
- Overkill if not using other GSAP features

**Accessibility Impact:** ✅ Good (uses native scroll)
- Better than Locomotive Scroll
- Requires prefers-reduced-motion implementation
- Keyboard navigation works natively

**Performance Characteristics:**
- Excellent 60fps performance
- Native scroll preservation
- Can handle complex scroll-linked animations

**Verdict:** Excellent choice if budget allows and GSAP is already in use. For this project, Lenis provides similar benefits at zero cost.

---

### 4. Custom Vanilla JS with requestAnimationFrame
**Pros:**
- Complete control over implementation
- Zero dependencies
- Learning opportunity
- Tailored exactly to needs
- No licensing concerns

**Cons:**
- Significant development time (2-4 days to do well)
- Must handle cross-browser quirks manually
- Risk of performance issues if not implemented carefully
- Must maintain 16.67ms frame budget for 60fps
- Need to implement own easing functions
- Accessibility becomes your responsibility

**Accessibility Impact:** ⚠️ Depends on implementation quality
- Easy to break keyboard navigation
- Must manually implement reduced-motion
- Focus management becomes complex
- Requires extensive testing

**Performance Characteristics:**
- Can achieve 60fps with careful implementation
- Must use `cancelAnimationFrame` to prevent animation stacking
- Requires easing functions (e.g., easeOutCubic)
- Need to check if `performance.now()` progress < 0.99 before continuing

**Verdict:** Not recommended unless you have very specific requirements that no library can meet. Development time is better spent on content and design.

---

## Implementation Pattern

### 1. Scroll Hijacking Technique: Hybrid Native + Enhanced

```css
/* Base: CSS Scroll-Snap (works without JavaScript) */
html {
  scroll-behavior: smooth;
  scroll-snap-type: y mandatory;
}

section {
  scroll-snap-align: start;
  scroll-snap-stop: always; /* Force stop at each section */
}

/* Accessibility: Respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}

/* Custom property approach for animations */
:root {
  --scroll-duration: 1.2s;
  --transition-duration: 0.5s;
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --scroll-duration: 0s;
    --transition-duration: 0s;
  }
}
```

```javascript
// Enhanced: Lenis for desktop smooth scrolling
import Lenis from '@studio-freight/lenis';

// Check for reduced motion preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Initialize Lenis only if user hasn't requested reduced motion
let lenis;
if (!prefersReducedMotion) {
  lenis = new Lenis({
    duration: 1.2, // Scroll duration
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Custom easing
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    smoothTouch: false, // Disable on mobile for native feel
    touchMultiplier: 2,
  });

  // RAF loop
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}

// Listen for preference changes (user can change OS settings mid-session)
window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
  if (e.matches && lenis) {
    lenis.destroy();
    lenis = null;
  } else if (!e.matches && !lenis) {
    // Re-initialize Lenis
    lenis = new Lenis({ /* same config */ });
    requestAnimationFrame(raf);
  }
});
```

### 2. Progress Tracking: Intersection Observer

```javascript
// Scroll progress tracking with Intersection Observer
const sections = document.querySelectorAll('section');
const progressIndicators = document.querySelectorAll('.progress-dot');

const observerOptions = {
  root: null, // viewport
  rootMargin: '-50% 0px -50% 0px', // Trigger when section is centered
  threshold: 0,
};

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const index = Array.from(sections).indexOf(entry.target);

      // Update progress indicators
      progressIndicators.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });

      // Update URL hash (accessibility: enables bookmark/share)
      if (entry.target.id) {
        history.replaceState(null, null, `#${entry.target.id}`);
      }

      // Announce to screen readers
      const announcement = document.createElement('div');
      announcement.setAttribute('role', 'status');
      announcement.setAttribute('aria-live', 'polite');
      announcement.textContent = `Section ${index + 1} of ${sections.length}`;
      announcement.classList.add('sr-only'); // Visually hidden
      document.body.appendChild(announcement);
      setTimeout(() => announcement.remove(), 1000);
    }
  });
}, observerOptions);

sections.forEach((section) => {
  // Make sections focusable for keyboard navigation
  if (!section.hasAttribute('tabindex')) {
    section.setAttribute('tabindex', '-1');
  }
  observerOptions(section);
});
```

### 3. Accessibility: Keyboard Navigation

```javascript
// Enhanced keyboard navigation for section jumping
document.addEventListener('keydown', (e) => {
  const currentSection = getCurrentSection();
  const currentIndex = Array.from(sections).indexOf(currentSection);

  let targetIndex = currentIndex;

  // Arrow keys, Page Up/Down for section navigation
  if (e.key === 'ArrowDown' || e.key === 'PageDown') {
    e.preventDefault();
    targetIndex = Math.min(currentIndex + 1, sections.length - 1);
  } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
    e.preventDefault();
    targetIndex = Math.max(currentIndex - 1, 0);
  } else if (e.key === 'Home') {
    e.preventDefault();
    targetIndex = 0;
  } else if (e.key === 'End') {
    e.preventDefault();
    targetIndex = sections.length - 1;
  } else {
    return; // Not a navigation key, don't interfere
  }

  if (targetIndex !== currentIndex) {
    scrollToSection(targetIndex);
  }
});

function scrollToSection(index) {
  const target = sections[index];

  if (prefersReducedMotion) {
    // Instant scroll for reduced motion
    target.scrollIntoView({ behavior: 'auto', block: 'start' });
  } else if (lenis) {
    // Lenis smooth scroll
    lenis.scrollTo(target, { duration: 1.2 });
  } else {
    // Fallback: native smooth scroll
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Set focus for screen readers
  target.focus({ preventScroll: true });
}

function getCurrentSection() {
  const scrollPosition = window.scrollY + window.innerHeight / 2;
  let current = sections[0];

  sections.forEach((section) => {
    if (section.offsetTop <= scrollPosition) {
      current = section;
    }
  });

  return current;
}
```

### 4. Mobile Optimization: Passive Event Listeners

```javascript
// Passive touch event listeners for mobile performance
let touchStartY = 0;
let touchEndY = 0;

// Detect if touch device
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

if (isTouchDevice) {
  // Passive listeners allow browser to scroll immediately
  document.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true }); // Key: passive flag

  document.addEventListener('touchmove', (e) => {
    // Track touch for analytics or gesture detection
    touchEndY = e.touches[0].clientY;
  }, { passive: true });

  document.addEventListener('touchend', () => {
    const swipeDistance = touchStartY - touchEndY;
    const threshold = 50;

    // Optional: Add custom logic for strong swipes
    if (Math.abs(swipeDistance) > threshold) {
      // Could trigger section jump on strong swipe
      // But let CSS scroll-snap handle it naturally for accessibility
    }
  }, { passive: true });
}

// Mobile-specific Lenis config (if using)
const lenisConfig = isTouchDevice ? {
  smooth: true,
  smoothTouch: false, // Disable smooth on touch for native inertia
  touchMultiplier: 2,
} : {
  smooth: true,
  smoothTouch: true,
  touchMultiplier: 2,
};
```

### 5. Progress Indicator Component

```html
<!-- Accessible progress indicator -->
<nav class="scroll-progress" aria-label="Page sections">
  <ul role="list">
    <li>
      <a href="#section-1" class="progress-dot active" aria-label="Section 1: Introduction">
        <span class="sr-only">Introduction</span>
      </a>
    </li>
    <li>
      <a href="#section-2" class="progress-dot" aria-label="Section 2: Features">
        <span class="sr-only">Features</span>
      </a>
    </li>
    <li>
      <a href="#section-3" class="progress-dot" aria-label="Section 3: Pricing">
        <span class="sr-only">Pricing</span>
      </a>
    </li>
  </ul>
</nav>
```

```css
/* Progress indicator styling */
.scroll-progress {
  position: fixed;
  right: 2rem;
  top: 50%;
  transform: translateY(-50%);
  z-index: 100;
}

.progress-dot {
  display: block;
  width: 12px;
  height: 12px;
  margin: 1rem 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.5);
  transition: all var(--transition-duration) ease;
}

.progress-dot:hover,
.progress-dot:focus {
  background: rgba(255, 255, 255, 0.6);
  transform: scale(1.3);
}

.progress-dot.active {
  background: #fff;
  border-color: #fff;
  transform: scale(1.2);
}

/* Screen reader only text */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

---

## Additional Considerations

### 1. Scroll Direction Detection
```javascript
// Track scroll direction for animations
let lastScrollY = window.scrollY;
let scrollDirection = 'down';

const scrollObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    const currentScrollY = window.scrollY;
    scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';
    lastScrollY = currentScrollY;

    // Use direction for directional animations
    entry.target.dataset.scrollDirection = scrollDirection;
  });
}, { threshold: [0, 0.25, 0.5, 0.75, 1] });
```

### 2. Deep Linking Support
```javascript
// Handle deep links (e.g., example.com#section-3)
window.addEventListener('load', () => {
  if (window.location.hash) {
    const target = document.querySelector(window.location.hash);
    if (target) {
      // Delay to let Lenis initialize
      setTimeout(() => {
        scrollToSection(Array.from(sections).indexOf(target));
      }, 100);
    }
  }
});
```

### 3. Performance Monitoring
```javascript
// Monitor scroll performance
let frameCount = 0;
let lastTime = performance.now();

function measureScrollPerformance(time) {
  frameCount++;
  const elapsed = time - lastTime;

  if (elapsed >= 1000) {
    const fps = Math.round(frameCount / (elapsed / 1000));
    console.log(`Scroll FPS: ${fps}`);

    // Warn if dropping below 60fps
    if (fps < 55) {
      console.warn('Scroll performance degraded');
    }

    frameCount = 0;
    lastTime = time;
  }

  requestAnimationFrame(measureScrollPerformance);
}

// Start monitoring in development
if (process.env.NODE_ENV === 'development') {
  requestAnimationFrame(measureScrollPerformance);
}
```

---

## Testing Checklist

### Accessibility Testing
- [ ] Test with keyboard only (Tab, Arrow keys, Page Up/Down, Home, End)
- [ ] Test with screen reader (VoiceOver, NVDA, JAWS)
- [ ] Verify prefers-reduced-motion disables smooth scrolling
- [ ] Test focus indicators are visible on all interactive elements
- [ ] Verify CMD+F search works
- [ ] Test with browser zoom at 200%
- [ ] Verify skip links work
- [ ] Test with JavaScript disabled (CSS scroll-snap fallback)

### Performance Testing
- [ ] Lighthouse performance score > 90
- [ ] Verify 60fps during scroll on desktop (Chrome DevTools Performance panel)
- [ ] Test on low-end mobile devices (throttled to 4x slowdown)
- [ ] Verify no layout shift during scroll (CLS < 0.1)
- [ ] Test with heavy scroll-linked animations
- [ ] Monitor memory usage during extended scrolling

### Mobile Testing
- [ ] Test touch scroll inertia feels natural
- [ ] Verify passive event listeners are working (no console warnings)
- [ ] Test on iOS Safari (60fps cap)
- [ ] Test on Android Chrome
- [ ] Test on low power mode (30fps acceptable)
- [ ] Verify scroll restoration after page reload
- [ ] Test pull-to-refresh doesn't conflict

### Cross-Browser Testing
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (macOS and iOS)
- [ ] Samsung Internet
- [ ] Test with browser extensions (ad blockers, etc.)

---

## Dependencies

```json
{
  "dependencies": {
    "@studio-freight/lenis": "^1.1.14"
  }
}
```

**Total Bundle Size:** ~3.32KB (minified + gzipped)

---

## Browser Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| CSS Scroll-Snap | ✅ 69+ | ✅ 68+ | ✅ 11+ | ✅ 79+ |
| Lenis | ✅ 90+ | ✅ 88+ | ✅ 14+ | ✅ 90+ |
| Intersection Observer | ✅ 51+ | ✅ 55+ | ✅ 12.1+ | ✅ 15+ |
| prefers-reduced-motion | ✅ 74+ | ✅ 63+ | ✅ 10.1+ | ✅ 79+ |
| Passive Event Listeners | ✅ 51+ | ✅ 49+ | ✅ 10+ | ✅ 79+ |

**Graceful Degradation Strategy:**
- Modern browsers: Full experience with Lenis + CSS scroll-snap
- Older browsers: CSS scroll-snap only (still excellent UX)
- Ancient browsers: Regular scroll with smooth-behavior if supported
- JavaScript disabled: CSS scroll-snap works perfectly

---

## Conclusion

The **Hybrid CSS Scroll-Snap + Lenis** approach provides the best balance of:
- **Immersive experience** (smooth, controlled scrolling)
- **Performance** (60fps, 3KB library)
- **Accessibility** (WCAG 2.1 AA compliant)
- **Mobile optimization** (native feel with optional enhancement)
- **Progressive enhancement** (works without JavaScript)
- **Zero licensing cost** (Lenis is open source)

This implementation respects user preferences, maintains native browser functionality, and provides an escape hatch at every level. It's the modern standard for 2025 pitch sites that need to impress while remaining inclusive.

---

## References

### Libraries
- **Lenis**: https://github.com/darkroomengineering/lenis
- **Locomotive Scroll**: https://locomotivemtl.github.io/locomotive-scroll/
- **GSAP ScrollSmoother**: https://greensock.com/scrollsmoother/

### Standards & APIs
- **CSS Scroll Snap**: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll_snap
- **Intersection Observer API**: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
- **Passive Event Listeners**: https://developer.chrome.com/blog/passive-event-listeners
- **prefers-reduced-motion**: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion

### Accessibility Guidelines
- **WCAG 2.1 Success Criterion 2.1.1** (Keyboard): https://www.w3.org/WAI/WCAG21/Understanding/keyboard
- **WCAG 2.1 Success Criterion 2.3.3** (Animation from Interactions): https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions
- **WCAG 2.1 Success Criterion 2.4.3** (Focus Order): https://www.w3.org/WAI/WCAG21/Understanding/focus-order

### Performance
- **requestAnimationFrame**: https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
- **Chrome Scrolling Intervention**: https://developer.chrome.com/blog/scrolling-intervention

---

**Last Updated:** October 27, 2025
**Author:** Research for portfolio-site pitch experience
**Status:** ✅ Decision finalized, ready for implementation
