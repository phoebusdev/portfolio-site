import { useEffect, useRef, useState, cloneElement } from 'react';
import './PageBackground.css';

const PARALLAX_FACTOR = 0.2;

/**
 * PageBackground - Fixed background that extends behind entire page
 * Applies a subtle parallax scroll effect (0.2x speed)
 *
 * @param {ReactElement} children - Animation component to render as background
 * @param {string} className - Additional class for the animation (default: 'page-background-animation')
 */
function PageBackground({ children, className = 'page-background-animation' }) {
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
        // 0.2x parallax - background scrolls up slower than content
        // Negative offset so background moves up, revealing bottom portion
        const yOffset = -scrollY * PARALLAX_FACTOR;
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

  // Clone the child animation with the appropriate className
  const animationWithClass = children
    ? cloneElement(children, { className })
    : null;

  return (
    <div className="page-background" ref={containerRef} style={{ height: backgroundHeight }}>
      {animationWithClass}
    </div>
  );
}

export default PageBackground;
