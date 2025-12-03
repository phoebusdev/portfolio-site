import { useEffect, useRef, useCallback } from 'react';
import './WaveAnimation.css';

/**
 * WaveAnimation - 3D particle wave grid using Canvas 2D
 *
 * A grid of particles that animate in a wave pattern with 3D projection.
 * Pure canvas implementation without external 3D libraries.
 */
function WaveAnimation({ className = '' }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const stateRef = useRef({
    width: 0,
    height: 0,
    initialized: false,
    time: 0,
    lastFrameTime: 0,
    particles: [],
  });

  // Configuration
  const config = {
    gridSize: 120,         // particles per side (120x120 = 14400 particles)
    separation: 18,        // spacing between particles (wider coverage)
    waveAmplitude: 25,     // height of waves (lower for ocean feel)
    waveFrequency: 0.18,   // wave density (more waves)
    waveSpeed: 0.8,        // animation speed (slower, more ocean-like)
    cameraDistance: 450,   // camera distance from center (closer)
    cameraHeight: 180,     // camera height (lower angle)
    cameraRotationSpeed: 0.08, // auto-rotation speed (slower)
    fov: 600,              // field of view for projection (wider)
    particleBaseSize: 1.5, // base particle size
    particleSizeWave: 1.5, // additional size from wave
    // Additional wave layers for ocean effect
    secondaryWaveFreq: 0.25,
    secondaryWaveAmp: 15,
    tertiaryWaveFreq: 0.4,
    tertiaryWaveAmp: 8,
  };

  // Initialize particles in a grid
  const initParticles = useCallback(() => {
    const particles = [];
    const halfGrid = config.gridSize / 2;

    for (let x = 0; x < config.gridSize; x++) {
      for (let z = 0; z < config.gridSize; z++) {
        particles.push({
          baseX: (x - halfGrid) * config.separation,
          baseZ: (z - halfGrid) * config.separation,
          gridX: x,
          gridZ: z,
        });
      }
    }

    return particles;
  }, [config.gridSize, config.separation]);

  // 3D to 2D projection
  const project = useCallback((x, y, z, width, height, cameraX, cameraY, cameraZ) => {
    // Translate relative to camera
    const dx = x - cameraX;
    const dy = y - cameraY;
    const dz = z - cameraZ;

    // Simple perspective projection
    const scale = config.fov / (config.fov - dz);

    if (scale <= 0) return null; // Behind camera

    return {
      x: width / 2 + dx * scale,
      y: height / 2 - dy * scale,
      scale: scale,
      depth: -dz,
    };
  }, [config.fov]);

  // Render loop
  const render = useCallback((timestamp) => {
    const canvas = canvasRef.current;
    const s = stateRef.current;

    if (!canvas || !s.initialized) {
      animationRef.current = requestAnimationFrame(render);
      return;
    }

    // Calculate delta time (capped to prevent jumps)
    const now = timestamp || performance.now();
    const deltaTime = s.lastFrameTime ? Math.min((now - s.lastFrameTime) / 1000, 0.1) : 0;
    s.lastFrameTime = now;
    s.time += deltaTime;

    const ctx = canvas.getContext('2d');
    const { width, height, particles, time } = s;

    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    // Camera position (auto-rotating around the grid)
    const cameraAngle = time * config.cameraRotationSpeed;
    const cameraX = Math.sin(cameraAngle) * config.cameraDistance;
    const cameraZ = Math.cos(cameraAngle) * config.cameraDistance;
    const cameraY = config.cameraHeight;

    // Calculate particle positions and sort by depth
    const projectedParticles = [];

    for (const particle of particles) {
      const { baseX, baseZ, gridX, gridZ } = particle;

      // Wave displacement - multiple layers for ocean effect
      const waveTime = time * config.waveSpeed;
      // Primary waves
      const waveX = Math.sin((gridX * config.waveFrequency) + waveTime) * config.waveAmplitude;
      const waveZ = Math.sin((gridZ * config.waveFrequency * 0.7) + waveTime * 0.8) * config.waveAmplitude;
      // Secondary waves (cross-direction, slightly faster)
      const wave2 = Math.sin((gridX * config.secondaryWaveFreq) + waveTime * 1.2) * config.secondaryWaveAmp;
      const wave2Z = Math.sin((gridZ * config.secondaryWaveFreq * 0.8) + waveTime * 1.1) * config.secondaryWaveAmp;
      // Tertiary waves (fine detail, varied speed)
      const wave3 = Math.sin((gridX * config.tertiaryWaveFreq) + waveTime * 0.6) * config.tertiaryWaveAmp;
      const wave3Z = Math.sin((gridZ * config.tertiaryWaveFreq * 1.2) + waveTime * 0.9) * config.tertiaryWaveAmp;
      // Combine all wave layers
      const y = waveX + waveZ + wave2 + wave2Z + wave3 + wave3Z;

      // Project to 2D
      const projected = project(baseX, y, baseZ, width, height, cameraX, cameraY, cameraZ);

      if (projected && projected.scale > 0 && projected.x > -50 && projected.x < width + 50 && projected.y > -50 && projected.y < height + 50) {
        // Size based on wave height and distance
        // Total amplitude is sum of all wave layers
        const totalAmplitude = (config.waveAmplitude + config.secondaryWaveAmp + config.tertiaryWaveAmp) * 2;
        const waveNormalized = (y / totalAmplitude) + 0.5;
        const size = (config.particleBaseSize + waveNormalized * config.particleSizeWave) * projected.scale;

        projectedParticles.push({
          x: projected.x,
          y: projected.y,
          size: size,
          depth: projected.depth,
          brightness: Math.min(1, 0.3 + waveNormalized * 0.7),
        });
      }
    }

    // Sort by depth (far to near)
    projectedParticles.sort((a, b) => a.depth - b.depth);

    // Draw particles
    ctx.beginPath();
    for (const p of projectedParticles) {
      if (p.size > 0.5) {
        ctx.moveTo(p.x + p.size, p.y);
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      }
    }
    ctx.fillStyle = '#fff';
    ctx.fill();

    animationRef.current = requestAnimationFrame(render);
  }, [project, config]);

  // Handle resize
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const s = stateRef.current;
    const container = canvas.parentElement;

    const newWidth = container?.clientWidth || window.innerWidth;
    const newHeight = container?.clientHeight || window.innerHeight;

    // Only update if dimensions actually changed
    if (s.width === newWidth && s.height === newHeight) return;

    s.width = newWidth;
    s.height = newHeight;

    canvas.width = s.width;
    canvas.height = s.height;
  }, []);

  // Setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const s = stateRef.current;
    const container = canvas.parentElement;

    const initTimer = setTimeout(() => {
      s.particles = initParticles();
      handleResize();
      s.initialized = true;
      animationRef.current = requestAnimationFrame(render);
    }, 50);

    window.addEventListener('resize', handleResize);

    // Watch for container size changes
    let resizeObserver = null;
    if (container) {
      resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(container);
    }

    return () => {
      clearTimeout(initTimer);
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [initParticles, handleResize, render]);

  return (
    <canvas
      ref={canvasRef}
      className={`wave-animation ${className}`}
      aria-hidden="true"
    />
  );
}

export default WaveAnimation;
