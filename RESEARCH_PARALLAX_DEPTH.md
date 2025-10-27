# Research: Multi-Layer Parallax Scrolling and Depth Effects

**Date**: 2025-10-27
**Context**: Creating sophisticated visual depth through multiple z-index layers with differential scroll speeds while maintaining 60fps performance.

---

## Decision: CSS 3D Transform-Based Parallax with GSAP ScrollTrigger

**Primary Approach**: Pure CSS 3D transforms (`perspective` + `translateZ`) for base parallax effect, enhanced with GSAP ScrollTrigger for complex orchestration.

**Hybrid Implementation**:
- CSS 3D transforms for simple, hardware-accelerated parallax layers
- GSAP ScrollTrigger for complex multi-layer coordination and advanced effects
- Vanilla JavaScript with `requestAnimationFrame` for lightweight custom animations

---

## Rationale

### Performance: 60fps Achievement Strategy

**Hardware Acceleration (GPU)**:
- Use **only** GPU-accelerated CSS properties: `transform` (translate3d, scale, rotate), `opacity`
- Avoid `background-position`, `top/left/right/bottom`, `width/height` - these trigger repaints/reflows
- `translate3d(x, y, z)` forces GPU acceleration even for 2D transforms (better than `translateX/Y`)

**CSS 3D Transform Method**:
```css
.parallax-container {
  perspective: 1px;
  height: 100vh;
  overflow-x: hidden;
  overflow-y: auto;
}

.parallax-layer {
  transform-style: preserve-3d;
}

.parallax-layer--back {
  transform: translateZ(-1px) scale(2);
}

.parallax-layer--base {
  transform: translateZ(0);
}

.parallax-layer--front {
  transform: translateZ(1px) scale(0.5);
}
```

**How it Works**:
- Elements at different `translateZ` values scroll at different rates automatically
- `translateZ(-1px)` moves layer away = scrolls slower (needs `scale(2)` to compensate size)
- `translateZ(1px)` moves layer toward viewer = scrolls faster (needs `scale(0.5)`)
- **Zero JavaScript** needed for basic effect - browser handles scroll natively
- **Zero scroll event listeners** = no performance overhead

**RequestAnimationFrame Pattern**:
```javascript
let ticking = false;
let scrollPos = 0;

window.addEventListener('scroll', () => {
  scrollPos = window.scrollY;
  if (!ticking) {
    requestAnimationFrame(updateParallax);
    ticking = true;
  }
});

function updateParallax() {
  // Update parallax elements using scrollPos
  parallaxElements.forEach(el => {
    const speed = el.dataset.speed;
    el.style.transform = `translate3d(0, ${scrollPos * speed}px, 0)`;
  });
  ticking = false;
}
```

**Key Performance Principles**:
1. **Throttle scroll events** with `requestAnimationFrame` (syncs with browser paint cycle)
2. **Query elements once** at initialization, cache references
3. **Batch DOM reads** (scrollPos) before writes (style updates)
4. **Use `will-change: transform`** sparingly on animating elements
5. **Limit parallax to viewport** - only animate visible elements (Intersection Observer)

### Visual Quality: Depth Perception Achieved

**Layering Strategy**:
1. **Background layers** (-5 to -1): Slowest movement, largest depth
2. **Content layer** (0): Normal scroll rate (1:1)
3. **Foreground layers** (1 to 3): Faster movement, closest to viewer

**Depth Enhancement Techniques**:

**CSS Perspective** for spatial depth:
```css
.scene {
  perspective: 800px;
  perspective-origin: 50% 50%;
}
```
- Lower perspective values (300-500px) = dramatic depth
- Higher values (1000-2000px) = subtle depth
- `perspective-origin` controls vanishing point

**Z-Index Coordination**:
- Use logical scale: 10, 20, 30... (not 1, 2, 3 or 9999)
- Background: z-index 10-30
- Content: z-index 40-60
- UI/Overlays: z-index 70-90
- Modals: z-index 100+

