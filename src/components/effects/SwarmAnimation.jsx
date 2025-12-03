import { useEffect, useRef, useCallback } from 'react';
import './SwarmAnimation.css';

/**
 * SwarmAnimation - Perlin noise-based particle swarm
 *
 * Particles flow organically using simplex noise, with mouse interaction.
 * Based on swarm animation pattern with fade trails.
 */
function SwarmAnimation({ className = '' }) {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const stateRef = useRef({
    width: 0,
    height: 0,
    particles: [],
    mousePos: { x: -10000, y: -10000 },
    mouseDown: false,
    perlin: null,
    bounds: { x: 0, y: 0 },
  });

  // Configuration
  const config = useRef({
    particleCount: 3000,
    fadeOverlay: true,
    staticColor: 'rgba(255, 255, 255, 0.55)', // White with alpha
    trailFade: 'rgba(0, 0, 0, 0.085)',
  });

  // Simple seeded random number generator
  const createRandom = useCallback(() => {
    let seed = Date.now();
    return {
      random: (min, max) => {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        const val = seed / 0x7fffffff;
        if (min !== undefined && max !== undefined) {
          return min + val * (max - min);
        }
        return val;
      }
    };
  }, []);

  // Vector3D class
  const createVector = useCallback((x = 0, y = 0, z = 0) => ({
    x, y, z,
    set(nx, ny, nz) { this.x = nx; this.y = ny; this.z = nz; return this; },
    add(other) {
      if (typeof other === 'number') {
        this.x += other; this.y += other; this.z += other;
      } else {
        this.x += other.x; this.y += other.y; this.z += other.z;
      }
      return this;
    },
    sub(other) {
      if (typeof other === 'number') {
        this.x -= other; this.y -= other; this.z -= other;
      } else {
        this.x -= other.x; this.y -= other.y; this.z -= other.z;
      }
      return this;
    },
    mul(val) {
      this.x *= val; this.y *= val; this.z *= val;
      return this;
    },
    clone() { return createVector(this.x, this.y, this.z); },
    distance(other) {
      const dx = this.x - other.x;
      const dy = this.y - other.y;
      return Math.sqrt(dx * dx + dy * dy);
    },
    dot3d(x, y, z) { return this.x * x + this.y * y + this.z * z; },
    wrap2d(bounds) {
      if (this.x > bounds.x) { this.x = 0; return true; }
      if (this.x < 0) { this.x = bounds.x; return true; }
      if (this.y > bounds.y) { this.y = 0; return true; }
      if (this.y < 0) { this.y = bounds.y; return true; }
      return false;
    },
    moveTo(dest) { dest.x = this.x; dest.y = this.y; dest.z = this.z; return this; }
  }), []);

  // Perlin noise generator
  const createPerlin = useCallback(() => {
    const grad3 = [
      createVector(1,1,0), createVector(-1,1,0), createVector(1,-1,0), createVector(-1,-1,0),
      createVector(1,0,1), createVector(-1,0,1), createVector(1,0,-1), createVector(-1,0,-1),
      createVector(0,1,1), createVector(0,-1,1), createVector(0,1,-1), createVector(0,-1,-1)
    ];

    const p = [
      0x97, 0xa0, 0x89, 0x5b, 0x5a, 0x0f, 0x83, 0x0d, 0xc9, 0x5f, 0x60, 0x35, 0xc2, 0xe9, 0x07, 0xe1,
      0x8c, 0x24, 0x67, 0x1e, 0x45, 0x8e, 0x08, 0x63, 0x25, 0xf0, 0x15, 0x0a, 0x17, 0xbe, 0x06, 0x94,
      0xf7, 0x78, 0xea, 0x4b, 0x00, 0x1a, 0xc5, 0x3e, 0x5e, 0xfc, 0xdb, 0xcb, 0x75, 0x23, 0x0b, 0x20,
      0x39, 0xb1, 0x21, 0x58, 0xed, 0x95, 0x38, 0x57, 0xae, 0x14, 0x7d, 0x88, 0xab, 0xa8, 0x44, 0xaf,
      0x4a, 0xa5, 0x47, 0x86, 0x8b, 0x30, 0x1b, 0xa6, 0x4d, 0x92, 0x9e, 0xe7, 0x53, 0x6f, 0xe5, 0x7a,
      0x3c, 0xd3, 0x85, 0xe6, 0xdc, 0x69, 0x5c, 0x29, 0x37, 0x2e, 0xf5, 0x28, 0xf4, 0x66, 0x8f, 0x36,
      0x41, 0x19, 0x3f, 0xa1, 0x01, 0xd8, 0x50, 0x49, 0xd1, 0x4c, 0x84, 0xbb, 0xd0, 0x59, 0x12, 0xa9,
      0xc8, 0xc4, 0x87, 0x82, 0x74, 0xbc, 0x9f, 0x56, 0xa4, 0x64, 0x6d, 0xc6, 0xad, 0xba, 0x03, 0x40,
      0x34, 0xd9, 0xe2, 0xfa, 0x7c, 0x7b, 0x05, 0xca, 0x26, 0x93, 0x76, 0x7e, 0xff, 0x52, 0x55, 0xd4,
      0xcf, 0xce, 0x3b, 0xe3, 0x2f, 0x10, 0x3a, 0x11, 0xb6, 0xbd, 0x1c, 0x2a, 0xdf, 0xb7, 0xaa, 0xd5,
      0x77, 0xf8, 0x98, 0x02, 0x2c, 0x9a, 0xa3, 0x46, 0xdd, 0x99, 0x65, 0x9b, 0xa7, 0x2b, 0xac, 0x09,
      0x81, 0x16, 0x27, 0xfd, 0x13, 0x62, 0x6c, 0x6e, 0x4f, 0x71, 0xe0, 0xe8, 0xb2, 0xb9, 0x70, 0x68,
      0xda, 0xf6, 0x61, 0xe4, 0xfb, 0x22, 0xf2, 0xc1, 0xee, 0xd2, 0x90, 0x0c, 0xbf, 0xb3, 0xa2, 0xf1,
      0x51, 0x33, 0x91, 0xeb, 0xf9, 0x0e, 0xef, 0x6b, 0x31, 0xc0, 0xd6, 0x1f, 0xb5, 0xc7, 0x6a, 0x9d,
      0xb8, 0x54, 0xcc, 0xb0, 0x73, 0x79, 0x32, 0x2d, 0x7f, 0x04, 0x96, 0xfe, 0x8a, 0xec, 0xcd, 0x5d,
      0xde, 0x72, 0x43, 0x1d, 0x18, 0x48, 0xf3, 0x8d, 0x80, 0xc3, 0x4e, 0x42, 0xd7, 0x3d, 0x9c, 0xb4
    ];

    const permutation = new Array(512);
    const gradP = new Array(512);
    const F3 = 1 / 3;
    const G3 = 1 / 6;

    // Initialize with random values
    const rng = createRandom();
    for (let i = 0; i < 256; i++) {
      const randval = (p[i] ^ Math.floor(rng.random(0, 255)));
      permutation[i] = permutation[i + 256] = randval;
      gradP[i] = gradP[i + 256] = grad3[randval % grad3.length];
    }

    return {
      simplex3d(x, y, z) {
        let n0, n1, n2, n3;
        const s = (x + y + z) * F3;
        const i = Math.floor(x + s);
        const j = Math.floor(y + s);
        const k = Math.floor(z + s);
        const t = (i + j + k) * G3;
        const x0 = x - i + t;
        const y0 = y - j + t;
        const z0 = z - k + t;

        let i1, j1, k1, i2, j2, k2;
        if (x0 >= y0) {
          if (y0 >= z0) { i1=1; j1=0; k1=0; i2=1; j2=1; k2=0; }
          else if (x0 >= z0) { i1=1; j1=0; k1=0; i2=1; j2=0; k2=1; }
          else { i1=0; j1=0; k1=1; i2=1; j2=0; k2=1; }
        } else {
          if (y0 < z0) { i1=0; j1=0; k1=1; i2=0; j2=1; k2=1; }
          else if (x0 < z0) { i1=0; j1=1; k1=0; i2=0; j2=1; k2=1; }
          else { i1=0; j1=1; k1=0; i2=1; j2=1; k2=0; }
        }

        const x1 = x0 - i1 + G3, y1 = y0 - j1 + G3, z1 = z0 - k1 + G3;
        const x2 = x0 - i2 + 2 * G3, y2 = y0 - j2 + 2 * G3, z2 = z0 - k2 + 2 * G3;
        const x3 = x0 - 1 + 3 * G3, y3 = y0 - 1 + 3 * G3, z3 = z0 - 1 + 3 * G3;

        const ii = i & 255, jj = j & 255, kk = k & 255;
        const gi0 = gradP[ii + permutation[jj + permutation[kk]]];
        const gi1 = gradP[ii + i1 + permutation[jj + j1 + permutation[kk + k1]]];
        const gi2 = gradP[ii + i2 + permutation[jj + j2 + permutation[kk + k2]]];
        const gi3 = gradP[ii + 1 + permutation[jj + 1 + permutation[kk + 1]]];

        let t0 = 0.6 - x0*x0 - y0*y0 - z0*z0;
        let t1 = 0.6 - x1*x1 - y1*y1 - z1*z1;
        let t2 = 0.6 - x2*x2 - y2*y2 - z2*z2;
        let t3 = 0.6 - x3*x3 - y3*y3 - z3*z3;

        n0 = t0 < 0 ? 0 : (t0 *= t0, t0 * t0 * gi0.dot3d(x0, y0, z0));
        n1 = t1 < 0 ? 0 : (t1 *= t1, t1 * t1 * gi1.dot3d(x1, y1, z1));
        n2 = t2 < 0 ? 0 : (t2 *= t2, t2 * t2 * gi2.dot3d(x2, y2, z2));
        n3 = t3 < 0 ? 0 : (t3 *= t3, t3 * t3 * gi3.dot3d(x3, y3, z3));

        return 32 * (n0 + n1 + n2 + n3);
      }
    };
  }, [createVector, createRandom]);

  // Create a particle
  const createParticle = useCallback((perlin, bounds, rng, mouseRef) => {
    const p = createVector();
    const t = createVector(); // trail position
    const v = createVector(); // velocity
    let iteration = 0;
    let life = rng.random(1000, 10000);

    const reset = () => {
      p.x = t.x = Math.floor(rng.random() * bounds.x);
      p.y = t.y = Math.floor(rng.random() * bounds.y);
      v.set(1, 1, 0);
      iteration = 0;
      life = rng.random(1000, 10000);
    };

    reset();

    return {
      step() {
        if (iteration++ > life) {
          reset();
        }

        const xx = p.x / 200;
        const yy = p.y / 200;
        const zz = Date.now() / 5000;
        const a = rng.random() * Math.PI * 2;
        const rnd = rng.random() / 4;

        // Calculate velocity based on simplex noise
        v.x += rnd * Math.sin(a) + perlin.simplex3d(xx, yy, -zz);
        v.y += rnd * Math.cos(a) + perlin.simplex3d(xx, yy, zz);

        // Mouse attraction when clicked
        if (mouseRef.current.mouseDown) {
          const mousePos = mouseRef.current.mousePos;
          const dx = mousePos.x - p.x;
          const dy = mousePos.y - p.y;
          v.x += dx * 0.00085;
          v.y += dy * 0.00085;
        }

        // Save current position for trail, then add velocity
        p.moveTo(t);
        v.mul(0.94); // slow down
        p.add(v);

        // Wrap around edges
        if (p.wrap2d(bounds)) {
          p.moveTo(t);
        }
      },
      render(context) {
        context.moveTo(t.x, t.y);
        context.lineTo(p.x, p.y);
      }
    };
  }, [createVector]);

  // Initialize particles
  const initParticles = useCallback(() => {
    const state = stateRef.current;
    const cfg = config.current;
    const rng = createRandom();

    state.perlin = createPerlin();
    state.particles = [];

    const mouseRef = { current: state };

    for (let i = 0; i < cfg.particleCount; i++) {
      state.particles.push(createParticle(state.perlin, state.bounds, rng, mouseRef));
    }
  }, [createRandom, createPerlin, createParticle]);

  // Render loop
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const state = stateRef.current;
    const cfg = config.current;

    if (!canvas) return;

    const context = canvas.getContext('2d');
    const { width, height, particles } = state;

    context.beginPath();

    // Step and render each particle
    for (let i = 0; i < particles.length; i++) {
      particles[i].step();
      particles[i].render(context);
    }

    // Apply fade overlay
    context.globalCompositeOperation = 'source-over';
    context.fillStyle = cfg.fadeOverlay ? cfg.trailFade : 'rgba(0, 0, 0, 1)';
    context.fillRect(0, 0, width, height);

    // Draw particles with additive blending
    context.globalCompositeOperation = 'lighter';
    context.strokeStyle = cfg.staticColor;
    context.stroke();
    context.closePath();

    animationFrameRef.current = requestAnimationFrame(render);
  }, []);

  // Handle resize
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const state = stateRef.current;
    const container = canvas.parentElement;

    state.width = container?.clientWidth || window.innerWidth;
    state.height = container?.clientHeight || window.innerHeight;
    state.bounds.x = state.width;
    state.bounds.y = state.height;

    canvas.width = state.width;
    canvas.height = state.height;

    // Clear to black
    const context = canvas.getContext('2d');
    context.fillStyle = '#000000';
    context.fillRect(0, 0, state.width, state.height);

    // Reinitialize particles
    initParticles();
  }, [initParticles]);

  // Mouse handlers
  const handlePointerMove = useCallback((event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    stateRef.current.mousePos = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }, []);

  const handlePointerDown = useCallback((event) => {
    // Left click only for attraction
    if (event.button === 0) {
      stateRef.current.mouseDown = true;
    }
    event.preventDefault();
  }, []);

  const handlePointerUp = useCallback(() => {
    stateRef.current.mouseDown = false;
  }, []);

  const handlePointerLeave = useCallback(() => {
    stateRef.current.mouseDown = false;
    stateRef.current.mousePos = { x: -10000, y: -10000 };
  }, []);

  // Setup effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Find parent section for event attachment
    // If no section (page-level background), use document to capture events
    // above the main-content layer
    const section = canvas.closest('section');
    const eventTarget = section || document;
    const container = canvas.parentElement;

    // Initialize
    const initTimer = setTimeout(() => {
      handleResize();
      render();
    }, 50);

    // Event listeners
    window.addEventListener('resize', handleResize);
    eventTarget.addEventListener('pointermove', handlePointerMove);
    eventTarget.addEventListener('pointerdown', handlePointerDown);
    eventTarget.addEventListener('pointerup', handlePointerUp);
    eventTarget.addEventListener('pointerleave', handlePointerLeave);

    // Prevent context menu
    const preventContext = (e) => e.preventDefault();
    eventTarget.addEventListener('contextmenu', preventContext);

    // Watch for container size changes (for page-level backgrounds)
    let resizeObserver = null;
    if (container) {
      resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(container);
    }

    return () => {
      clearTimeout(initTimer);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', handleResize);
      eventTarget.removeEventListener('pointermove', handlePointerMove);
      eventTarget.removeEventListener('pointerdown', handlePointerDown);
      eventTarget.removeEventListener('pointerup', handlePointerUp);
      eventTarget.removeEventListener('pointerleave', handlePointerLeave);
      eventTarget.removeEventListener('contextmenu', preventContext);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [handleResize, handlePointerMove, handlePointerDown, handlePointerUp, handlePointerLeave, render]);

  return (
    <canvas
      ref={canvasRef}
      className={`swarm-animation ${className}`}
      aria-hidden="true"
    />
  );
}

export default SwarmAnimation;
