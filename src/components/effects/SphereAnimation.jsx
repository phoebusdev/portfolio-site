import { useEffect, useRef, useCallback } from 'react';
import './SphereAnimation.css';

function SphereAnimation({ className = '' }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const state = useRef({
    width: 0,
    height: 0,
    center: { x: 0, y: 0 },
    mousePos: { x: 0, y: 0 },
    imageData: null,
    pix: null,
    model: null,
    light: null,
    sourceImage: null,
    sourceImageData: null,
    sourcePix: null,
    initialized: false,
  });

  // Configuration
  const config = useRef({
    fov: 750,
    particleCount: 35000,
    moonRadius: 75,
    bumpScale: 50,
    rotationSpeed: -1.0,
    lightBrightness: 1.0,
    lightRadius: 200,
    // Use a simple gradient texture instead of external image
    useGeneratedTexture: true,
  });

  // Generate a procedural texture (moon-like grayscale)
  const generateTexture = useCallback(() => {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Create a moon-like texture with noise
    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;

    // Simple noise function
    const noise = (x, y) => {
      const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
      return n - Math.floor(n);
    };

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = (x + y * size) * 4;

        // Create layered noise for more organic look
        let value = 0;
        value += noise(x * 0.02, y * 0.02) * 0.5;
        value += noise(x * 0.05, y * 0.05) * 0.3;
        value += noise(x * 0.1, y * 0.1) * 0.2;

        // Add some crater-like features
        const craterNoise = noise(x * 0.01, y * 0.01);
        if (craterNoise > 0.7) {
          value *= 0.7;
        }

        const gray = Math.floor(value * 200 + 55);
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
        data[i + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);

    state.current.sourceImageData = imageData;
    state.current.sourcePix = data;
    state.current.sourceImage = { width: size, height: size };
  }, []);

  // Get pixel from source texture
  const getSourceImagePixel = useCallback((x, y) => {
    const s = state.current;
    if (!s.sourceImageData) return { r: 128, g: 128, b: 128, a: 255 };

    const i = (x + y * s.sourceImage.width) * 4;
    return {
      r: s.sourcePix[i] || 128,
      g: s.sourcePix[i + 1] || 128,
      b: s.sourcePix[i + 2] || 128,
      a: s.sourcePix[i + 3] || 255,
    };
  }, []);

  // Create a particle
  const addParticle = useCallback((x, y, z, r, g, b, a, type) => {
    return {
      x, y, z,
      ox: x, oy: y, oz: z,
      vx: 0, vy: 0, vz: 0,
      color: { r, g, b, a },
      x2d: 0, y2d: 0,
      type,
    };
  }, []);

  // Initialize particles
  const addParticles = useCallback(() => {
    const s = state.current;
    const c = config.current;

    const model = {
      rotation: { x: 0, y: 0, z: 0 },
      position: { x: 0, y: 0, z: 0 },
      modelInit: [],
    };

    // Create sphere particles
    for (let i = 0; i < c.particleCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / c.particleCount);
      const theta = Math.sqrt(c.particleCount * Math.PI) * phi;

      let x = model.position.x + (c.moonRadius * 2) * Math.cos(theta) * Math.sin(phi);
      let y = model.position.y + (c.moonRadius * 2) * Math.sin(theta) * Math.sin(phi);
      let z = model.position.z + (c.moonRadius * 2) * Math.cos(phi);

      const particleColorValue = Math.floor(Math.random() * 205) + 50;
      const particle = addParticle(x, y, z, particleColorValue, particleColorValue, particleColorValue, 255, 'MOON');

      // Map 3D to 2D texture coordinates
      const dx = model.position.x - particle.x;
      const dy = model.position.y - particle.y;
      const dz = model.position.z - particle.z;
      const length = Math.sqrt(dx * dx + dy * dy + dz * dz);

      const px = dx / length;
      const py = dy / length;
      const pz = dz / length;

      const u = Math.atan2(px, pz) / (2 * Math.PI) + 0.5;
      const v = Math.asin(py) / Math.PI + 0.5;

      if (s.sourceImage) {
        const nx = u * s.sourceImage.width;
        const ny = v * s.sourceImage.height;
        const color = getSourceImagePixel(nx | 0, ny | 0);

        particle.color.r = color.r;
        particle.color.g = color.g;
        particle.color.b = color.b;
      }

      // Bump mapping based on brightness
      const threshold = (particle.color.r + particle.color.g + particle.color.b) / 3;
      const percent = threshold / 255;
      const distance = (percent / c.bumpScale) + 1;

      particle.x *= distance;
      particle.y *= distance;
      particle.z *= distance;

      model.modelInit.push(particle);
    }

    // Light source particles
    const light = {
      x: 150,
      y: -150,
      z: -150,
      brightness: c.lightBrightness,
      radius: c.lightRadius,
    };

    const lightParticleCount = 300;
    for (let i = 0; i < lightParticleCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / lightParticleCount);
      const theta = Math.sqrt(lightParticleCount * Math.PI) * phi;

      const x = 15 * Math.cos(theta) * Math.sin(phi);
      const y = 15 * Math.sin(theta) * Math.sin(phi);
      const z = 15 * Math.cos(phi);

      const particle = addParticle(x, y, z, 255, 255, 255, 255, 'LIGHT');
      model.modelInit.push(particle);
    }

    s.model = model;
    s.light = light;
  }, [addParticle, getSourceImagePixel]);

  // Set pixel in image data
  const setPixel = useCallback((x, y, r, g, b, a) => {
    const s = state.current;
    if (x < 0 || x >= s.width || y < 0 || y >= s.height) return;

    const i = (x + y * s.width) * 4;
    s.pix[i] = r;
    s.pix[i + 1] = g;
    s.pix[i + 2] = b;
    s.pix[i + 3] = a;
  }, []);

  // Clear image data
  const clearImageData = useCallback(() => {
    const s = state.current;
    if (!s.pix) return;

    for (let i = 0, l = s.pix.length; i < l; i += 4) {
      s.pix[i] = 0;
      s.pix[i + 1] = 0;
      s.pix[i + 2] = 0;
      s.pix[i + 3] = 0;
    }
  }, []);

  // Render frame
  const render = useCallback(() => {
    const s = state.current;
    const c = config.current;

    if (!s.model || !s.pix) return;

    clearImageData();

    const MATHPI180 = Math.PI / 180;

    const rotationSpeedFactorX = c.rotationSpeed / s.center.x;
    const rotationSpeedFactorY = c.rotationSpeed / s.center.y;

    const fx = rotationSpeedFactorX * s.mousePos.x - c.rotationSpeed;
    const fy = c.rotationSpeed - rotationSpeedFactorY * s.mousePos.y;

    const angleX = fx * MATHPI180;
    const angleY = fy * MATHPI180;

    const sx = Math.sin(angleX);
    const cx = Math.cos(angleX);
    const sy = Math.sin(angleY);
    const cy = Math.cos(angleY);

    // Auto rotation values
    const ax = -0.15 * MATHPI180;
    const ay = 0.0 * MATHPI180;
    const sinx = Math.sin(ax);
    const cosx = Math.cos(ax);
    const siny = Math.sin(ay);
    const cosy = Math.cos(ay);

    const model = s.model;
    const light = s.light;
    const fov = c.fov;

    // Process particles
    for (let i = 0, l = model.modelInit.length; i < l; i++) {
      const particle = model.modelInit[i];

      // 3D rotation
      let rx = particle.x;
      let rz = particle.y * sy + particle.z * cy;

      particle.x = rx * cx + rz * sx;
      particle.y = particle.y * cy + particle.z * -sy;
      particle.z = rx * -sx + rz * cx;

      if (particle.z < -50 && particle.type === 'MOON') {
        // Direction vector
        const dx = model.position.x - particle.x;
        const dy = model.position.y - particle.y;
        const dz = model.position.z - particle.z;
        const length = Math.sqrt(dx * dx + dy * dy + dz * dz);

        particle.vx = -dx / length;
        particle.vy = -dy / length;
        particle.vz = -dz / length;

        // Lighting calculation
        const dotProd = particle.vx * light.x + particle.vy * light.y + particle.vz * light.z;
        const normMag = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy + particle.vz * particle.vz);
        const lightMag = Math.sqrt(light.x * light.x + light.y * light.y + light.z * light.z);
        const lightFactor = (Math.acos(dotProd / (normMag * lightMag)) / Math.PI) * light.brightness;

        const colorValueR = particle.color.r - Math.floor(particle.color.r * (lightFactor * 2));
        const colorValueG = particle.color.g - Math.floor(particle.color.g * (lightFactor * 2));
        const colorValueB = particle.color.b - Math.floor(particle.color.b * (lightFactor * 2));

        // 2D projection
        const scale = fov / (fov + particle.z);
        particle.x2d = ((particle.x * scale) + s.center.x) | 0;
        particle.y2d = ((particle.y * scale) + s.center.y) | 0;

        if (particle.x2d > 0 && particle.x2d < s.width &&
            particle.y2d > 0 && particle.y2d < s.height &&
            colorValueR > 0) {
          setPixel(particle.x2d, particle.y2d, colorValueR, colorValueG, colorValueB, 255);
        }
      }

      if (particle.type === 'LIGHT') {
        // Light particles auto-rotation
        const px = particle.ox;
        const py = particle.oy;
        const pz = particle.oz;

        rx = px;
        rz = py * siny + pz * cosy;

        const nx = rx * cosx + rz * sinx;
        const ny = py * cosy + pz * -siny;
        const nz = rx * -sinx + rz * cosx;

        particle.x = nx + light.x;
        particle.y = ny + light.y;
        particle.z = nz + light.z;

        const scale = fov / (fov + particle.z);
        particle.x2d = ((particle.x * scale) + s.center.x) | 0;
        particle.y2d = ((particle.y * scale) + s.center.y) | 0;

        if (particle.x2d > 0 && particle.x2d < s.width &&
            particle.y2d > 0 && particle.y2d < s.height) {
          setPixel(particle.x2d, particle.y2d, 255, 255, 255, 255);
        }
      }
    }

    // Update light position with rotation
    rx = light.x;
    rz = light.y * sy + light.z * cy;

    light.x = rx * cx + rz * sx;
    light.y = light.y * cy + light.z * -sy;
    light.z = rx * -sx + rz * cx;

    // Light auto-rotation
    const lpx = light.x - model.position.x;
    const lpy = light.y - model.position.y;
    const lpz = light.z - model.position.z;

    rx = lpx;
    rz = lpy * siny + lpz * cosy;

    light.x = (rx * cosx + rz * sinx) + model.position.x;
    light.y = (lpy * cosy + lpz * -siny) + model.position.y;
    light.z = (rx * -sinx + rz * cosx) + model.position.z;
  }, [clearImageData, setPixel]);

  // Animation loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const s = state.current;

    if (!canvas || !ctx || !s.initialized) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }

    render();

    if (s.imageData) {
      ctx.putImageData(s.imageData, 0, 0);
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [render]);

  // Initialize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const s = state.current;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;

      s.width = rect.width;
      s.height = rect.height;
      canvas.width = s.width;
      canvas.height = s.height;

      s.center.x = s.width / 2;
      s.center.y = s.height / 2;
      s.mousePos.x = s.center.x;
      s.mousePos.y = s.center.y;

      s.imageData = ctx.createImageData(s.width, s.height);
      s.pix = s.imageData.data;

      // Reinitialize particles if texture is loaded
      if (s.sourceImage) {
        addParticles();
      }
    };

    // Generate texture and initialize
    generateTexture();
    resize();
    addParticles();
    s.initialized = true;

    // Mouse events on parent section
    const section = canvas.closest('section') || canvas.parentElement;

    const handlePointerMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      s.mousePos.x = e.clientX - rect.left;
      s.mousePos.y = e.clientY - rect.top;
    };

    const handlePointerLeave = () => {
      s.mousePos.x = s.center.x;
      s.mousePos.y = s.center.y;
    };

    section.addEventListener('pointermove', handlePointerMove);
    section.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('resize', resize);

    // Start animation
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      section.removeEventListener('pointermove', handlePointerMove);
      section.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate, addParticles, generateTexture]);

  return (
    <canvas
      ref={canvasRef}
      className={`sphere-animation ${className}`}
    />
  );
}

export default SphereAnimation;