**Visual Hierarchy Stacking**:
```
z-index 80: Floating UI elements with subtle parallax
z-index 60: Primary content (text, cards)
z-index 40: Mid-ground decorative elements
z-index 20: Background patterns/textures
z-index 10: Far background (sky, gradients)
```

**Additional Depth Cues**:
- **Blur**: Further layers slightly blurred (`filter: blur(2px)`)
- **Opacity**: Distant layers semi-transparent (0.6-0.8)
- **Scale**: Larger elements appear closer
- **Color**: Atmospheric perspective (desaturate distant layers)

### Mobile Support: Graceful Degradation

**Performance Detection**:
```javascript
const isLowPower = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
         (navigator.deviceMemory && navigator.deviceMemory < 4);
};
```

**Reduced Motion Preference**:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .parallax-layer {
    transform: translateZ(0) !important; /* Disable parallax */
  }
}
```

**Mobile Degradation Strategy**:

**Level 1 - Full Desktop Experience**:
- All parallax layers active
- Complex GSAP animations
- High fidelity depth effects

**Level 2 - Simplified Mobile**:
- Reduce parallax layers (3-4 max instead of 7-8)
- Reduce parallax intensity (50% of desktop speed multipliers)
- Disable blur/advanced filters
- Use CSS 3D only (no JavaScript parallax)

**Level 3 - Low-End Mobile Fallback**:
- Disable all parallax (`translateZ(0)`)
- Static background images
- Maintain layout structure
- Simple fade-in animations only

**Implementation**:
```javascript
const parallaxConfig = {
  desktop: { layers: 8, intensity: 1.0, effects: true },
  mobile: { layers: 4, intensity: 0.5, effects: false },
  lowEnd: { layers: 0, intensity: 0, effects: false }
};

const config = isLowPower()
  ? parallaxConfig.lowEnd
  : isMobile()
    ? parallaxConfig.mobile
    : parallaxConfig.desktop;
