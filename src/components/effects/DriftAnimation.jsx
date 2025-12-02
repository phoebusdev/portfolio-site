import { useEffect, useRef, useCallback } from 'react';
import './DriftAnimation.css';

/**
 * DriftAnimation - Organic drifting particles
 *
 * Particles spawn in a circle and drift randomly, creating organic patterns.
 * Based on Jeremboo's shepherding random numbers concept.
 */
function DriftAnimation({ className = '' }) {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const stateRef = useRef({
    width: 0,
    height: 0,
    particles: [],
  });

  // Configuration
  const config = useRef({
    particleCount: 1000,
    particleSpeed: 0.3,
    velocity: 0.9,
    circleWidth: 50,
    particleColor: 'rgba(255, 255, 255, 0.05)',
  });

  // Random float helper
  const getRandomFloat = useCallback((min, max) => {
    return Math.random() * (max - min) + min;
  }, []);

  // Create a particle
  const createParticle = useCallback((x, y) => {
    const cfg = config.current;
    return {
      x,
      y,
      vel: {
        x: getRandomFloat(-20, 20) / 100,
        y: getRandomFloat(-20, 20) / 100,
        min: getRandomFloat(2, 10),
        max: getRandomFloat(10, 100) / 10,
      },
      update() {
        const state = stateRef.current;
        const forceDirection = {
          x: getRandomFloat(-1, 1),
          y: getRandomFloat(-1, 1),
        };

        if (Math.abs(this.vel.x + forceDirection.x) < this.vel.max) {
          this.vel.x += forceDirection.x;
        }
        if (Math.abs(this.vel.y + forceDirection.y) < this.vel.max) {
          this.vel.y += forceDirection.y;
        }

        this.x += this.vel.x * cfg.particleSpeed;
        this.y += this.vel.y * cfg.particleSpeed;

        if (Math.abs(this.vel.x) > this.vel.min) {
          this.vel.x *= cfg.velocity;
        }
        if (Math.abs(this.vel.y) > this.vel.min) {
          this.vel.y *= cfg.velocity;
        }

        // Wrap around edges
        if (this.x > state.width) this.x = 0;
        else if (this.x < 0) this.x = state.width;
        if (this.y > state.height) this.y = 0;
        else if (this.y < 0) this.y = state.height;
      },
      render(context) {
        context.beginPath();
        context.fillStyle = cfg.particleColor;
        context.arc(this.x, this.y, 1, 0, Math.PI * 2);
        context.fill();
      },
    };
  }, [getRandomFloat]);

  // Initialize particles in a circle
  const initParticles = useCallback(() => {
    const state = stateRef.current;
    const cfg = config.current;
    state.particles = [];

    for (let i = 0; i < cfg.particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      state.particles.push(
        createParticle(
          state.width * 0.5 + Math.cos(angle) * cfg.circleWidth,
          state.height * 0.5 - Math.sin(angle) * cfg.circleWidth
        )
      );
    }
  }, [createParticle]);

  // Render loop
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const state = stateRef.current;

    if (!canvas) return;

    const context = canvas.getContext('2d');
    const { particles } = state;

    // Update and render each particle (no clear - trails accumulate)
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].render(context);
    }

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

    canvas.width = state.width;
    canvas.height = state.height;

    // Clear and reinitialize
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, state.width, state.height);
    initParticles();
  }, [initParticles]);

  // Handle click to reset
  const handleClick = useCallback(() => {
    const canvas = canvasRef.current;
    const state = stateRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    context.clearRect(0, 0, state.width, state.height);
    initParticles();
  }, [initParticles]);

  // Setup effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Find parent section for event attachment
    const section = canvas.closest('section') || canvas.parentElement;

    // Initialize
    const initTimer = setTimeout(() => {
      handleResize();
      render();
    }, 50);

    // Event listeners
    window.addEventListener('resize', handleResize);
    section.addEventListener('click', handleClick);

    return () => {
      clearTimeout(initTimer);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', handleResize);
      section.removeEventListener('click', handleClick);
    };
  }, [handleResize, handleClick, render]);

  return (
    <canvas
      ref={canvasRef}
      className={`drift-animation ${className}`}
      aria-hidden="true"
    />
  );
}

export default DriftAnimation;
