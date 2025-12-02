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

### Reference Implementation

See `src/components/effects/ParticleGrid.jsx` for a complete working example of:
- Proper event handling on parent section
- Optimized draw loop with cached values
- Full canvas coverage without margins
- Ease-based particle behavior
- Correct coordinate calculations