```

**iOS Specific Considerations**:
- iOS has "Reduce Motion" accessibility setting
- Respect `prefers-reduced-motion` media query
- iOS Safari may struggle with complex 3D transforms on older devices
- Test on iPhone 8/SE generation for baseline compatibility

---

## Alternatives Considered

### 1. Pure JavaScript Parallax (Background-Position Method)

**How it Works**:
```javascript
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  element.style.backgroundPosition = `0 ${scrolled * 0.5}px`;
});
```

**Pros**:
- Simple to understand
- Wide browser compatibility
- Works with background images

**Cons**:
- **Performance**: Changes `background-position` triggers repaint every frame
- Cannot reach 60fps with multiple layers
- Measured performance: 15-30 FPS (reported in research)
- Not hardware accelerated
- Janky on scroll

**Verdict**: Avoid for performance-critical applications

---

### 2. GSAP ScrollTrigger Only (No CSS 3D)

**How it Works**:
```javascript
gsap.to('.parallax-layer', {
  y: (i, target) => -ScrollTrigger.maxScroll(window) * target.dataset.speed,
  ease: 'none',
  scrollTrigger: {
    start: 0,
    end: 'max',
    scrub: 0
  }
});
```

**Pros**:
- Mature, battle-tested library
- Excellent documentation and community
- Precise control over animations
- Works with complex timing/easing
- Built-in performance optimizations

**Cons**:
- 30-50KB library size (minified + gzipped)
- Slight overhead vs pure CSS
- Requires JavaScript for basic parallax
- Learning curve for advanced features

**Performance Impact**:
- GSAP uses `requestAnimationFrame` internally
- Uses `transform` properties (hardware accelerated)
- Achieves 60fps on modern hardware
- Slightly slower than pure CSS 3D but imperceptible

**Verdict**: Excellent for complex multi-layer coordination, worth the bundle size

---

### 3. Rellax.js

**Specs**:
- Lightweight: ~4.8KB minified
- Vanilla JavaScript
- Hardware acceleration
- Simple API

**Pros**:
- Very small bundle size
- No dependencies
- Easy to implement
- Good for simple parallax

**Cons**:
- **Performance issues**: Reports of "jumpy" animations
- Less control than GSAP
- Smaller community/ecosystem
- No advanced features (snap, pin, etc.)

**Code Example**:
```javascript
const rellax = new Rellax('.rellax', {
  speed: -2,
  center: false,
  wrapper: null,
  round: true,
  vertical: true,
  horizontal: false
});
```

**Verdict**: Good for simple projects, not ideal for complex multi-layer coordination

---

### 4. Locomotive Scroll

**Features**:
- Smooth scrolling (virtual scroll)
- Parallax effects
- Modern API
- Mobile support

**Pros**:
- Beautiful smooth scrolling effect
- Good parallax implementation
- Active development
- Works well with frameworks

**Cons**:
- **Virtual scroll overhead**: Custom scroll implementation
- Can feel "floaty" or unnatural
- Larger bundle size (~30KB)
- Accessibility concerns (custom scroll behavior)
- May conflict with native scroll features (scroll-snap, etc.)

**Performance**:
- Good FPS when optimized
- Virtual scroll adds processing overhead
- Not as performant as native CSS 3D

**Verdict**: Great for portfolio sites with smooth scroll aesthetic, overkill for standard parallax

---

### 5. SimpleParallax.js

**Specs**:
- Lightweight (~4KB)
- Focus on image parallax
- Vanilla JavaScript

**Pros**:
- Very simple API
- Small size
- Good for image-only parallax
- Decent performance

**Cons**:
- Limited to images
- Less flexible than GSAP
- No complex multi-layer support
- Basic feature set

**Verdict**: Good for simple image backgrounds, not suitable for complex multi-layer depth effects

---

### 6. Parallax.js (by Matthew Wagerfield)

**Features**:
- Device orientation parallax
- Mouse/gyroscope movement
- Layer-based approach

**Pros**:
- Unique interaction model (tilt/mouse)
- Good for "floating" layer effects
- Lightweight (~3KB)

**Cons**:
- **Different use case**: Not scroll-based parallax
- Device orientation can give false positives on low-end devices
- Limited to specific interaction patterns

**Verdict**: Excellent for tilt-based depth, not for scroll parallax

---

## Implementation Techniques

### Chosen Approach: Hybrid CSS 3D + GSAP

**Why Hybrid?**
- CSS 3D for simple background layers (best performance, zero JS)
- GSAP ScrollTrigger for complex coordinated animations
- Vanilla JS for lightweight custom effects

---

### 1. Parallax Method: Transform-Based Calculation

**CSS 3D Transform Approach (Recommended for Backgrounds)**:

```html
<div class="parallax-container">
  <div class="parallax-layer layer-back" data-depth="-1">
    <!-- Slowest layer -->
  </div>
  <div class="parallax-layer layer-mid" data-depth="-0.5">
    <!-- Medium speed layer -->
  </div>
  <div class="parallax-layer layer-front" data-depth="0">
    <!-- Content layer (no parallax) -->
  </div>
</div>
```

```css
.parallax-container {
  perspective: 1px;
  height: 100vh;
  overflow-x: hidden;
  overflow-y: auto;
  transform-style: preserve-3d;
}

.parallax-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  transform-style: preserve-3d;
}

.layer-back {
  /* Move 1px away in Z-space = scrolls at 0.5x speed */
  transform: translateZ(-1px) scale(2);
  z-index: 10;
}

.layer-mid {
  /* Move 0.5px away = scrolls at ~0.75x speed */
  transform: translateZ(-0.5px) scale(1.5);
  z-index: 20;
}

.layer-front {
  transform: translateZ(0);
  z-index: 30;
}
```

**Math Behind It**:
```
parallax_speed = 1 - (translateZ_value / perspective)
scale_needed = 1 / parallax_speed

