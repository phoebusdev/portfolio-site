import { useEffect, useRef } from 'react';
import { animate } from 'motion';
import './AnimatedRings.css';

/**
 * AnimatedRings - Pulsing concentric rings for hero background
 *
 * Creates subtle, animated gradient rings that expand and fade
 */
function AnimatedRings({ className = '' }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const rings = containerRef.current.querySelectorAll('.ring');
    const animations = [];

    rings.forEach((ring, index) => {
      // Stagger the animation start for each ring
      const delay = index * 2;

      const animation = animate(
        ring,
        {
          scale: [0.8, 1.5, 0.8],
          opacity: [0.3, 0.1, 0.3],
        },
        {
          duration: 12,
          delay: delay,
          easing: [0.42, 0, 0.58, 1],
          repeat: Infinity,
        }
      );

      animations.push(animation);
    });

    return () => {
      animations.forEach(anim => anim?.stop());
    };
  }, []);

  return (
    <div ref={containerRef} className={`animated-rings ${className}`} aria-hidden="true">
      <div className="ring ring-1" />
      <div className="ring ring-2" />
      <div className="ring ring-3" />
    </div>
  );
}

export default AnimatedRings;
