import { useEffect, useRef } from 'react';
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

    let width = 0;
    let height = 0;
    let canvasRect = { left: 0, top: 0 };

    // Initialize particles
    const initParticles = () => {
      const particles = [];
      const centerX = width / 2;
      const centerY = height / 2;

      for (let i = 0; i < particleCount; i++) {
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
          alpha: Math.random() * 0.5 + 0.3,
        });
      }

      particlesRef.current = particles;
    };

    // Set canvas size
    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();

      width = rect.width;
      height = rect.height;
      canvasRect = { left: rect.left, top: rect.top };

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      initParticles();
    };

    // Animation loop
    const animate = () => {
      const mouse = mouseRef.current;
      const particles = particlesRef.current;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      const mouseRadius = 150;
      const friction = 0.92;
      const returnSpeed = 0.03;

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (mouse.isActive) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouseRadius) {
            const force = (mouseRadius - dist) / mouseRadius;
            const angle = Math.atan2(dy, dx);
            p.vx -= Math.cos(angle) * force * 0.8;
            p.vy -= Math.sin(angle) * force * 0.8;
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

      animationRef.current = requestAnimationFrame(animate);
    };

    // Use document-level mouse tracking to work through content layers
    const handleMouseMove = (e) => {
      // Update canvas rect on scroll
      const rect = canvas.getBoundingClientRect();
      canvasRect = { left: rect.left, top: rect.top };

      mouseRef.current = {
        x: e.clientX - canvasRect.left,
        y: e.clientY - canvasRect.top,
        isActive: true,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current.isActive = false;
    };

    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        canvasRect = { left: rect.left, top: rect.top };

        mouseRef.current = {
          x: e.touches[0].clientX - canvasRect.left,
          y: e.touches[0].clientY - canvasRect.top,
          isActive: true,
        };
      }
    };

    const handleTouchEnd = () => {
      mouseRef.current.isActive = false;
    };

    // Initialize
    resizeCanvas();
    animate();

    // Use document-level events for mouse tracking through content
    window.addEventListener('resize', resizeCanvas);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [particleCount]);

  return (
    <canvas
      ref={canvasRef}
      className={`interactive-particles ${className}`}
      aria-hidden="true"
    />
  );
}

export default InteractiveParticles;
