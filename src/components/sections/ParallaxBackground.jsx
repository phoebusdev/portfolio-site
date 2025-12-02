import { useEffect, useRef } from 'react';
import { BREAKPOINTS } from '../../constants/design.js';
import './ParallaxBackground.css';

function ParallaxBackground({
  intensity = 0.5,
  enableContentParallax = true,
  enableInteractiveParticles = false,
  particleCount = 30000
}) {
  const sceneRef = useRef(null);
  const canvasRef = useRef(null);
  const rafId = useRef(null);
  const particleAnimationRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0, isActive: false });

  // Parallax scroll effect
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const isMobile = window.innerWidth < BREAKPOINTS.MOBILE;

      const layers = scene.querySelectorAll('.parallax-layer');
      layers.forEach((layer, index) => {
        const speed = layer.dataset.speed || (index + 1) * 0.1 * intensity;
        const yPos = -(scrollY * speed);
        layer.style.transform = `translate3d(0, ${yPos}px, 0)`;
      });

      if (enableContentParallax && !isMobile) {
        const section = scene.closest('section');
        if (section) {
          const contentElements = section.querySelectorAll('[data-parallax]');
          const viewportHeight = window.innerHeight;
          const viewportCenter = viewportHeight / 2;

          contentElements.forEach((element) => {
            const rect = element.getBoundingClientRect();
            const inViewport = rect.top < viewportHeight + 100 && rect.bottom > -100;

            if (inViewport) {
              const speed = parseFloat(element.dataset.parallax) || 0.1;
              const elementCenter = rect.top + rect.height / 2;
              const distanceFromCenter = elementCenter - viewportCenter;
              const yPos = distanceFromCenter * speed;

              element.style.transform = `translate3d(0, ${yPos}px, 0)`;
              element.style.willChange = 'transform';
            }
          });
        }
      }
    };

    const onScroll = () => {
      if (rafId.current) return;
      rafId.current = requestAnimationFrame(() => {
        handleScroll();
        rafId.current = null;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [intensity, enableContentParallax]);

  // Interactive particles effect
  useEffect(() => {
    if (!enableInteractiveParticles) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;

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

    const resizeCanvas = () => {
      const section = canvas.closest('section');
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      width = rect.width;
      height = rect.height;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      initParticles();
    };

    const animate = () => {
      const mouse = mouseRef.current;
      const particles = particlesRef.current;

      ctx.clearRect(0, 0, width, height);

      const mouseRadius = 150;
      const friction = 0.92;
      const returnSpeed = 0.03;

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

        p.vx += (p.baseX - p.x) * returnSpeed;
        p.vy += (p.baseY - p.y) * returnSpeed;
        p.vx *= friction;
        p.vy *= friction;
        p.x += p.vx;
        p.y += p.vy;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.fill();
      }

      particleAnimationRef.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e) => {
      const section = canvas.closest('section');
      if (!section) return;

      const rect = section.getBoundingClientRect();
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
        const section = canvas.closest('section');
        if (!section) return;

        const rect = section.getBoundingClientRect();
        mouseRef.current = {
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top,
          isActive: true,
        };
      }
    };

    resizeCanvas();
    animate();

    window.addEventListener('resize', resizeCanvas);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleMouseLeave);

    return () => {
      if (particleAnimationRef.current) {
        cancelAnimationFrame(particleAnimationRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleMouseLeave);
    };
  }, [enableInteractiveParticles, particleCount]);

  return (
    <div ref={sceneRef} className="parallax-background">
      {enableInteractiveParticles && (
        <canvas
          ref={canvasRef}
          className="interactive-particles-canvas"
          aria-hidden="true"
        />
      )}
      <div className="parallax-layer layer-far" data-speed="0.2">
        <div className="bg-gradient gradient-1"></div>
      </div>
      <div className="parallax-layer layer-mid" data-speed="0.4">
        <div className="bg-gradient gradient-2"></div>
      </div>
      <div className="parallax-layer layer-near" data-speed="0.6">
        <div className="bg-gradient gradient-3"></div>
      </div>
    </div>
  );
}

export default ParallaxBackground;
