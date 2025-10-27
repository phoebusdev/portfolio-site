import { useEffect, useRef } from 'react';
import { animate } from 'motion';
import './GlowOrb.css';

function GlowOrb({ size = 400, color = 'rgba(255,255,255,0.03)', duration = 20 }) {
  const orbRef = useRef(null);

  useEffect(() => {
    if (!orbRef.current) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Random start position (percentage)
    const startX = Math.random() * 80 + 10; // 10-90%
    const startY = Math.random() * 80 + 10;

    // Calculate drift path
    const driftX = (Math.random() - 0.5) * 40; // -20% to +20%
    const driftY = (Math.random() - 0.5) * 40;

    // Animate with Motion One using project standard easing
    const animation = animate(
      orbRef.current,
      {
        x: [startX + '%', (startX + driftX) + '%', startX + '%'],
        y: [startY + '%', (startY + driftY) + '%', startY + '%'],
        scale: [1, 1.2, 1],
        opacity: [0.5, 0.8, 0.5],
      },
      {
        duration: duration,
        easing: [0.42, 0, 0.58, 1], // Project standard cubic-bezier
        repeat: Infinity,
      }
    );

    return () => {
      animation?.stop(); // Safe cleanup with optional chaining
    };
  }, [duration]);

  return (
    <div
      ref={orbRef}
      className="glow-orb depth-desktop-only"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      }}
      aria-hidden="true"
    />
  );
}

export default GlowOrb;
