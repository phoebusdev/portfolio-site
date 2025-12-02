# Animation Library Research for High-Performance Pitch Site

**Research Date:** 2025-10-27
**Target Requirements:**
- 60fps animations
- <2s load time
- <150KB bundle per route
- Custom cubic-bezier easing curves
- GPU-accelerated transforms
- Scroll-linked animations

---

## Decision: Motion One + CSS Scroll-Driven Animations

---

## Rationale:

### Performance
- **Bundle Size:** 3.8KB minified + gzipped (smallest available)
- **Runtime Performance:** Hardware-accelerated via Web Animations API (WAAPI)
- **Benchmark Speed:** 2.5x faster than GSAP at animating from unknown values, 6x faster at animating between different value types
- **GPU Acceleration:** Built-in support for GPU-accelerated animations via WAAPI, runs off main thread
- **Scroll Performance:** CSS scroll-driven animations run natively on compositor thread, achieving 60fps+ without JavaScript event listeners

### Features
- **Custom Easing:** Full support for custom cubic-bezier curves via standard CSS easing syntax
- **Modular Architecture:** Tree-shakeable design means only imported features are bundled
- **Modern API:** Clean, Promise-based API built on Web Animations API standard
- **Scroll Integration:** Pairs seamlessly with native CSS scroll-driven animations (Chrome 115+)

### Bundle Size Analysis
Motion One meets the <150KB per route requirement with room to spare:
- **Motion One core:** 3.8KB
- **CSS scroll-driven animations:** 0KB (native browser API)
- **Remaining budget:** ~146KB for other route assets

### Why This Beats Alternatives

**vs GSAP (23KB core):**
- Motion One is 6x smaller
- GSAP doesn't tree-shake (all-or-nothing import)
- Motion One uses native WAAPI for better browser optimization
- GSAP: $99+/year for commercial license; Motion One: MIT licensed

**vs Framer Motion (34KB minimum, 4.6KB optimized):**
- Motion One is 20% smaller even than Framer Motion's optimized LazyMotion mode
- Framer Motion tied to React; Motion One is framework-agnostic
- Motion One has simpler API with less overhead

**vs anime.js (27.6KB):**
- Motion One is 7x smaller
- Motion One uses WAAPI for GPU acceleration; anime.js uses requestAnimationFrame
- Both support custom easing, but Motion One has better scroll integration

**vs Vanilla WAAPI:**
- Motion One adds negligible overhead (3.8KB) for significantly better DX
- Provides animation sequencing, spring physics, and utility functions
- Better cross-browser consistency and fallback handling

---

## Alternatives Considered:

### 1. GSAP (GreenSock Animation Platform)
**Bundle Size:** 23KB core (minified + gzipped)
**Pros:**
- Industry-standard, battle-tested in production
- Exceptional documentation and community support
- Advanced features (morphing, timeline sequencing, scroll-based triggers)
- Best-in-class backward compatibility

**Cons:**
- 6x larger than Motion One (23KB vs 3.8KB)
- No tree-shaking support - importing any GSAP feature includes entire core
- Commercial license required ($99+/year for most projects)
- Uses JavaScript-based animation engine rather than native WAAPI
- Scroll-based animations require additional ScrollTrigger plugin

**Why Rejected:** Bundle size exceeds requirements for minimal feature gain. For a pitch site with straightforward animation needs, GSAP's advanced features don't justify the 19.2KB overhead.

---

### 2. Framer Motion
**Bundle Size:** 34KB (standard), 4.6KB (LazyMotion optimized)
**Pros:**
- Excellent React integration with declarative API
- Layout animations and automatic animation orchestration
- Strong TypeScript support
- Can be optimized to 4.6KB with LazyMotion

**Cons:**
- React-only (not framework-agnostic)
- Requires LazyMotion optimization effort to approach Motion One's size
- Still 20% larger than Motion One even when optimized
- Declarative API adds abstraction overhead

**Why Rejected:** Framework lock-in and larger bundle size. If building a React-only site and heavily using layout animations, Framer Motion would be competitive. For a lean pitch site, Motion One's framework-agnostic approach and smaller footprint win.

---

