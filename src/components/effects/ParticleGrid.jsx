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

  // Configuration
  const config = useRef({
    rowsInit: 300,
    colsInit: 700,
    particlePropertiesCount: 12,
    particleDiameter: 1,
    particleDistance: 1,
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
    bgColorR: 255, // DEBUG: bright red to verify canvas visibility
    bgColorG: 0,
    bgColorB: 0,
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
    const rowsMax = Math.floor(state.h / pd);
    const colsMax = Math.floor(state.w / pd);

    const rows = Math.min(cfg.rowsInit, rowsMax);
    const cols = Math.min(cfg.colsInit, colsMax);

    const particleCount = rows * cols;
    state.particleHolderLength = particleCount * cfg.particlePropertiesCount;
    state.particleHolder = new Float32Array(state.particleHolderLength);

    let index = 0;
    const marginLeft = Math.round((state.w - (cols * pd)) * 0.5);
    const marginTop = Math.round((state.h - (rows * pd)) * 0.5);

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

    const left = 1;
    const right = state.w;
    const top = 1;
    const bottom = state.h;

    const particleDistanceSensitivitySquared = cfg.particleDistanceSensitivity * cfg.particleDistanceSensitivity;
    const px = state.pointerPos.x;
    const py = state.pointerPos.y;

    for (let i = 0; i < state.particleHolderLength; i += cfg.particlePropertiesCount) {
      let x = state.particleHolder[i];
      let y = state.particleHolder[i + 1];
      const cx = state.particleHolder[i + 2];
      const cy = state.particleHolder[i + 3];
      let vx = state.particleHolder[i + 4];
      let vy = state.particleHolder[i + 5];
      const r = state.particleHolder[i + 7];
      const g = state.particleHolder[i + 8];
      const b = state.particleHolder[i + 9];
      let activeTime = state.particleHolder[i + 10];

      const da = px - cx;
      const db = py - cy;
      const particleActive = da * da + db * db <= particleDistanceSensitivitySquared;

      if (particleActive) {
        const angle = Math.atan2(db, da);
        const dirX = Math.cos(angle) * -1;
        const dirY = Math.sin(angle) * -1;
        const targetPosX = cx + dirX * cfg.particleMaxEscapeRouteLength;
        const targetPosY = cy + dirY * cfg.particleMaxEscapeRouteLength;

        x += (targetPosX - x) / cfg.particleSpeed;
        y += (targetPosY - y) / cfg.particleSpeed;
        activeTime = 1;
      } else {
        activeTime -= 0.005;

        if (activeTime > 0) {
          vx = vx * cfg.particleWobbleFactor + (cx - x) * cfg.particleWobbleSpeed;
          vy = vy * cfg.particleWobbleFactor + (cy - y) * cfg.particleWobbleSpeed;
          x = x + vx;
          y = y + vy;
        } else {
          x = cx;
          y = cy;
        }
      }

      state.particleHolder[i] = x;
      state.particleHolder[i + 1] = y;
      state.particleHolder[i + 4] = vx;
      state.particleHolder[i + 5] = vy;
      state.particleHolder[i + 10] = activeTime;

      if (x > left && x < right && y > top && y < bottom) {
        setPixel(state.data, state.w, x | 0, y | 0, r, g, b, 255);
      }
    }
  }, [setPixel]);

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

    // Use container dimensions, fallback to window, ensure minimum size
    state.w = containerWidth > 0 ? containerWidth : window.innerWidth;
    state.h = containerHeight > 0 ? containerHeight : window.innerHeight;

    // Ensure we have valid dimensions
    if (state.w <= 0 || state.h <= 0) {
      // eslint-disable-next-line no-console
      console.warn('[ParticleGrid] Invalid dimensions, retrying in 100ms');
      setTimeout(handleResize, 100);
      return;
    }

    canvas.width = state.w;
    canvas.height = state.h;

    // eslint-disable-next-line no-console
    console.log('[ParticleGrid] Canvas size:', state.w, 'x', state.h);

    const context = canvas.getContext('2d', { willReadFrequently: false, alpha: false });
    state.imageData = context.getImageData(0, 0, state.w, state.h);
    state.data = state.imageData.data;

    state.pointerPos = { x: -10000, y: -10000 };
    state.introIndex = 0;

    setClearImageData();
    addParticles();
    initIntroPath();
    playIntro();
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
      x = event.touches[0].pageX - rect.left;
      y = event.touches[0].pageY - rect.top;
    } else {
      x = event.pageX - rect.left;
      y = event.pageY - rect.top;
    }

    state.pointerPos = { x, y };
  }, [stopIntro, playIntro]);

  const handlePointerLeave = useCallback(() => {
    stateRef.current.pointerPos = { x: -10000, y: -10000 };
  }, []);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      // eslint-disable-next-line no-console
      console.log('[ParticleGrid] Reduced motion preferred - skipping');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      // eslint-disable-next-line no-console
      console.log('[ParticleGrid] No canvas ref');
      return;
    }

    // eslint-disable-next-line no-console
    console.log('[ParticleGrid] Initializing...');

    // Initialize
    handleResize();

    // Event listeners
    window.addEventListener('resize', handleResize);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('touchmove', handlePointerMove);
    canvas.addEventListener('pointerleave', handlePointerLeave);
    canvas.addEventListener('touchend', handlePointerLeave);

    return () => {
      // Cleanup
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      stopIntro();

      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('touchmove', handlePointerMove);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
      canvas.removeEventListener('touchend', handlePointerLeave);
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
