import { useEffect, useRef } from 'react';
import './ParallaxBackground.css';

function ParallaxBackground({ intensity = 0.5 }) {
  const sceneRef = useRef(null);
  const rafId = useRef(null);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Check if reduced motion is preferred
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Simple scroll-based parallax
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const layers = scene.querySelectorAll('.parallax-layer');

      layers.forEach((layer, index) => {
        const speed = layer.dataset.speed || (index + 1) * 0.1 * intensity;
        const yPos = -(scrollY * speed);
        layer.style.transform = `translate3d(0, ${yPos}px, 0)`;
      });
    };

    // Use RAF for smooth updates
    const onScroll = () => {
      if (rafId.current) return;
      rafId.current = requestAnimationFrame(() => {
        handleScroll();
        rafId.current = null;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    handleScroll(); // Initial position

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [intensity]);

  return (
    <div ref={sceneRef} className="parallax-background">
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
