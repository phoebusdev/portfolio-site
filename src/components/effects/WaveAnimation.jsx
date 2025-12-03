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
    gridSize: 80,          // particles per side (80x80 = 6400 particles)
    separation: 12,        // spacing between particles
    waveAmplitude: 40,     // height of waves
    waveFrequency: 0.08,   // wave density
    waveSpeed: 1.5,        // animation speed
    cameraDistance: 600,   // camera distance from center
    cameraHeight: 300,     // camera height
    cameraRotationSpeed: 0.15, // auto-rotation speed
    fov: 500,              // field of view for projection
    particleBaseSize: 2,   // base particle size
    particleSizeWave: 2,   // additional size from wave
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

      // Wave displacement
      const waveTime = time * config.waveSpeed;
      const waveX = Math.sin((gridX * config.waveFrequency) + waveTime) * config.waveAmplitude;
      const waveZ = Math.sin((gridZ * config.waveFrequency * 0.7) + waveTime * 0.8) * config.waveAmplitude;
      const y = waveX + waveZ;

      // Project to 2D
      const projected = project(baseX, y, baseZ, width, height, cameraX, cameraY, cameraZ);

      if (projected && projected.scale > 0 && projected.x > -50 && projected.x < width + 50 && projected.y > -50 && projected.y < height + 50) {
        // Size based on wave height and distance
        const waveNormalized = (y / (config.waveAmplitude * 2)) + 0.5;
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
