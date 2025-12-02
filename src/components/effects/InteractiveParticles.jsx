import { useEffect, useRef, useCallback } from 'react';
import './InteractiveParticles.css';

/**
 * InteractiveParticles - High-performance canvas-based particle system
 * Inspired by Justin Windle's 30,000 Particles pen
 * Features mouse tracking for interactive effects
 */
function InteractiveParticles({
  particleCount = 30000,
  className = ''
}) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0, isActive: false });
  const dimensionsRef = useRef({ width: 0, height: 0 });

  // Initialize particles
  const initParticles = useCallback((width, height) => {
    const particles = [];
    const centerX = width / 2;
    const centerY = height / 2;

    for (let i = 0; i < particleCount; i++) {
      // Start particles in a circular distribution from center
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * Math.min(width, height) * 0.5;

      particles.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        baseX: centerX + Math.cos(angle) * radius,
        baseY: centerY + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        size: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.5 + 0.1,
      });
    }

    return particles;
  }, [particleCount]);

  // Animation loop
  const animate = useCallback((ctx) => {
    const { width, height } = dimensionsRef.current;
    const mouse = mouseRef.current;
    const particles = particlesRef.current;

    // Clear with fade effect for trails
    ctx.fillStyle = 'rgba(10, 10, 10, 0.15)';
    ctx.fillRect(0, 0, width, height);

    const mouseRadius = 150;
    const mouseStrength = 0.08;
    const friction = 0.92;
    const returnSpeed = 0.03;

    // Update and draw particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      if (mouse.isActive) {
        // Calculate distance from mouse
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouseRadius) {
          // Push particles away from mouse
          const force = (mouseRadius - dist) / mouseRadius;
          const angle = Math.atan2(dy, dx);
          p.vx -= Math.cos(angle) * force * mouseStrength * 10;
          p.vy -= Math.sin(angle) * force * mouseStrength * 10;
        }
      }

      // Return to base position
      p.vx += (p.baseX - p.x) * returnSpeed;
      p.vy += (p.baseY - p.y) * returnSpeed;

      // Apply friction
      p.vx *= friction;
      p.vy *= friction;

      // Update position
      p.x += p.vx;
      p.y += p.vy;

      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
      ctx.fill();
    }

    animationRef.current = requestAnimationFrame(() => animate(ctx));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.warn('[InteractiveParticles] Canvas context not supported');
      return;
    }

    // Set canvas size
    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      dimensionsRef.current = { width: rect.width, height: rect.height };

      // Reinitialize particles on resize
      particlesRef.current = initParticles(rect.width, rect.height);

      // Clear and set initial background
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, rect.width, rect.height);
    };

    // Mouse event handlers
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        isActive: true,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current.isActive = false;
    };

    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        mouseRef.current = {
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top,
          isActive: true,
        };
      }
    };

    const handleTouchEnd = () => {
      mouseRef.current.isActive = false;
    };

    // Initialize
    resizeCanvas();

    // Start animation
    animate(ctx);

    // Event listeners
    window.addEventListener('resize', resizeCanvas);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
    canvas.addEventListener('touchend', handleTouchEnd);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [animate, initParticles]);

  return (
    <canvas
      ref={canvasRef}
      className={`interactive-particles ${className}`}
      aria-hidden="true"
    />
  );
}

export default InteractiveParticles;
