# Claude Code Guidelines for Portfolio Site

## Canvas Animation Implementation Guide

This guide documents the correct patterns for implementing performant canvas-based animations, based on lessons learned from the ParticleGrid implementation.

### Critical Rules for Canvas Animations

#### 1. Z-Index and Layer Management

When placing a canvas animation behind content:

```
Section Structure:
├── <section> (position: relative)
│   ├── Canvas (position: absolute, z-index: 1)
│   ├── Other background effects (z-index: 2-4)
│   └── .parallax-scene / content wrapper (position: relative, z-index: 5+)
```

**Key Rule**: Content must have higher z-index than canvas, but mouse events must be handled on the parent section (see below).

#### 2. Mouse Event Handling (CRITICAL)

**WRONG** - Attaching events to canvas when content is above it:
```javascript
// Events will be blocked by content layer above
canvas.addEventListener('pointermove', handlePointerMove);
```

**CORRECT** - Attach events to parent section:
```javascript
const section = canvas.closest('section') || canvas.parentElement;
section.addEventListener('pointermove', handlePointerMove);
section.addEventListener('pointerleave', handlePointerLeave);
```

**Why**: When content has a higher z-index than the canvas, it intercepts all pointer events. Attaching to the parent section captures events regardless of which child element is visually on top.

#### 3. Coordinate System for Mouse Position

**WRONG** - Mixing coordinate systems:
```javascript
// pageX is document-relative, rect is viewport-relative - BROKEN when scrolled
x = event.pageX - rect.left;
y = event.pageY - rect.top;
```

**CORRECT** - Use consistent viewport coordinates:
```javascript
const rect = canvas.getBoundingClientRect();
x = event.clientX - rect.left;
y = event.clientY - rect.top;
```

#### 4. Performance Optimization

**Particle Distance**: Controls density vs performance tradeoff
- Distance 1-2: Very dense, may lag on slower devices
- Distance 3-5: Good balance for most effects
- Distance 10+: Sparse but smooth 60fps guaranteed

**Draw Loop Optimizations**:
```javascript
// Cache frequently accessed values outside the loop
const particles = state.particleHolder;
const data = state.data;
const w = state.w;
const len = state.particleHolderLength;

// Inline critical functions (like setPixel) for hot loops
const idx = (ix + iy * w) << 2;  // Bitwise multiply by 4
data[idx] = r;
data[idx + 1] = g;
data[idx + 2] = b;
data[idx + 3] = 255;
```

**Full Canvas Coverage** (no margins):
```javascript
// Fill entire canvas - no artificial limits
const rows = Math.floor(state.h / particleDistance);
const cols = Math.floor(state.w / particleDistance);
const marginLeft = 0;
const marginTop = 0;
```

#### 5. Reduced Motion Support

Always check for user preference but don't break functionality:
```javascript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Still render the static visual, just skip animations
if (!prefersReducedMotion) {
  playIntroAnimation();
}

// IMPORTANT: Always add event listeners for interactivity
// Don't gate mouse tracking behind reduced motion check
section.addEventListener('pointermove', handlePointerMove);
```

### Animation Component Checklist

Before implementing any canvas-based animation:

- [ ] Canvas has `position: absolute` and low z-index (1-2)
- [ ] Content wrapper has `position: relative` and higher z-index (5+)
- [ ] Mouse events attached to parent section, not canvas
- [ ] Using `clientX/clientY` (not `pageX/pageY`) for coordinates
- [ ] Particle/element count tested for 60fps on target devices
- [ ] No artificial row/col limits if full coverage needed
- [ ] Reduced motion preference checked but doesn't break interactivity
- [ ] Event listeners cleaned up in useEffect return

### File Structure for Animation Components

```
src/components/effects/
├── AnimationName.jsx      # Component logic
├── AnimationName.css      # Positioning, z-index
└── index.js               # Export
```

### CSS Requirements for Animation Canvas

```css
.animation-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 1;              /* Below content */
  display: block;
  touch-action: none;      /* Prevent scroll interference */
  pointer-events: auto;    /* Can receive events if needed */
}
```

### Reference Implementations

**ParticleGrid** (`src/components/effects/ParticleGrid.jsx`):
- Grid-based particle system with mouse reactivity
- Ease-based particle behavior
- Optimized draw loop with cached values

**SwarmAnimation** (`src/components/effects/SwarmAnimation.jsx`):
- Perlin noise flowing particles with trails
- Click-and-drag attraction
- Additive blending with fade overlay

**DriftAnimation** (`src/components/effects/DriftAnimation.jsx`):
- Organic drifting particles spawning in circle
- Permanent trails (no canvas clear)
- Click to reset
- Used in split hero layout (PressPage)

---

## Adding Animations to Pages

### Method 1: Standalone Pages (Direct Import)

For pages like `AboutPage.jsx` that don't use `BaseSection`:

```jsx
// 1. Import the animation component
import SwarmAnimation from '../components/effects/SwarmAnimation.jsx';

// 2. Add inside the hero section (which has position: relative)
<section className="page-hero">
  <SwarmAnimation />
  <div className="hero-content">
    {/* Content here - already has z-index: 5 */}
  </div>
</section>
```

