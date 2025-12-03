import { useEffect, useRef } from 'react';
import ParticleGrid from './ParticleGrid.jsx';
import './PageBackground.css';

/**
 * PageBackground - Fixed background that extends behind entire page
 * Applies a subtle parallax scroll effect (0.2x speed)
 */
function PageBackground() {
  const containerRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (rafRef.current) return;

      rafRef.current = requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        // 0.2x parallax - background moves at 20% of scroll speed
        const yOffset = scrollY * 0.2;
        container.style.transform = `translate3d(0, ${yOffset}px, 0)`;
        rafRef.current = null;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial position

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <div className="page-background" ref={containerRef}>
      <ParticleGrid className="page-background-particles" />
    </div>
  );
}

export default PageBackground;
