import { useEffect, useRef, useCallback } from 'react';
import './ParticleGrid.css';

/**
 * ParticleGrid - Interactive particle system background
 *
 * Based on Niklas Knaack's 30,000 Particles CodePen
 * Particles react to mouse movement with wobble behavior
 */
function ParticleGrid({ className = '' }) {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const reducedMotionRef = useRef(false);
  const stateRef = useRef({
    w: 0,
    h: 0,
    imageData: null,
    data: null,
    particleHolder: null,
    particleHolderLength: 0,
    pointerPos: { x: -10000, y: -10000 },
    introPath: [],
    introIndex: 0,
    introInterval: null,
    pointerMoveTimeout: null,
    clearRow: null,
    clearRowSize: 0,
  });

  // Configuration - optimized for full coverage and smooth 60fps
  const config = useRef({
    particlePropertiesCount: 12,
    particleDiameter: 1,
    particleDistance: 10,  // Increased for smooth 60fps performance
    particleSpeed: 10,
    particleColorRGB: { r: 220, g: 220, b: 220 },
    particleMouseDistanceSensitivityMax: 250,
    particleMouseDistanceSensitivityMin: 100,
    particleDistanceSensitivity: 100,
    particleMaxEscapeRouteLength: 100,
    particleWobbleFactor: 0.95,
    particleWobbleSpeed: 0.05,
    particleMinDensity: 100,
    particleMaxDensity: 500,
    bgColorR: 17,  // Dark background (#111111)
    bgColorG: 17,
    bgColorB: 17,
    introPathCoordinatesCount: 256,
    introSpeed: 15,
    pointerMoveTimeoutTime: 3500,
  });

  const setPixel = useCallback((data, imageWidth, x, y, r, g, b, a) => {
    const i = (x + y * imageWidth) * 4;
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
    data[i + 3] = a;
  }, []);

  const setClearImageData = useCallback(() => {
    const state = stateRef.current;
    const cfg = config.current;

    const clearPixelData = [cfg.bgColorR, cfg.bgColorG, cfg.bgColorB, 255];
    state.clearRowSize = state.w * 4;
    state.clearRow = new Uint8ClampedArray(state.clearRowSize);

    for (let i = 0; i < state.clearRowSize; i += 4) {
      state.clearRow.set(clearPixelData, i);
    }
  }, []);

  const clearImageData = useCallback(() => {
    const state = stateRef.current;
    for (let y = 0; y < state.h; y++) {
      state.data.set(state.clearRow, y * state.clearRowSize);
    }
  }, []);

  const addParticles = useCallback(() => {
    const state = stateRef.current;
    const cfg = config.current;

    const pd = cfg.particleDiameter + cfg.particleDistance;
    // Fill entire canvas - no row/col limits, no margins
    const rows = Math.floor(state.h / pd);
    const cols = Math.floor(state.w / pd);

    const particleCount = rows * cols;
    state.particleHolderLength = particleCount * cfg.particlePropertiesCount;
    state.particleHolder = new Float32Array(state.particleHolderLength);

    let index = 0;
    // No margins - start from edge
    const marginLeft = 0;
    const marginTop = 0;

    for (let i = 0; i < state.particleHolderLength; i += cfg.particlePropertiesCount) {
      const x = marginLeft + (index % cols) * pd;
      const y = marginTop + Math.floor(index / cols) * pd;
      const density = Math.floor(Math.random() * (cfg.particleMaxDensity - cfg.particleMinDensity + 1) + cfg.particleMinDensity);

      state.particleHolder[i] = x;       // x
      state.particleHolder[i + 1] = y;   // y
      state.particleHolder[i + 2] = x;   // cx (center x)
      state.particleHolder[i + 3] = y;   // cy (center y)
      state.particleHolder[i + 4] = 0;   // vx
      state.particleHolder[i + 5] = 0;   // vy
      state.particleHolder[i + 6] = Math.random() * 0.06 + 0.93; // speed
      state.particleHolder[i + 7] = cfg.particleColorRGB.r;
      state.particleHolder[i + 8] = cfg.particleColorRGB.g;
      state.particleHolder[i + 9] = cfg.particleColorRGB.b;
      state.particleHolder[i + 10] = 0;  // activeTime
      state.particleHolder[i + 11] = density;

      index++;
    }
  }, []);

  const initIntroPath = useCallback(() => {
    const state = stateRef.current;
    const cfg = config.current;

    state.introPath = [];
    const numPoints = cfg.introPathCoordinatesCount;
    const radiusX = state.w / 4;
    const radiusY = state.h / 3;
    const centerX = state.w / 2;
    const centerY = state.h / 2;

    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * 2 * Math.PI;
      const x = centerX + radiusX * Math.cos(angle);
      const y = centerY + radiusY * Math.sin(2 * angle) / 2;
      state.introPath.push({ x, y });
    }
  }, []);

  const stopIntro = useCallback(() => {
    const state = stateRef.current;

    if (state.pointerMoveTimeout) {
      clearTimeout(state.pointerMoveTimeout);
      state.pointerMoveTimeout = null;
    }

    if (state.introInterval) {
      clearInterval(state.introInterval);
      state.introInterval = null;
    }
  }, []);

  const playIntro = useCallback(() => {
    const state = stateRef.current;
    const cfg = config.current;

    state.introInterval = setInterval(() => {
      const pos = state.introPath[state.introIndex];
      if (pos) {
        state.pointerPos = pos;
        state.introIndex++;
        if (state.introIndex >= state.introPath.length - 1) {
          state.introIndex = 0;
        }
      }
    }, cfg.introSpeed);
  }, []);

  const draw = useCallback(() => {
    const state = stateRef.current;
    const cfg = config.current;

    if (!state.particleHolder || !state.data) return;

    // Cache values for performance
    const particles = state.particleHolder;
    const data = state.data;
    const w = state.w;
    const h = state.h;
    const len = state.particleHolderLength;
    const step = cfg.particlePropertiesCount;
    const speed = cfg.particleSpeed;
    const sensitivity = cfg.particleDistanceSensitivity;
    const sensitivitySq = sensitivity * sensitivity;
    const px = state.pointerPos.x;
    const py = state.pointerPos.y;

    for (let i = 0; i < len; i += step) {
      let x = particles[i];
      let y = particles[i + 1];
      const cx = particles[i + 2];
      const cy = particles[i + 3];
      let activeTime = particles[i + 10];

      const da = px - cx;
      const db = py - cy;
      const distToCenterSq = da * da + db * db;

      if (distToCenterSq <= sensitivitySq) {
        // Ease behavior: particles pushed away based on force and density
        const dx = px - x;
        const dy = py - y;
        const distanceSquared = dx * dx + dy * dy;

        if (distanceSquared > 0) {
          const density = particles[i + 11];
          const force = (sensitivitySq - distanceSquared) / sensitivitySq;
          const invDist = force * density / distanceSquared;
          x -= dx * invDist;
          y -= dy * invDist;
        }
        activeTime = 0.3;
      } else if (activeTime > 0) {
        activeTime -= 0.005;
        // Ease back to original position
        x += (cx - x) / speed;
        y += (cy - y) / speed;
      } else {
        x = cx;
        y = cy;
      }

      particles[i] = x;
      particles[i + 1] = y;
      particles[i + 10] = activeTime;

      // Inline setPixel for performance
      const ix = x | 0;
      const iy = y | 0;
      if (ix > 0 && ix < w && iy > 0 && iy < h) {
        const idx = (ix + iy * w) << 2;
        data[idx] = particles[i + 7];
        data[idx + 1] = particles[i + 8];
        data[idx + 2] = particles[i + 9];
        data[idx + 3] = 255;
      }
    }
  }, []);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const state = stateRef.current;

    if (!canvas || !state.imageData) return;

    const context = canvas.getContext('2d', { willReadFrequently: false, alpha: false });

    clearImageData();
    draw();
    context.putImageData(state.imageData, 0, 0);

    animationFrameRef.current = requestAnimationFrame(render);
  }, [clearImageData, draw]);

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const state = stateRef.current;

    // Cancel current animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    stopIntro();

    // Get container dimensions - use multiple fallbacks
    const container = canvas.parentElement;
    const containerWidth = container?.clientWidth || 0;
    const containerHeight = container?.clientHeight || 0;

    // Use container dimensions, fallback to window
    state.w = containerWidth > 0 ? containerWidth : window.innerWidth;
    state.h = containerHeight > 0 ? containerHeight : window.innerHeight;

    // Ensure we have valid dimensions
    if (state.w <= 0 || state.h <= 0) {
      setTimeout(handleResize, 100);
      return;
    }

    canvas.width = state.w;
    canvas.height = state.h;

    const context = canvas.getContext('2d', { willReadFrequently: false, alpha: false });
    state.imageData = context.getImageData(0, 0, state.w, state.h);
    state.data = state.imageData.data;

    state.pointerPos = { x: -10000, y: -10000 };
    state.introIndex = 0;

    setClearImageData();
    addParticles();
    initIntroPath();

    // Only play intro animation if reduced motion is not preferred
    if (!reducedMotionRef.current) {
      playIntro();
    }

    render();
  }, [stopIntro, setClearImageData, addParticles, initIntroPath, playIntro, render]);

  const handlePointerMove = useCallback((event) => {
    const canvas = canvasRef.current;
    const state = stateRef.current;
    const cfg = config.current;

    if (!canvas) return;

    stopIntro();

    if (state.pointerMoveTimeout) {
      clearTimeout(state.pointerMoveTimeout);
    }

    state.pointerMoveTimeout = setTimeout(() => {
      playIntro();
    }, cfg.pointerMoveTimeoutTime);

    const rect = canvas.getBoundingClientRect();
    let x, y;

    if (event.type === 'touchmove') {
      x = event.touches[0].clientX - rect.left;
      y = event.touches[0].clientY - rect.top;
    } else {
      x = event.clientX - rect.left;
      y = event.clientY - rect.top;
    }

    state.pointerPos = { x, y };
  }, [stopIntro, playIntro]);

  const handlePointerLeave = useCallback(() => {
    stateRef.current.pointerPos = { x: -10000, y: -10000 };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check for reduced motion preference (still render, but skip animations)
    reducedMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Find the parent section to attach events (content is above canvas, blocking events)
    // If no section parent (page-level background), use document for events
    const section = canvas.closest('section');
    const eventTarget = section || document;

    // Initialize with a small delay to ensure DOM is ready
    const initTimer = setTimeout(() => {
      handleResize();
    }, 50);

    // Event listeners
    window.addEventListener('resize', handleResize);

    // Attach pointer listeners - to section if inside one, otherwise document
    eventTarget.addEventListener('pointermove', handlePointerMove);
    eventTarget.addEventListener('touchmove', handlePointerMove);
    if (section) {
      // Only attach leave events to section (document doesn't have meaningful leave)
      section.addEventListener('pointerleave', handlePointerLeave);
      section.addEventListener('touchend', handlePointerLeave);
    }

    return () => {
      clearTimeout(initTimer);

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      stopIntro();

      window.removeEventListener('resize', handleResize);
      eventTarget.removeEventListener('pointermove', handlePointerMove);
      eventTarget.removeEventListener('touchmove', handlePointerMove);
      if (section) {
        section.removeEventListener('pointerleave', handlePointerLeave);
        section.removeEventListener('touchend', handlePointerLeave);
      }
    };
  }, [handleResize, handlePointerMove, handlePointerLeave, stopIntro]);

  return (
    <canvas
      ref={canvasRef}
      className={`particle-grid ${className}`}
      aria-hidden="true"
    />
  );
}

export default ParticleGrid;