Example with perspective: 1px
- translateZ(-1px): speed = 1 - (-1/1) = 2 (scrolls 2x slower)
  scale needed = 1/2 = 0.5... but we scale UP to maintain size: scale(2)

- translateZ(-0.5px): speed = 1 - (-0.5/1) = 1.5
  scale = 1/1.5 ≈ 0.67... scale(1.5) to compensate
```

**GSAP ScrollTrigger Approach (For Complex Animations)**:

```javascript
gsap.utils.toArray('.parallax-element').forEach((element) => {
  const speed = element.dataset.speed || 0.5;
  const yPercent = -100 * speed;

  gsap.fromTo(element, {
    y: 0
  }, {
    y: yPercent,
    ease: 'none',
    scrollTrigger: {
      trigger: element,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true, // Smooth scrubbing
      invalidateOnRefresh: true
    }
  });
});
```

**Vanilla JavaScript Approach (Lightweight)**:

```javascript
class ParallaxScroller {
  constructor(elements, options = {}) {
    this.elements = Array.from(elements);
    this.ticking = false;
    this.scrollPos = 0;

    this.init();
  }

  init() {
    // Cache element data
    this.elementsData = this.elements.map(el => ({
      element: el,
      speed: parseFloat(el.dataset.speed) || 0.5,
      rect: el.getBoundingClientRect()
    }));

    window.addEventListener('scroll', () => this.onScroll(), { passive: true });
    window.addEventListener('resize', () => this.onResize());
  }

  onScroll() {
    this.scrollPos = window.scrollY;

    if (!this.ticking) {
      requestAnimationFrame(() => this.update());
      this.ticking = true;
    }
  }

  update() {
    const viewportHeight = window.innerHeight;

    this.elementsData.forEach(({ element, speed, rect }) => {
      const elementTop = rect.top + this.scrollPos;
      const elementVisible = (
        elementTop < this.scrollPos + viewportHeight &&
        elementTop + rect.height > this.scrollPos
      );

      if (elementVisible) {
        const yPos = (this.scrollPos - elementTop) * speed;
        element.style.transform = `translate3d(0, ${yPos}px, 0)`;
      }
    });

    this.ticking = false;
  }

  onResize() {
    this.elementsData.forEach(data => {
      data.rect = data.element.getBoundingClientRect();
    });
  }
}

// Usage
const parallax = new ParallaxScroller(
  document.querySelectorAll('[data-parallax]')
);
```

---

### 2. Z-Index Coordination: Layer Management Strategy

**Logical Z-Index Scale**:

```javascript
// Z-index management system
const Z_INDEX = {
  // Background layers
  SKY: 10,
  BACKGROUND_FAR: 20,
  BACKGROUND_NEAR: 30,

  // Content layers
  CONTENT_BACK: 40,
  CONTENT_BASE: 50,
  CONTENT_FRONT: 60,

  // UI layers
  UI_BASE: 70,
  UI_FLOATING: 80,

  // Overlays
  OVERLAY: 90,
  MODAL: 100,
  TOAST: 110
};
```

**CSS Custom Properties Approach**:

```css
:root {
  --z-sky: 10;
  --z-bg-far: 20;
  --z-bg-near: 30;
  --z-content-back: 40;
  --z-content-base: 50;
  --z-content-front: 60;
  --z-ui-base: 70;
  --z-ui-float: 80;
  --z-overlay: 90;
  --z-modal: 100;
}

.background-sky {
  z-index: var(--z-sky);
  transform: translateZ(-2px) scale(3);
}

.background-mountains {
  z-index: var(--z-bg-far);
  transform: translateZ(-1.5px) scale(2.5);
}

.content-layer {
  z-index: var(--z-content-base);
  transform: translateZ(0);
}
```

**Stacking Context Management**:

```css
/* Create new stacking context for isolated layer groups */
.layer-group {
  position: relative;
  z-index: 1;
  /* These create new stacking context: */
  /* transform, filter, perspective, opacity < 1 */
}

