import { useEffect, useRef } from 'react';
import './Spirograph.css';

function Spirograph({ className = '' }) {
  const mainCanvasRef = useRef(null);
  const animationRef = useRef(null);
  const framesRef = useRef(0);

  useEffect(() => {
    const mainCanvas = mainCanvasRef.current;
    if (!mainCanvas) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const Ctx = mainCanvas.getContext('2d');

    // Create offscreen canvas for drawing curves
    const offscreenCanvas = document.createElement('canvas');
    const ctx = offscreenCanvas.getContext('2d');

    const cw = 400;
    const ch = 400;
    const cx = cw / 2;
    const cy = ch / 2;
    offscreenCanvas.width = cw;
    offscreenCanvas.height = ch;

    const rad = Math.PI / 180;
    const Rx = 150;
    const Ry = 150;
    const kx = 3;
    const ky = 4;
    const petals = 7;

    // White stroke for monotone design
    ctx.strokeStyle = '#ffffff';
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 0.25;

    // Set canvas size to window dimensions
    const resize = () => {
      mainCanvas.width = window.innerWidth;
      mainCanvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      framesRef.current += 0.3;
      const frames = framesRef.current;

      const Cw = mainCanvas.width;
      const Ch = mainCanvas.height;

      // Clear main canvas
      Ctx.setTransform(1, 0, 0, 1, 0, 0);
      Ctx.clearRect(0, 0, Cw, Ch);

      // Set up transform for centered, scaled drawing
      Ctx.translate(Cw / 2, Ch / 2);
      Ctx.scale(0.75, 0.75);

      const t = frames * rad;
      const rx = Rx * Math.abs(Math.cos(t)) + 50;
      const ry = Ry * Math.abs(Math.sin(t)) + 50;

      const x = cx + rx * Math.sin(kx * t + Math.PI / 2);
      const y = cy + ry * Math.sin(ky * t + Math.PI / 2);

      const x1 = cx + rx * Math.sin(kx * t + Math.PI);
      const y1 = cy - ry * Math.sin(ky * t + Math.PI);

      const x2 = cx + rx * Math.sin(kx * t);
      const y2 = cy - ry * Math.sin(ky * t);

      // Draw to offscreen canvas
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x1, y1, x2, y2);
      ctx.stroke();
      ctx.globalCompositeOperation = 'lighter';

      // Draw petals from offscreen canvas to main canvas
      Ctx.globalAlpha = 0.6;
      for (let i = 0; i < petals; i++) {
        Ctx.globalCompositeOperation = 'source-over';
        Ctx.drawImage(offscreenCanvas, -cw / 2, -ch / 2);
        Ctx.rotate((2 * Math.PI) / petals);
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    // Start animation
    animationRef.current = requestAnimationFrame(draw);

    // Clear and restart every 30 seconds
    const cycleAnimation = () => {
      ctx.clearRect(0, 0, cw, ch);
      framesRef.current = 0;
    };

    const intervalId = setInterval(cycleAnimation, 30000);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      clearInterval(intervalId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className={`spirograph-container ${className}`} aria-hidden="true">
      <canvas ref={mainCanvasRef} className="spirograph-canvas" />
    </div>
  );
}

export default Spirograph;