### 3. anime.js
**Bundle Size:** 27.6KB (minified + gzipped)
**Pros:**
- Lightweight compared to GSAP
- Zero dependencies
- Good documentation and examples
- V4 includes modular imports and performance improvements

**Cons:**
- 7x larger than Motion One (27.6KB vs 3.8KB)
- Uses requestAnimationFrame instead of native WAAPI
- Less optimized for modern browser capabilities
- No native scroll-driven animation support

**Why Rejected:** Significantly larger bundle size without compelling feature advantages. anime.js is excellent for mid-complexity projects, but Motion One's use of WAAPI provides better performance at a fraction of the size.

---

### 4. Pure CSS Animations
**Bundle Size:** 0KB (native browser capability)
**Pros:**
- Zero JavaScript overhead
- Optimal performance (GPU-accelerated by default)
- CSS scroll-driven animations are now standardized (Chrome 115+)
- Declarative and maintainable

**Cons:**
- Limited programmatic control
- Complex sequencing requires verbose CSS
- No spring physics or advanced easing without JavaScript
- Cross-browser differences in implementation

**Why Rejected:** While CSS animations are incredibly performant, the lack of programmatic control makes complex interactive animations difficult. The hybrid approach (Motion One + CSS scroll-driven animations) provides the best of both worlds.

---

### 5. Vanilla JavaScript + Web Animations API (WAAPI)
**Bundle Size:** 0KB (native browser API)
**Pros:**
- Zero bundle overhead
- Direct access to browser's animation engine
- Full GPU acceleration support
- Same performance as CSS animations

**Cons:**
- Verbose API for complex animations
- Manual sequence management required
- No spring physics or utility functions
- Cross-browser inconsistencies require polyfills

**Why Rejected:** While WAAPI is the foundation for Motion One, the raw API is verbose and error-prone. Motion One adds only 3.8KB for significant DX improvements (spring physics, sequencing, utility functions) while maintaining the same performance characteristics.

---

## Implementation Notes:

### 1. GPU Acceleration Configuration

```javascript
import { animate } from "motion"

// GPU-accelerated properties: transform and opacity
// These run on compositor thread, off main thread
animate(
  element,
  {
    // Use transform instead of top/left/width/height
    transform: ["translateX(0px)", "translateX(100px)"],
    // Opacity is also GPU-accelerated
    opacity: [0, 1]
  },
  {
    duration: 0.5,
    easing: "ease-out"
  }
)
```

**Key Principles:**
- **Always animate `transform` instead of positional properties** (`top`, `left`, `width`, `height`)
- **Use `opacity` instead of `display` or `visibility` for fade effects**
- **Avoid animating layout-triggering properties:** `padding`, `margin`, `border-width`
- **Avoid expensive paint properties:** `box-shadow`, `border-radius`, `background-image` (when possible)

**GPU-Accelerated Properties:**
- `transform: translate()`, `scale()`, `rotate()`, `skew()`
- `opacity`

**Non-Accelerated Properties (avoid animating):**
- Position: `top`, `left`, `right`, `bottom`
- Size: `width`, `height`, `padding`, `margin`
- Paint: `color`, `background-color`, `border-width`, `box-shadow`

---

### 2. Custom Easing Curve Syntax

Motion One uses standard CSS easing syntax:

```javascript
import { animate } from "motion"

// Predefined easings
animate(element, { opacity: 1 }, { easing: "ease-in-out" })

// Custom cubic-bezier curve
animate(
  element,
  { transform: "scale(1)" },
  {
    easing: "cubic-bezier(0.4, 0.0, 0.2, 1)", // Material Design standard easing
    duration: 0.3
  }
)

// Spring physics (Motion One exclusive feature)
animate(
  element,
  { transform: "translateY(0px)" },
  {
    easing: "spring(300, 10, 0)", // stiffness, damping, mass
    duration: 0.8
  }
)
```

**Common Custom Curves:**
```javascript
const easings = {
  // Material Design
  standard: "cubic-bezier(0.4, 0.0, 0.2, 1)",
  decelerate: "cubic-bezier(0.0, 0.0, 0.2, 1)",
  accelerate: "cubic-bezier(0.4, 0.0, 1, 1)",

  // iOS-style
  easeInOut: "cubic-bezier(0.42, 0.0, 0.58, 1.0)",

  // Custom overshoot (Y > 1 creates bounce effect)
  overshoot: "cubic-bezier(0.34, 1.56, 0.64, 1)",

  // Anticipation (negative Y creates backward motion first)
  anticipate: "cubic-bezier(0.36, -0.5, 0.64, 1.5)"
}
```