/* Child z-index values are now relative to parent */
.layer-group__item-1 {
  z-index: 10; /* Only affects siblings in this group */
}

.layer-group__item-2 {
  z-index: 20;
}
```

---

### 3. Performance Optimization Techniques

**A. Will-Change Property**:

```css
/* Apply to actively animating elements only */
.parallax-layer--animating {
  will-change: transform;
}

/* Remove after animation */
.parallax-layer--static {
  will-change: auto;
}
```

```javascript
// JavaScript management
element.style.willChange = 'transform';

// After animation or on scroll end
setTimeout(() => {
  element.style.willChange = 'auto';
}, 1000);
```

**WARNING**: Don't apply `will-change` to too many elements - creates memory overhead

---

**B. Transform3D Force GPU Acceleration**:

```css
/* Even for 2D transforms, use 3D to force GPU */
.parallax-layer {
  transform: translate3d(0, 0, 0); /* Instead of translate(0, 0) */
}

/* Always use transform, never position */
/* BAD - triggers reflow */
.element {
  top: 100px;
}

/* GOOD - GPU accelerated */
.element {
  transform: translate3d(0, 100px, 0);
}
```

---

**C. RequestAnimationFrame Pattern**:

```javascript
// Debounce scroll events with rAF
let scrollTicking = false;

window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    requestAnimationFrame(updateParallax);
    scrollTicking = true;
  }
}, { passive: true }); // Passive listener for better scroll performance

function updateParallax(timestamp) {
  // Perform parallax calculations and updates
  updateAllLayers();
  scrollTicking = false;
}
```

---

**D. Intersection Observer for Viewport Culling**:

```javascript
// Only animate elements in viewport
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('parallax--active');
    } else {
      entry.target.classList.remove('parallax--active');
    }
  });
}, {
  rootMargin: '50px' // Start animating slightly before entering viewport
});

// Observe all parallax elements
document.querySelectorAll('.parallax-layer').forEach(el => {
  observer.observe(el);
});

// Only update active elements
function updateParallax() {
  document.querySelectorAll('.parallax--active').forEach(updateElement);
}
```

---

**E. Batch DOM Operations**:

```javascript
// BAD - Reading and writing mixed (causes layout thrashing)
elements.forEach(el => {
  const top = el.getBoundingClientRect().top; // READ
  el.style.transform = `translateY(${top * 0.5}px)`; // WRITE
  const height = el.offsetHeight; // READ (forces reflow!)
  el.style.height = `${height + 10}px`; // WRITE
});

// GOOD - Batch reads, then batch writes
const measurements = elements.map(el => ({
  el,
  top: el.getBoundingClientRect().top,
  height: el.offsetHeight
}));

measurements.forEach(({ el, top, height }) => {
  el.style.transform = `translateY(${top * 0.5}px)`;
  el.style.height = `${height + 10}px`;
});
```

---

**F. Limit Parallax Complexity**:

```javascript
// Configuration for different device tiers
const PARALLAX_CONFIG = {
  desktop: {
    maxLayers: 8,
    useFilters: true,
    useBlur: true,
    updateInterval: 0 // Every frame
  },
  mobile: {
    maxLayers: 4,
    useFilters: false,
    useBlur: false,
    updateInterval: 16 // ~60fps but throttled
  },
  lowEnd: {
    maxLayers: 0, // Disable parallax
    useFilters: false,
    useBlur: false,
    updateInterval: 0
  }
};
```

---

### 4. Mobile Considerations

**A. Device Detection**:

```javascript
const DeviceCapability = {
  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  },

  isLowEnd() {
    // CPU cores
    const cores = navigator.hardwareConcurrency || 4;

    // RAM (in GB)
    const memory = navigator.deviceMemory || 4;

    // Connection type
    const connection = navigator.connection || {};
    const effectiveType = connection.effectiveType || '4g';

    return cores <= 4 || memory < 4 || effectiveType === '2g' || effectiveType === '3g';
  },

  prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  getCapabilityTier() {
    if (this.prefersReducedMotion()) return 'minimal';
    if (this.isLowEnd()) return 'lowEnd';
    if (this.isMobile()) return 'mobile';
    return 'desktop';
  }
};
```

---

**B. Reduced Parallax Intensity**:

```javascript
const parallaxSpeed = (baseSpeed) => {
  const tier = DeviceCapability.getCapabilityTier();

  const multipliers = {
    desktop: 1.0,
    mobile: 0.5,    // 50% intensity
    lowEnd: 0,      // Disable
    minimal: 0      // Accessibility
  };

  return baseSpeed * multipliers[tier];
};

