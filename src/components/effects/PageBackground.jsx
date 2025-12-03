import { useEffect, useRef, useState } from 'react';
import ParticleGrid from './ParticleGrid.jsx';
import './PageBackground.css';

const PARALLAX_FACTOR = 0.2;

/**
 * PageBackground - Fixed background that extends behind entire page
 * Applies a subtle parallax scroll effect (0.2x speed)
 */
function PageBackground() {
  const containerRef = useRef(null);
  const rafRef = useRef(null);
  const [backgroundHeight, setBackgroundHeight] = useState('100vh');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Calculate required height to cover entire page with parallax
    const updateHeight = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const maxOffset = maxScroll * PARALLAX_FACTOR;
      const requiredHeight = window.innerHeight + maxOffset;
      setBackgroundHeight(`${requiredHeight}px`);
    };

    const handleScroll = () => {
      if (rafRef.current) return;

      rafRef.current = requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        // 0.2x parallax - background moves at 20% of scroll speed
        const yOffset = scrollY * PARALLAX_FACTOR;
        container.style.transform = `translate3d(0, ${yOffset}px, 0)`;
        rafRef.current = null;
      });
    };

    // Initial setup
    updateHeight();
    handleScroll();

    // Update height when content changes
    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(document.body);

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateHeight);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateHeight);
      resizeObserver.disconnect();
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <div className="page-background" ref={containerRef} style={{ height: backgroundHeight }}>
      <ParticleGrid className="page-background-particles" />
    </div>
  );
}

export default PageBackground;