**Easing Curve Design Tools:**
- [cubic-bezier.com](https://cubic-bezier.com/) - Interactive curve editor
- [CSS Easing Generator](https://www.terrific.tools/code/css-easing-generator) - Visual bezier tool with presets
- Chrome DevTools > Elements > Styles > Click easing icon

---

### 3. Scroll-Linked Animation Pattern

**Hybrid Approach: CSS Scroll-Driven Animations + Motion One**

For simple scroll reveals, use pure CSS (0KB overhead):

```css
/* CSS Scroll-Driven Animation (Chrome 115+) */
@keyframes fade-in {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.reveal {
  animation: fade-in linear;
  animation-timeline: view(); /* Links animation to element entering viewport */
  animation-range: entry 0% entry 100%; /* Animates during entry phase */
}
```

**View Timeline (scroll-based trigger):**
```css
.scroll-reveal {
  animation: fade-in linear;
  animation-timeline: view();
  animation-range: entry 0% cover 30%; /* Start at entry, end at 30% coverage */
}
```

**Scroll Timeline (scroll position-based):**
```css
@keyframes parallax {
  to { transform: translateY(-50%); }
}

.parallax-bg {
  animation: parallax linear;
  animation-timeline: scroll(nearest); /* Nearest scrollable ancestor */
}
```

**For complex scroll interactions, use Motion One with IntersectionObserver:**

```javascript
import { animate, scroll } from "motion"

// Motion One's scroll utility (lightweight wrapper)
scroll(
  animate(element, {
    opacity: [0, 1],
    transform: ["translateY(20px)", "translateY(0px)"]
  }),
  {
    target: element,
    offset: ["start end", "end start"] // Animation range
  }
)
```

**Performance Notes:**
- CSS scroll-driven animations run on compositor thread (best performance)
- IntersectionObserver-based JS animations run on main thread but only trigger once per element
- Avoid `scroll` event listeners (main thread bottleneck, causes jank)

**Progressive Enhancement Pattern:**
```javascript
// Feature detection
if (CSS.supports('animation-timeline', 'view()')) {
  // Use CSS scroll-driven animations (best performance)
  element.classList.add('css-scroll-reveal')
} else {
  // Fallback to Motion One with IntersectionObserver
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animate(entry.target, { opacity: [0, 1] }, { duration: 0.5 })
        observer.unobserve(entry.target)
      }
    })
  })
  observer.observe(element)
}
```

---

### 4. Performance Optimization Checklist

**Bundle Size:**
- [ ] Import only needed Motion One functions (tree-shaking enabled)
- [ ] Use CSS scroll-driven animations for simple reveals (0KB)
- [ ] Lazy-load Motion One for below-the-fold animations
- [ ] Code-split animation-heavy routes

**Runtime Performance:**
- [ ] Animate only `transform` and `opacity` properties
- [ ] Use `will-change` sparingly and only before animation starts
- [ ] Remove `will-change` after animation completes
- [ ] Limit concurrent animations to <10 elements
- [ ] Use `transform: translateZ(0)` to force layer creation only when necessary

**Monitoring:**
- [ ] Measure FPS with Chrome DevTools Performance tab
- [ ] Check "Rendering" tab for layout thrashing and paint flashing
- [ ] Monitor bundle size with `bundlesize` or `size-limit` tools
- [ ] Test on low-end devices (throttle CPU 6x slowdown in DevTools)

**`will-change` Best Practices:**
```javascript
// GOOD: Apply before animation, remove after
element.style.willChange = 'transform, opacity'
await animate(element, { transform: "scale(1.2)" })
element.style.willChange = 'auto'

// BAD: Leave will-change active permanently
element.style.willChange = 'transform' // Memory leak!
```

---

### 5. Code Splitting Strategy

```javascript
// Route-level code splitting for animation-heavy pages
const AnimatedHero = lazy(() => import('./components/AnimatedHero'))

// Lazy-load Motion One for below-the-fold content
const loadMotion = () => import('motion').then(m => m.animate)

// Use IntersectionObserver to trigger animation import
const observer = new IntersectionObserver(async (entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      const animate = await loadMotion()
      animate(entry.target, { opacity: [0, 1] })
      observer.unobserve(entry.target)
    }
  }
})
```

---

### 6. Browser Support & Polyfills

**Motion One (WAAPI-based):**
- Chrome 36+, Firefox 48+, Safari 13.1+, Edge 79+
- IE11 requires `web-animations-js` polyfill (~15KB)

**CSS Scroll-Driven Animations:**
- Chrome 115+, Edge 115+ (Chromium-based)
- Firefox/Safari: Not yet supported (polyfill available: ~8KB)
- Graceful degradation: Use static state or IntersectionObserver fallback

**Polyfill Strategy:**
```javascript
// Conditional polyfill loading
if (!('animate' in Element.prototype)) {
  await import('web-animations-js') // 15KB polyfill
}

if (!CSS.supports('animation-timeline', 'view()')) {
  // Fallback to IntersectionObserver (no polyfill needed)
  useIntersectionObserverScrollAnimations()
}
```

---

### 7. Sample Implementation Architecture

**File Structure:**
```
src/
├── animations/
│   ├── config.js           # Easing curves, durations, constants
│   ├── scroll-reveals.css  # CSS scroll-driven animations
│   ├── hero.js             # Motion One hero animations
│   └── utils.js            # Animation helpers, feature detection
├── components/
│   ├── Hero.jsx            # Uses hero.js animations
│   └── ScrollSection.jsx   # Uses CSS scroll-reveals
└── main.js
```

**config.js:**
```javascript
export const easings = {
  standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  spring: 'spring(300, 10, 0)',
  overshoot: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
}

export const durations = {
  fast: 0.2,
  normal: 0.3,
  slow: 0.5
}

export const gpuProps = ['transform', 'opacity']
```

**utils.js:**
```javascript
export function supportsScrollTimeline() {
  return CSS.supports('animation-timeline', 'view()')
}

export function withWillChange(element, props, animationFn) {
  element.style.willChange = props.join(', ')
  return animationFn().then(() => {
    element.style.willChange = 'auto'
  })
}
```

---

## Performance Benchmarks

### Bundle Size Comparison (minified + gzipped)
| Library | Size | Tree-shakeable | GPU Acceleration |
|---------|------|----------------|------------------|
| **Motion One** | **3.8KB** | ✅ Yes | ✅ WAAPI |
| Framer Motion (optimized) | 4.6KB | ⚠️ LazyMotion | ✅ WAAPI |
| GSAP | 23KB | ❌ No | ⚠️ JS-based |
| anime.js | 27.6KB | ⚠️ v4 only | ⚠️ RAF-based |
| Framer Motion (standard) | 34KB | ⚠️ LazyMotion | ✅ WAAPI |
| Pure CSS | 0KB | N/A | ✅ Native |
| Vanilla WAAPI | 0KB | N/A | ✅ Native |

### Runtime Performance
- **Motion One:** 2.5x faster than GSAP for unknown values, 6x faster for type conversions
- **CSS Scroll Animations:** 60fps+ on compositor thread (best-in-class)
- **GSAP:** Highly optimized JS engine, 60fps achievable but main-thread bound
- **Framer Motion:** Similar to Motion One (WAAPI-based), slight overhead from React integration

---

## Canvas-Based Particle Animations (ParticleGrid Pattern)

For high-performance particle effects that fill large areas, raw Canvas 2D with ImageData manipulation provides the best performance. This section documents lessons learned from the ParticleGrid implementation.

### When to Use Canvas vs Motion One

| Use Case | Recommendation |
|----------|---------------|
| UI element animations | Motion One (WAAPI) |
| Scroll-linked reveals | CSS Scroll-Driven Animations |
| 1000+ animated elements | Canvas 2D with ImageData |
| Particle systems | Canvas 2D |
| Mouse-reactive backgrounds | Canvas 2D |

### Critical Implementation Rules

#### 1. Z-Index Layering with Content Above Canvas

When canvas is behind interactive content:
```
z-index: 1  → Canvas (background)
z-index: 5+ → Content wrapper (must have position: relative)
```

**Problem**: Content blocks mouse events from reaching canvas.
**Solution**: Attach pointer events to parent section, not canvas:

```javascript
// WRONG - events blocked by content layer
canvas.addEventListener('pointermove', handler);

// CORRECT - parent receives events regardless of z-index
const section = canvas.closest('section');
section.addEventListener('pointermove', handler);
```

#### 2. Coordinate System Consistency

Always use viewport-relative coordinates:

```javascript
// WRONG - pageX is document-relative, rect is viewport-relative
x = event.pageX - rect.left;  // Breaks when page is scrolled

// CORRECT - both are viewport-relative
x = event.clientX - rect.left;
y = event.clientY - rect.top;
```

#### 3. Performance Tuning

**Particle Distance** controls density vs performance:
- Distance 1-2: ~230,000 particles (may lag)
- Distance 5: ~36,000 particles (good balance)
- Distance 10: ~17,000 particles (smooth 60fps)

**Draw Loop Optimization**:
```javascript
// Cache everything outside the loop
const particles = state.particleHolder;
const data = state.data;
const w = state.w;
const len = state.particleHolderLength;

// Inline hot functions
const idx = (ix + iy * w) << 2;  // Bitwise shift for ×4
data[idx] = r;
data[idx + 1] = g;
data[idx + 2] = b;
data[idx + 3] = 255;
```

#### 4. Full Canvas Coverage

Remove artificial limits for edge-to-edge coverage:
```javascript
// Fill entire canvas
const rows = Math.floor(height / particleDistance);
const cols = Math.floor(width / particleDistance);
const marginLeft = 0;  // No centering margins
const marginTop = 0;
```

#### 5. Particle Behaviors

**Ease Behavior** (smooth, professional):
```javascript
// Push away based on force and density
const force = (sensitivitySq - distanceSquared) / sensitivitySq;
const invDist = force * density / distanceSquared;
x -= dx * invDist;
y -= dy * invDist;

// Ease back to origin
x += (originX - x) / speed;
y += (originY - y) / speed;
```

**Wobble Behavior** (playful, bouncy):
```javascript
// Spring physics return
vx = vx * wobbleFactor + (originX - x) * wobbleSpeed;
vy = vy * wobbleFactor + (originY - y) * wobbleSpeed;
x += vx;
y += vy;
```

### Reference Implementation

See `src/components/effects/ParticleGrid.jsx` for complete working code.

**CSS Requirements**:
```css
.particle-canvas {
  position: absolute;
  inset: 0;
  z-index: 1;
  touch-action: none;
  pointer-events: auto;
}
```

---

## Migration Path

If requirements change and Motion One becomes insufficient:

1. **Need React-specific features** → Migrate to Framer Motion (similar API, 0.8KB overhead)
2. **Need complex timeline sequencing** → Add GSAP for specific routes (code-split)
3. **Need SVG morphing** → Use GSAP's MorphSVG plugin (premium)
4. **Need 3D transforms** → Consider three.js or motion-canvas (different category)

Motion One's WAAPI foundation means most animations are transferable to other WAAPI-based libraries with minimal refactoring.

---

## References

- [Motion One Documentation](https://motion.dev)
- [CSS Scroll-Driven Animations Spec](https://drafts.csswg.org/scroll-animations-1/)
- [Web Animations API (WAAPI) - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API)
- [CSS Easing Functions - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/easing-function)
- [High Performance Animations - web.dev](https://web.dev/animations-guide/)

---

## Summary

For a high-performance pitch site prioritizing 60fps animations, <150KB bundles, and modern best practices, **Motion One paired with CSS scroll-driven animations** provides the optimal balance of performance, bundle size, and developer experience. The combination delivers:

- **3.8KB total overhead** (98% under budget)
- **Native GPU acceleration** via WAAPI
- **60fps+ scroll animations** on compositor thread
- **Custom cubic-bezier support** with clean syntax
- **Framework-agnostic** and future-proof
- **MIT licensed** (no commercial restrictions)

This approach prioritizes performance and bundle size while maintaining the flexibility to add more sophisticated animation features if requirements evolve.
