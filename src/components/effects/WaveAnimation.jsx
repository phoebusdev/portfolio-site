import { useEffect, useRef, useCallback } from 'react';
import './WaveAnimation.css';

/**
 * WaveAnimation - 3D particle wave using Three.js WebGPU
 *
 * A grid of 100,000 particles that animate in a wave pattern using
 * compute shaders for GPU-accelerated animation.
 */
function WaveAnimation({ className = '' }) {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const animationRef = useRef(null);
  const computeParticlesRef = useRef(null);
  const initializedRef = useRef(false);

  const init = useCallback(async () => {
    if (initializedRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Dynamic imports for Three.js WebGPU
    let THREE, WebGPURenderer, Fn, float, vec3, sin, time, instancedArray, instanceIndex;

    try {
      // Import Three.js core and WebGPU modules
      THREE = await import('three');
      const webgpu = await import('three/webgpu');
      const tsl = await import('three/tsl');

      WebGPURenderer = webgpu.WebGPURenderer;
      Fn = tsl.Fn;
      float = tsl.float;
      vec3 = tsl.vec3;
      sin = tsl.sin;
      time = tsl.time;
      instancedArray = tsl.instancedArray;
      instanceIndex = tsl.instanceIndex;
    } catch (e) {
      console.warn('Three.js WebGPU not available, skipping WaveAnimation');
      return;
    }

    // Check WebGPU support
    if (!navigator.gpu) {
      console.warn('WebGPU not supported, skipping WaveAnimation');
      return;
    }

    const particleCount = 100_000;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(50, width / height, 10, 100000);
    camera.position.set(0, 200, 500);
    cameraRef.current = camera;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Instanced arrays for positions and sizes
    const positions = instancedArray(particleCount, 'vec3');
    const sizes = instancedArray(particleCount, 'vec3');

    // Compute shader parameters
    const separation = 100;
    const amount = Math.sqrt(particleCount);
    const offset = float(amount / 2);

    // Initialize particles
    const computeInit = Fn(() => {
      const position = positions.element(instanceIndex);
      const size = sizes.element(instanceIndex);

      const x = instanceIndex.mod(amount);
      const z = instanceIndex.div(amount);

      position.x = offset.sub(x).mul(separation);
      position.z = offset.sub(z).mul(separation);

      size.assign(vec3(1.0));
    })().compute(particleCount);

    // Update particles (wave animation)
    const computeUpdate = Fn(() => {
      const x = float(instanceIndex.mod(amount)).mul(0.5);
      const z = float(instanceIndex.div(amount)).mul(0.5);

      const time2 = float(1).sub(time).mul(5);

      const position = positions.element(instanceIndex);

      const sinX = sin(x.add(time2).mul(0.7)).mul(50);
      const sinZ = sin(z.add(time2).mul(0.5)).mul(50);

      position.y = sinX.add(sinZ);

      const size = sizes.element(instanceIndex);

      const sinSX = sin(x.add(time2).mul(0.7)).add(1).mul(5);
      const sinSZ = sin(z.add(time2).mul(0.5)).add(1).mul(5);

      size.assign(sinSX.add(sinSZ));
    });

    computeParticlesRef.current = computeUpdate().compute(particleCount);

    // Create particle material
    const material = new THREE.SpriteNodeMaterial();
    material.colorNode = vec3(1.0);
    material.positionNode = positions.toAttribute();
    material.scaleNode = sizes.toAttribute();
    material.transparent = false;

    // Create particle geometry
    const geometry = new THREE.CircleGeometry();
    const particles = new THREE.Mesh(geometry, material);
    particles.count = particleCount;
    particles.frustumCulled = false;
    scene.add(particles);

    // Renderer setup
    const renderer = new WebGPURenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Initialize compute
    await renderer.computeAsync(computeInit);

    initializedRef.current = true;

    // Animation loop
    const animate = () => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;

      // Auto-rotate camera slowly around the scene
      const t = Date.now() * 0.0001;
      cameraRef.current.position.x = Math.sin(t) * 500;
      cameraRef.current.position.z = Math.cos(t) * 500;
      cameraRef.current.lookAt(0, 0, 0);

      rendererRef.current.compute(computeParticlesRef.current);
      rendererRef.current.render(sceneRef.current, cameraRef.current);

      animationRef.current = requestAnimationFrame(animate);
    };

    renderer.setAnimationLoop(animate);
  }, []);

  const handleResize = useCallback(() => {
    if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;

    const width = containerRef.current.clientWidth || window.innerWidth;
    const height = containerRef.current.clientHeight || window.innerHeight;

    cameraRef.current.aspect = width / height;
    cameraRef.current.updateProjectionMatrix();

    rendererRef.current.setSize(width, height);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Delay initialization to ensure container is ready
    const initTimer = setTimeout(() => {
      init();
    }, 100);

    window.addEventListener('resize', handleResize);

    // Watch for container size changes
    let resizeObserver = null;
    if (container) {
      resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(container);
    }

    return () => {
      clearTimeout(initTimer);
      window.removeEventListener('resize', handleResize);

      if (resizeObserver) {
        resizeObserver.disconnect();
      }

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      if (rendererRef.current) {
        rendererRef.current.setAnimationLoop(null);
        rendererRef.current.dispose();
        if (rendererRef.current.domElement && rendererRef.current.domElement.parentNode) {
          rendererRef.current.domElement.parentNode.removeChild(rendererRef.current.domElement);
        }
      }

      initializedRef.current = false;
    };
  }, [init, handleResize]);

  return (
    <div
      ref={containerRef}
      className={`wave-animation ${className}`}
      aria-hidden="true"
    />
  );
}

export default WaveAnimation;
