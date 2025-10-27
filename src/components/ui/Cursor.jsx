import { useEffect, useState, useRef } from 'react';
import './Cursor.css';

function Cursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const cursorRef = useRef(null);
  const rafId = useRef(null);

  useEffect(() => {
    // Check if device has mouse (skip on touch devices)
    const hasMouse = window.matchMedia('(pointer: fine)').matches;
    if (!hasMouse) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMouseMove = (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseEnter = (e) => {
      const isInteractive =
        e.target.tagName === 'A' ||
        e.target.tagName === 'BUTTON' ||
        e.target.closest('[role="button"]') ||
        e.target.closest('.interactive');

      if (isInteractive) {
        setIsHovering(true);
      }
    };

    const handleMouseLeave = () => {
      setIsHovering(false);
    };

    // Smooth cursor animation with RAF
    const animate = () => {
      // Lerp (linear interpolation) for smooth following
      const ease = 0.15;
      currentX += (targetX - currentX) * ease;
      currentY += (targetY - currentY) * ease;

      setPosition({ x: currentX, y: currentY });

      rafId.current = requestAnimationFrame(animate);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseenter', handleMouseEnter, true);
    document.addEventListener('mouseleave', handleMouseLeave, true);

    rafId.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseenter', handleMouseEnter, true);
      document.removeEventListener('mouseleave', handleMouseLeave, true);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  // Hide default cursor
  useEffect(() => {
    const hasMouse = window.matchMedia('(pointer: fine)').matches;
    if (hasMouse) {
      document.body.style.cursor = 'none';
      return () => {
        document.body.style.cursor = 'auto';
      };
    }
  }, []);

  // Don't render on touch devices
  const hasMouse = window.matchMedia('(pointer: fine)').matches;
  if (!hasMouse) return null;

  return (
    <div
      ref={cursorRef}
      className={`custom-cursor ${isHovering ? 'hovering' : ''} ${isClicking ? 'clicking' : ''}`}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
      }}
    >
      <div className="cursor-inner" />
    </div>
  );
}

export default Cursor;
