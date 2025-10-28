import { useEffect, useRef } from 'react';
import { animate } from 'motion';
import './ParticleSystem.css';

function ParticleSystem({ count = 20 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const particles = Array.from(containerRef.current.children);

    // Guard against empty children (race condition)
    if (particles.length === 0) return;

    const animations = [];

    particles.forEach((particle, i) => {
      const delay = i * 0.15; // Stagger the start
      const duration = 15 + Math.random() * 15; // 15-30 seconds
      const startX = Math.random() * 100;
      const drift = (Math.random() - 0.5) * 30; // Horizontal drift

      const animation = animate(
        particle,
        {
          y: ['105vh', '-5vh'], // Start below, end above
          x: [startX + '%', (startX + drift) + '%'],
          opacity: [0, 0.6, 0.4, 0],
        },
        {
          duration: duration,
          delay: delay,
          easing: 'linear',
          repeat: Infinity,
        }
      );

      animations.push(animation);
    });

    return () => {
      animations.forEach((animation) => animation.stop());
    };
  }, [count]); // Re-added count to dependencies - animations should restart when count changes

  return (
    <div ref={containerRef} className="particle-system depth-desktop-only" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="particle" />
      ))}
    </div>
  );
}

export default ParticleSystem;