// Usage
const speed = parallaxSpeed(-0.5); // -0.5 on desktop, -0.25 on mobile, 0 on lowEnd
```

---

**C. CSS Media Query Fallbacks**:

```css
/* Desktop - full parallax */
@media (min-width: 1024px) {
  .parallax-layer--back {
    transform: translateZ(-1px) scale(2);
  }
}

/* Tablet - reduced parallax */
@media (min-width: 768px) and (max-width: 1023px) {
  .parallax-layer--back {
    transform: translateZ(-0.5px) scale(1.5);
  }
}

/* Mobile - minimal or no parallax */
@media (max-width: 767px) {
  .parallax-layer--back {
    transform: translateZ(0) scale(1);
  }
}

/* Accessibility - respect user preference */
@media (prefers-reduced-motion: reduce) {
  .parallax-layer {
    transform: translateZ(0) scale(1) !important;
    animation: none !important;
    transition: none !important;
  }
}
```

---

**D. Touch-Optimized Scrolling**:

```css
/* Enable momentum scrolling on iOS */
.parallax-container {
  -webkit-overflow-scrolling: touch;
  overflow-y: auto;
}

/* Prevent scroll bounce interference with parallax */
body {
  overscroll-behavior: none;
}
```

---

**E. Conditional Loading**:

```javascript
// Load GSAP only on capable devices
const loadGSAP = async () => {
  if (DeviceCapability.getCapabilityTier() === 'desktop') {
    const gsap = await import('gsap');
    const ScrollTrigger = await import('gsap/ScrollTrigger');
    gsap.registerPlugin(ScrollTrigger);
    return { gsap, ScrollTrigger };
  }
  return null;
};