**Why this works immediately:**
- `.page-hero` already has `position: relative` (Page.css)
- `.hero-content` already has `z-index: 5` (Page.css)
- Animation components use `z-index: 1` and attach events to parent `<section>`

### Method 2: BaseSection Pages (Background Effects)

For sections using `BaseSection`, use the `backgroundEffects` prop:

```jsx
<BaseSection
  sectionId="my-section"
  backgroundEffects={{
    showParticleGrid: true,      // For ParticleGrid
    // showSwarmAnimation: true, // For SwarmAnimation (add to BaseSection first)
  }}
  renderContent={(data) => <>{/* content */}</>}
/>
```

**To add a new animation to BaseSection:**
1. Import in `BaseSection.jsx`
2. Add conditional render: `{backgroundEffects.showNewAnimation && <NewAnimation />}`
3. Animation will inherit proper layering from BaseSection structure

### Quick Reference: Page Types

| Page Type | Animation Method | Example |
|-----------|-----------------|---------|
| Standalone page | Direct import into `<section>` | AboutPage, PressPage |
| BaseSection page | `backgroundEffects` prop | IntroSection, ProvenExcellence |

---

## Split Hero Layouts (Text + Animation Side-by-Side)

When you need text on one side and an animation on the other (e.g., PressPage), follow this pattern:

### Structure

```jsx
<section className="page-hero page-hero-split">
  <DriftAnimation />
  <div className="hero-content hero-content-left">
    <h1>Title</h1>
    <p className="hero-subtitle">Subtitle text</p>
  </div>
</section>
```

**Key points:**
- Animation component goes directly in the section (no wrapper containers)
- Content uses `.hero-content-left` modifier class
- Add `.page-hero-split` class to the section

### CSS for Split Layout

```css
/* Override hero's default centering */
.page-hero-split {
  overflow: hidden;              /* Clip animation at boundaries */
  justify-content: flex-start;   /* Align content to left, not center */
}

.page-hero-split .hero-content-left {
  text-align: left;
  padding-left: clamp(1.5rem, 5vw, 4rem);
  max-width: 50%;                /* Constrain text to left half */
}

.page-hero-split .hero-content-left .hero-subtitle {
  margin: 0;                     /* Remove auto-centering margin */
}
```

### Positioning Animation to a Screen Region

To position an animation in a specific region while preserving its aspect ratio:

**DON'T** change the canvas width - this distorts the animation:
```css
/* BAD - changes aspect ratio */
.animation {
  left: 50%;
  width: 50%;  /* Animation renders at half size, looks squished */
}
```

**DO** keep full width and shift position, using overflow to clip:
```css
/* GOOD - preserves aspect ratio */
.page-hero-split {
  overflow: hidden;  /* Clip what extends beyond */
}

.page-hero-split .animation {
  left: 25%;         /* Shift position */
  width: 100%;       /* Keep original size/aspect ratio */
}
```

### Calculating Position for Centered Animation

To center an animation within a specific screen region:

| Desired Center | Canvas Width | Left Value | Calculation |
|---------------|--------------|------------|-------------|
| 50% (center) | 100% | 0% | center - (width/2) = 50 - 50 = 0 |
| 75% (right half center) | 100% | 25% | 75 - 50 = 25 |
| 25% (left half center) | 100% | -25% | 25 - 50 = -25 |

**Example**: Center animation in the right half of screen (center at 75%):
```css
.page-hero-split .drift-animation {
  left: 25%;    /* 75% - 50% = 25% */
  width: 100%;
}
```

### Mobile Responsive

On mobile, stack content and show full-width animation behind:

```css
@media (max-width: 900px) {
  .page-hero-split .hero-content-left {
    text-align: center;
    max-width: 100%;
  }

  .page-hero-split .drift-animation {
    left: 0;
    width: 100%;
    opacity: 0.5;  /* Fade so text is readable */
  }
}
```

### Reference Implementation

**PressPage** (`src/pages/PressPage.jsx`):
- DriftAnimation positioned in right half
- Text aligned left
- Uses `.page-hero-split` layout pattern

---

## Full-Page Parallax Background System

The site uses a global `PageBackground` component that renders a ParticleGrid behind all page content with a 0.2x parallax scroll effect. This section documents how it works and critical implementation details.

### Architecture Overview

```
App.jsx
├── NoiseOverlay (z-index: 35, fixed, pointer-events: none)
├── ParticleSystem (floating particles)
├── PageBackground (z-index: 0, fixed) ← Contains ParticleGrid
├── Navigation (z-index: high, fixed)
└── main.main-content (z-index: 1, relative)
    └── Page components (transparent backgrounds)
```

**Key files:**
- `src/components/effects/PageBackground.jsx` - Container with parallax logic
- `src/components/effects/PageBackground.css` - Positioning and z-index
- `src/components/effects/ParticleGrid.jsx` - Canvas animation

### How the Parallax Works

