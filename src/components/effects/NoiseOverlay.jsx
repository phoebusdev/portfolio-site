import { useEffect, useRef } from 'react';
import { logWarning } from '../../utils/errorLogger.js';
import './NoiseOverlay.css';

function NoiseOverlay({ opacity = 0.05, className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      logWarning('NOISE_OVERLAY_NO_CONTEXT', { component: 'NoiseOverlay' });
      return;
    }

    // Explicitly set canvas dimensions
    canvas.width = 800;
    canvas.height = 800;

    try {
      // Generate noise texture
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random() * 255;
        data[i] = noise; // R
        data[i + 1] = noise; // G
        data[i + 2] = noise; // B
        data[i + 3] = 255; // A
      }

      ctx.putImageData(imageData, 0, 0);
    } catch (error) {
      logWarning('NOISE_OVERLAY_CANVAS_ERROR', { error: error.message });
    }
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={800}
      className={`noise-overlay depth-desktop-only ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    />
  );
}

export default NoiseOverlay;