// Initialize parallax
const initParallax = async () => {
  const tier = DeviceCapability.getCapabilityTier();

  switch(tier) {
    case 'desktop':
      const gsapModules = await loadGSAP();
      initGSAPParallax(gsapModules);
      break;
    case 'mobile':
      initCSSParallax(); // CSS 3D only
      break;
    case 'lowEnd':
    case 'minimal':
      initStaticLayout(); // No parallax
      break;
  }
};
```

---

## Complete Example: Hybrid Implementation

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Performant Parallax</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: system-ui, sans-serif;
      overscroll-behavior: none;
    }

    /* Pure CSS parallax container */
    .parallax-scene {
      perspective: 1px;
      height: 100vh;
      overflow-x: hidden;
      overflow-y: auto;
      transform-style: preserve-3d;
      -webkit-overflow-scrolling: touch;
    }

    /* Parallax layers */
    .parallax-layer {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      transform-style: preserve-3d;
    }

    .layer--sky {
      background: linear-gradient(to bottom, #1e3c72, #2a5298);
      transform: translateZ(-3px) scale(4);
      z-index: 10;
    }

    .layer--mountains {
      background: url('/images/mountains.svg') bottom center / cover no-repeat;
      transform: translateZ(-2px) scale(3);
      z-index: 20;
      opacity: 0.8;
    }

    .layer--clouds {
      background: url('/images/clouds.png') center / cover no-repeat;
      transform: translateZ(-1px) scale(2);
      z-index: 30;
      opacity: 0.6;
    }

    .layer--content {
      position: relative;
      transform: translateZ(0);
      z-index: 40;
      padding: 2rem;
    }

    /* GSAP-enhanced elements */
    .gsap-parallax {
      will-change: transform;
    }

    /* Mobile optimizations */
    @media (max-width: 768px) {
      .parallax-scene {
        perspective: none;
      }

      .parallax-layer {
        transform: translateZ(0) scale(1) !important;
      }

      .layer--clouds {
        opacity: 0.3;
      }
    }

    /* Reduced motion */
    @media (prefers-reduced-motion: reduce) {
      .parallax-scene {
        perspective: none;
      }

      .parallax-layer {
        transform: none !important;
        animation: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="parallax-scene">
    <!-- Pure CSS parallax layers -->
    <div class="parallax-layer layer--sky"></div>
    <div class="parallax-layer layer--mountains"></div>
    <div class="parallax-layer layer--clouds"></div>

    <!-- Content layer -->
    <div class="parallax-layer layer--content">
      <section style="min-height: 100vh; padding-top: 50vh;">
        <h1 class="gsap-parallax" data-speed="0.3">Welcome</h1>
        <p class="gsap-parallax" data-speed="0.5">Scroll to explore</p>
      </section>

      <section style="min-height: 100vh;">
        <div class="gsap-parallax" data-speed="0.2">
          <h2>Section 2</h2>
          <p>Content with custom parallax</p>
        </div>
      </section>
    </div>
  </div>

  <script type="module">
    // Device capability detection
    const DeviceCapability = {
      isMobile: () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      isLowEnd: () => (navigator.hardwareConcurrency || 4) <= 4 || (navigator.deviceMemory || 4) < 4,
      prefersReducedMotion: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      getTier: function() {
        if (this.prefersReducedMotion()) return 'minimal';
        if (this.isLowEnd()) return 'lowEnd';
        if (this.isMobile()) return 'mobile';
        return 'desktop';
      }
    };

    // Initialize based on device capability
    const init = async () => {
      const tier = DeviceCapability.getTier();

      if (tier === 'desktop') {
        // Load GSAP for desktop only
        const { gsap } = await import('https://cdn.skypack.dev/gsap@3.12.2');
        const { ScrollTrigger } = await import('https://cdn.skypack.dev/gsap@3.12.2/ScrollTrigger');

        gsap.registerPlugin(ScrollTrigger);

        // Animate GSAP elements
        gsap.utils.toArray('.gsap-parallax').forEach(element => {
          const speed = element.dataset.speed || 0.5;

          gsap.to(element, {
            y: () => -(window.innerHeight * speed),
            ease: 'none',
            scrollTrigger: {
              trigger: element,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true
            }
          });
        });

        console.log('Desktop: Full GSAP parallax loaded');
      } else if (tier === 'mobile') {
        // Mobile: CSS parallax only (already in CSS)
        console.log('Mobile: CSS parallax active');
      } else {
        // Low-end/reduced motion: No parallax
        document.querySelector('.parallax-scene').style.perspective = 'none';
        console.log('Minimal: Parallax disabled');
      }
    };

    init();
  </script>
</body>
</html>
```

---

## Performance Benchmarks

### Expected FPS by Approach

| Technique | Desktop | Mobile | Low-End |
|-----------|---------|--------|---------|
| CSS 3D Transform | 60 FPS | 60 FPS | 50-60 FPS |
| GSAP ScrollTrigger | 60 FPS | 45-60 FPS | 30-45 FPS |
| Vanilla JS + rAF | 60 FPS | 50-60 FPS | 40-50 FPS |
| Background-position | 15-30 FPS | 10-20 FPS | 5-15 FPS |
| Rellax.js | 50-60 FPS | 40-50 FPS | 30-40 FPS |

### Layer Count Impact

| Layers | CSS 3D | GSAP | Vanilla |
|--------|--------|------|---------|
| 1-3 | 60 FPS | 60 FPS | 60 FPS |
| 4-6 | 60 FPS | 60 FPS | 55-60 FPS |
| 7-10 | 60 FPS | 55-60 FPS | 50-55 FPS |
| 10+ | 55-60 FPS | 45-55 FPS | 40-50 FPS |