1. **Container Setup**: PageBackground is `position: fixed` at `top: 0`, covering viewport
2. **Dynamic Height**: Container height = `viewport + (maxScroll × 0.2)` to ensure coverage
3. **Scroll Transform**: On scroll, container translates by `-scrollY × 0.2` (moves UP slower than content)
4. **Result**: Background scrolls at 20% of content speed, creating depth illusion

```javascript
// PageBackground.jsx - Key logic
const PARALLAX_FACTOR = 0.2;

// Calculate height to cover entire scroll depth
const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
const maxOffset = maxScroll * PARALLAX_FACTOR;
const requiredHeight = window.innerHeight + maxOffset;

// On scroll - NEGATIVE offset moves background UP
const yOffset = -scrollY * PARALLAX_FACTOR;
container.style.transform = `translate3d(0, ${yOffset}px, 0)`;
```

### Critical Implementation Details

#### 1. Parallax Direction (CRITICAL)

**WRONG** - Positive offset causes blank space above:
```javascript
// Background moves DOWN, revealing empty space at top when scrolling
const yOffset = scrollY * 0.2;  // BROKEN
```

**CORRECT** - Negative offset reveals bottom portion:
```javascript
// Background moves UP slower than content, revealing bottom as you scroll
const yOffset = -scrollY * 0.2;  // CORRECT
```

#### 2. Canvas Aspect Ratio (CRITICAL)

The ParticleGrid base CSS has `width: 100%; height: 100%` which STRETCHES the canvas, distorting circles into ovals.

**WRONG** - Let base CSS stretch canvas:
```css
/* ParticleGrid.css default - causes distortion */
.particle-grid {
  width: 100%;
  height: 100%;
}
```

**CORRECT** - Override with auto sizing:
```css
/* PageBackground.css - preserves pixel ratio */
.page-background .page-background-particles {
  width: auto;
  height: auto;
  inset: auto;
}
```

#### 3. Mouse Event Handling for Page-Level Background

When ParticleGrid is inside a `<section>`, events attach to the section. When used as page background (no section parent), events must attach to `document`:

```javascript
// ParticleGrid.jsx - Event attachment logic
const section = canvas.closest('section');
const eventTarget = section || document;  // Fallback to document for page background

eventTarget.addEventListener('pointermove', handlePointerMove);
```

**Why document?** The page-background (z-index: 0) is BELOW main-content (z-index: 1). Mouse events go to the higher z-index element. Attaching to `document` captures all events regardless of z-index.

#### 4. Container ResizeObserver

ParticleGrid must reinitialize when its container size changes (e.g., when PageBackground calculates dynamic height):

```javascript
// ParticleGrid.jsx - Watch container for size changes
const container = canvas.parentElement;
const resizeObserver = new ResizeObserver(() => {
  handleResize();  // Reinitialize canvas with new dimensions
});
resizeObserver.observe(container);
```

Without this, the canvas initializes at wrong size and never updates.

#### 5. Transparent Section Backgrounds

All sections must have transparent backgrounds to show the PageBackground through:

```css
/* Remove section gradients */
.section-depth-showcase,
.section-strategic-vision {
  background: transparent;  /* Not gradient */
}

/* Remove pseudo-element overlays */
.page-hero::before,
.page-hero::after,
.page-section::before,
.page-section::after {
  /* These are removed - no gradient overlays */
}
```

### PageBackground Checklist

When modifying the background system:

- [ ] Parallax uses NEGATIVE offset (`-scrollY * factor`)
- [ ] Container height accounts for scroll depth: `viewport + maxScroll * factor`
- [ ] Canvas CSS has `width: auto; height: auto` to prevent stretching
- [ ] ParticleGrid has ResizeObserver on container
- [ ] ParticleGrid attaches events to `document` when no section parent
- [ ] All page sections have `background: transparent`
- [ ] No pseudo-element overlays (`::before`, `::after`) blocking visibility
- [ ] Body background matches ParticleGrid background color (`#111111`)

### Common Bugs and Fixes

| Symptom | Cause | Fix |
|---------|-------|-----|
| Blank space above background when scrolling | Positive parallax offset | Use negative: `-scrollY * 0.2` |
| Circles appear as ovals | CSS stretching canvas | Set `width: auto; height: auto` |
| Mouse effect offset from cursor | Canvas stretched or wrong coordinates | Fix CSS stretching, use `clientX/Y` |
| Mouse interaction not working | Events attached to wrong element | Attach to `document` for page background |
| Background doesn't cover full page | Height not calculated for scroll | Use `viewport + maxScroll * factor` |
| Canvas wrong size on load | Timing issue with dynamic height | Add ResizeObserver on container |

### Z-Index Reference

```
z-index: 35  - NoiseOverlay (texture, pointer-events: none)
z-index: 30  - Navigation
z-index: 5   - Section content (.parallax-scene, .hero-content)
z-index: 1   - main.main-content
z-index: 0   - PageBackground (ParticleGrid)
z-index: -1  - ParallaxBackground (disabled gradients)
```