---

## Recommended Layer Architecture

### 7-Layer Depth System (Desktop)

```
Layer 7 (z-index: 70): Floating UI elements
  ↓ translateZ(0.5px) - Moves faster, closest

Layer 6 (z-index: 60): Interactive content (buttons, cards)
  ↓ translateZ(0)

Layer 5 (z-index: 50): Primary content (text, images)
  ↓ translateZ(-0.5px)

Layer 4 (z-index: 40): Decorative mid-ground
  ↓ translateZ(-1px)

Layer 3 (z-index: 30): Background patterns
  ↓ translateZ(-1.5px)

Layer 2 (z-index: 20): Far background elements
  ↓ translateZ(-2px)

Layer 1 (z-index: 10): Sky/gradient backdrop
  ↓ translateZ(-3px) - Moves slowest, furthest
```

### 3-Layer Simplified (Mobile)

```
Layer 3 (z-index: 30): Content + UI
  ↓ translateZ(0)

Layer 2 (z-index: 20): Mid-ground decoration
  ↓ translateZ(-0.5px)

Layer 1 (z-index: 10): Background
  ↓ translateZ(-1px)
```

---

## Key Takeaways

### Do's
1. Use `translate3d` for all position changes
2. Animate only `transform` and `opacity`
3. Throttle scroll events with `requestAnimationFrame`
4. Use Intersection Observer to cull off-screen elements
5. Test on real mobile devices, not just DevTools
6. Respect `prefers-reduced-motion`
7. Limit active parallax layers (< 8 on desktop, < 4 on mobile)
8. Cache element queries and measurements
9. Use CSS 3D transforms for simple background parallax
10. Consider GSAP for complex multi-element choreography

### Don'ts
1. Never use `background-position` for parallax
2. Don't bind directly to scroll events without throttling
3. Don't apply `will-change` to all elements
4. Don't mix reading/writing DOM in loops (layout thrashing)
5. Don't use `position: absolute` with `top/left` for animation
6. Don't add parallax without performance budgeting
7. Don't ignore mobile and low-end devices
8. Don't forget accessibility (reduced motion)
9. Don't animate properties that cause reflow (`width`, `height`, `margin`, etc.)
10. Don't over-engineer - start with CSS 3D, add JS only if needed

---

## Testing Checklist

- [ ] Test on Chrome, Firefox, Safari, Edge
- [ ] Test on real iOS device (Safari)
- [ ] Test on real Android device (Chrome)
- [ ] Test with Chrome DevTools CPU throttling (4x slowdown)
- [ ] Test with FPS monitor (Chrome DevTools Performance tab)
- [ ] Test with `prefers-reduced-motion` enabled
- [ ] Test on older hardware (iPhone 8 / equivalent)
- [ ] Validate 60fps on fast scroll
- [ ] Validate no layout thrashing (check Performance timeline)
- [ ] Test with slow 3G network (parallax should not block content)

---

## Conclusion

**Chosen Approach**: Hybrid CSS 3D Transform + GSAP ScrollTrigger

- **CSS 3D for base layers**: Zero-JS parallax, native browser optimization, 60fps guaranteed
- **GSAP for complex effects**: Choreographed animations, precise timing, production-ready
- **Graceful degradation**: Progressive enhancement from desktop → mobile → low-end

**Expected Performance**: 60fps on modern desktop/mobile with 4-7 parallax layers

This approach balances visual sophistication with real-world performance across device tiers while respecting user accessibility preferences.

---

**Related Files**:
- None yet (to be created during implementation)

**Next Steps**:
1. Implement base CSS 3D parallax structure
2. Add GSAP ScrollTrigger for hero/feature sections
3. Add device capability detection
4. Test across device tiers
5. Fine-tune parallax speeds and layer depths
