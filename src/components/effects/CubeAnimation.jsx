import { useEffect, useRef, useCallback } from 'react';
import './CubeAnimation.css';

/**
 * CubeAnimation - 3D rotating cube with noise-displaced particles
 *
 * A cube made of particles that rotate and deform based on simplex noise.
 * Based on a gl-matrix + simplex noise implementation.
 */
function CubeAnimation({ className = '' }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const stateRef = useRef({
    width: 0,
    height: 0,
    cube: [],
    initialized: false,
    time: 0,           // Accumulated animation time
    lastFrameTime: 0,  // Last frame timestamp for delta calculation
  });

  // Simple seeded random for consistent results
  const seededRandom = useCallback((seed) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }, []);

  // Simplex noise implementation
  const createSimplexNoise = useCallback(() => {
    const F4 = (Math.sqrt(5) - 1) / 4;
    const G4 = (5 - Math.sqrt(5)) / 20;

    const grad4 = [
      [0,1,1,1],[0,1,1,-1],[0,1,-1,1],[0,1,-1,-1],
      [0,-1,1,1],[0,-1,1,-1],[0,-1,-1,1],[0,-1,-1,-1],
      [1,0,1,1],[1,0,1,-1],[1,0,-1,1],[1,0,-1,-1],
      [-1,0,1,1],[-1,0,1,-1],[-1,0,-1,1],[-1,0,-1,-1],
      [1,1,0,1],[1,1,0,-1],[1,-1,0,1],[1,-1,0,-1],
      [-1,1,0,1],[-1,1,0,-1],[-1,-1,0,1],[-1,-1,0,-1],
      [1,1,1,0],[1,1,-1,0],[1,-1,1,0],[1,-1,-1,0],
      [-1,1,1,0],[-1,1,-1,0],[-1,-1,1,0],[-1,-1,-1,0]
    ];

    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) {
      p[i] = Math.floor(seededRandom(i * 1.337) * 256);
    }

    const perm = new Uint8Array(512);
    const permMod32 = new Uint8Array(512);
    for (let i = 0; i < 512; i++) {
      perm[i] = p[i & 255];
      permMod32[i] = perm[i] % 32;
    }

    const dot4 = (g, x, y, z, w) => g[0]*x + g[1]*y + g[2]*z + g[3]*w;

    return {
      noise4D(x, y, z, w) {
        const s = (x + y + z + w) * F4;
        const i = Math.floor(x + s);
        const j = Math.floor(y + s);
        const k = Math.floor(z + s);
        const l = Math.floor(w + s);

        const t = (i + j + k + l) * G4;
        const X0 = i - t, Y0 = j - t, Z0 = k - t, W0 = l - t;
        const x0 = x - X0, y0 = y - Y0, z0 = z - Z0, w0 = w - W0;

        let rankx = 0, ranky = 0, rankz = 0, rankw = 0;
        if (x0 > y0) rankx++; else ranky++;
        if (x0 > z0) rankx++; else rankz++;
        if (x0 > w0) rankx++; else rankw++;
        if (y0 > z0) ranky++; else rankz++;
        if (y0 > w0) ranky++; else rankw++;
        if (z0 > w0) rankz++; else rankw++;

        const i1 = rankx >= 3 ? 1 : 0, j1 = ranky >= 3 ? 1 : 0;
        const k1 = rankz >= 3 ? 1 : 0, l1 = rankw >= 3 ? 1 : 0;
        const i2 = rankx >= 2 ? 1 : 0, j2 = ranky >= 2 ? 1 : 0;
        const k2 = rankz >= 2 ? 1 : 0, l2 = rankw >= 2 ? 1 : 0;
        const i3 = rankx >= 1 ? 1 : 0, j3 = ranky >= 1 ? 1 : 0;
        const k3 = rankz >= 1 ? 1 : 0, l3 = rankw >= 1 ? 1 : 0;

        const x1 = x0 - i1 + G4, y1 = y0 - j1 + G4, z1 = z0 - k1 + G4, w1 = w0 - l1 + G4;
        const x2 = x0 - i2 + 2*G4, y2 = y0 - j2 + 2*G4, z2 = z0 - k2 + 2*G4, w2 = w0 - l2 + 2*G4;
        const x3 = x0 - i3 + 3*G4, y3 = y0 - j3 + 3*G4, z3 = z0 - k3 + 3*G4, w3 = w0 - l3 + 3*G4;
        const x4 = x0 - 1 + 4*G4, y4 = y0 - 1 + 4*G4, z4 = z0 - 1 + 4*G4, w4 = w0 - 1 + 4*G4;

        const ii = i & 255, jj = j & 255, kk = k & 255, ll = l & 255;

        let n0 = 0, n1 = 0, n2 = 0, n3 = 0, n4 = 0;

        let t0 = 0.6 - x0*x0 - y0*y0 - z0*z0 - w0*w0;
        if (t0 >= 0) {
          const gi0 = permMod32[ii + perm[jj + perm[kk + perm[ll]]]];
          t0 *= t0;
          n0 = t0 * t0 * dot4(grad4[gi0], x0, y0, z0, w0);
        }

        let t1 = 0.6 - x1*x1 - y1*y1 - z1*z1 - w1*w1;
        if (t1 >= 0) {
          const gi1 = permMod32[ii + i1 + perm[jj + j1 + perm[kk + k1 + perm[ll + l1]]]];
          t1 *= t1;
          n1 = t1 * t1 * dot4(grad4[gi1], x1, y1, z1, w1);
        }

        let t2 = 0.6 - x2*x2 - y2*y2 - z2*z2 - w2*w2;
        if (t2 >= 0) {
          const gi2 = permMod32[ii + i2 + perm[jj + j2 + perm[kk + k2 + perm[ll + l2]]]];
          t2 *= t2;
          n2 = t2 * t2 * dot4(grad4[gi2], x2, y2, z2, w2);
        }

        let t3 = 0.6 - x3*x3 - y3*y3 - z3*z3 - w3*w3;
        if (t3 >= 0) {
          const gi3 = permMod32[ii + i3 + perm[jj + j3 + perm[kk + k3 + perm[ll + l3]]]];
          t3 *= t3;
          n3 = t3 * t3 * dot4(grad4[gi3], x3, y3, z3, w3);
        }

        let t4 = 0.6 - x4*x4 - y4*y4 - z4*z4 - w4*w4;
        if (t4 >= 0) {
          const gi4 = permMod32[ii + 1 + perm[jj + 1 + perm[kk + 1 + perm[ll + 1]]]];
          t4 *= t4;
          n4 = t4 * t4 * dot4(grad4[gi4], x4, y4, z4, w4);
        }

        return 27 * (n0 + n1 + n2 + n3 + n4);
      }
    };
  }, [seededRandom]);

  // Matrix/Vector math utilities
  const mat4 = {
    create: () => new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]),

    rotateX: (out, a, rad) => {
      const s = Math.sin(rad), c = Math.cos(rad);
      const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
      const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
      out.set(a);
      out[4] = a10 * c + a20 * s; out[5] = a11 * c + a21 * s;
      out[6] = a12 * c + a22 * s; out[7] = a13 * c + a23 * s;
      out[8] = a20 * c - a10 * s; out[9] = a21 * c - a11 * s;
      out[10] = a22 * c - a12 * s; out[11] = a23 * c - a13 * s;
      return out;
    },

    rotateY: (out, a, rad) => {
      const s = Math.sin(rad), c = Math.cos(rad);
      const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
      const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
      out.set(a);
      out[0] = a00 * c - a20 * s; out[1] = a01 * c - a21 * s;
      out[2] = a02 * c - a22 * s; out[3] = a03 * c - a23 * s;
      out[8] = a00 * s + a20 * c; out[9] = a01 * s + a21 * c;
      out[10] = a02 * s + a22 * c; out[11] = a03 * s + a23 * c;
      return out;
    },

    rotateZ: (out, a, rad) => {
      const s = Math.sin(rad), c = Math.cos(rad);
      const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
      const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
      out.set(a);
      out[0] = a00 * c + a10 * s; out[1] = a01 * c + a11 * s;
      out[2] = a02 * c + a12 * s; out[3] = a03 * c + a13 * s;
      out[4] = a10 * c - a00 * s; out[5] = a11 * c - a01 * s;
      out[6] = a12 * c - a02 * s; out[7] = a13 * c - a03 * s;
      return out;
    },

    multiply: (out, a, b) => {
      const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
      const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
      const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
      const a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

      let b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
      out[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
      out[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
      out[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
      out[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

      b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
      out[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
      out[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
      out[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
      out[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

      b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
      out[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
      out[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
      out[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
      out[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

      b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
      out[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
      out[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
      out[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
      out[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
      return out;
    },

    lookAt: (out, eye, center, up) => {
      let x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
      const eyex = eye[0], eyey = eye[1], eyez = eye[2];
      const upx = up[0], upy = up[1], upz = up[2];
      const centerx = center[0], centery = center[1], centerz = center[2];

      z0 = eyex - centerx; z1 = eyey - centery; z2 = eyez - centerz;
      len = 1 / Math.sqrt(z0*z0 + z1*z1 + z2*z2);
      z0 *= len; z1 *= len; z2 *= len;

      x0 = upy * z2 - upz * z1;
      x1 = upz * z0 - upx * z2;
      x2 = upx * z1 - upy * z0;
      len = Math.sqrt(x0*x0 + x1*x1 + x2*x2);
      if (len) { len = 1/len; x0 *= len; x1 *= len; x2 *= len; }

      y0 = z1 * x2 - z2 * x1;
      y1 = z2 * x0 - z0 * x2;
      y2 = z0 * x1 - z1 * x0;
      len = Math.sqrt(y0*y0 + y1*y1 + y2*y2);
      if (len) { len = 1/len; y0 *= len; y1 *= len; y2 *= len; }

      out[0] = x0; out[1] = y0; out[2] = z0; out[3] = 0;
      out[4] = x1; out[5] = y1; out[6] = z1; out[7] = 0;
      out[8] = x2; out[9] = y2; out[10] = z2; out[11] = 0;
      out[12] = -(x0*eyex + x1*eyey + x2*eyez);
      out[13] = -(y0*eyex + y1*eyey + y2*eyez);
      out[14] = -(z0*eyex + z1*eyey + z2*eyez);
      out[15] = 1;
      return out;
    },

    perspective: (out, fovy, aspect, near, far) => {
      const f = 1.0 / Math.tan(fovy / 2);
      out.fill(0);
      out[0] = f / aspect;
      out[5] = f;
      out[10] = (far + near) / (near - far);
      out[11] = -1;
      out[14] = (2 * far * near) / (near - far);
      return out;
    },
  };

  const vec3 = {
    create: () => new Float32Array(3),
    fromValues: (x, y, z) => new Float32Array([x, y, z]),

    transformMat4: (out, a, m) => {
      const x = a[0], y = a[1], z = a[2];
      const w = m[3]*x + m[7]*y + m[11]*z + m[15] || 1.0;
      out[0] = (m[0]*x + m[4]*y + m[8]*z + m[12]) / w;
      out[1] = (m[1]*x + m[5]*y + m[9]*z + m[13]) / w;
      out[2] = (m[2]*x + m[6]*y + m[10]*z + m[14]) / w;
      return out;
    },

    dot: (a, b) => a[0]*b[0] + a[1]*b[1] + a[2]*b[2],

    sub: (out, a, b) => {
      out[0] = a[0] - b[0];
      out[1] = a[1] - b[1];
      out[2] = a[2] - b[2];
      return out;
    },

    normalize: (out, a) => {
      const len = Math.sqrt(a[0]*a[0] + a[1]*a[1] + a[2]*a[2]) || 1;
      out[0] = a[0] / len;
      out[1] = a[1] / len;
      out[2] = a[2] / len;
      return out;
    },

    scaleAndAdd: (out, a, b, scale) => {
      out[0] = a[0] + b[0] * scale;
      out[1] = a[1] + b[1] * scale;
      out[2] = a[2] + b[2] * scale;
      return out;
    },

    length: (a) => Math.sqrt(a[0]*a[0] + a[1]*a[1] + a[2]*a[2]),

    scale: (out, a, s) => {
      out[0] = a[0] * s;
      out[1] = a[1] * s;
      out[2] = a[2] * s;
      return out;
    },
  };

  const vec4 = {
    create: () => new Float32Array(4),

    transformMat4: (out, a, m) => {
      const x = a[0], y = a[1], z = a[2], w = a[3];
      out[0] = m[0]*x + m[4]*y + m[8]*z + m[12]*w;
      out[1] = m[1]*x + m[5]*y + m[9]*z + m[13]*w;
      out[2] = m[2]*x + m[6]*y + m[10]*z + m[14]*w;
      out[3] = m[3]*x + m[7]*y + m[11]*z + m[15]*w;
      return out;
    },
  };

  // Initialize cube geometry
  const initCube = useCallback(() => {
    const cube = [];
    const grid = 30;

    for (let i = 0; i < 3; i++) {
      const j = (i + 1) % 3;
      const k = (i + 2) % 3;

      for (let z = -1; z <= 1; z += 2) {
        const side = [];
        side.normal = vec3.create();
        side.normal[k] = z;

        for (let x = -grid; x <= grid; x++) {
          for (let y = -grid; y <= grid; y++) {
            const point = vec4.create();
            point[i] = x / grid;
            point[j] = y / grid;
            point[k] = z;
            point[3] = 1;
            point.rnd = Math.random();
            side.push(point);
          }
        }
        cube.push(side);
      }
    }

    return cube;
  }, [vec3, vec4]);

  // Render loop
  const render = useCallback((timestamp) => {
    const canvas = canvasRef.current;
    const s = stateRef.current;

    if (!canvas || !s.initialized) {
      animationRef.current = requestAnimationFrame(render);
      return;
    }

    // Calculate delta time (capped to prevent jumps when frames are dropped)
    const now = timestamp || performance.now();
    const deltaTime = s.lastFrameTime ? Math.min((now - s.lastFrameTime) / 1000, 0.1) : 0;
    s.lastFrameTime = now;
    s.time += deltaTime;

    const context = canvas.getContext('2d');
    const T = s.time;  // Use accumulated time instead of absolute time
    const W = s.width;
    const H = s.height;
    const RAD = Math.PI / 180;

    const camera = vec3.fromValues(0, 0, 5);
    const light = [0, 0, 5, 15]; // vec4 with intensity

    // Build model matrix (rotation)
    let model = mat4.create();
    mat4.rotateX(model, model, T / 5);
    const modelY = mat4.create();
    mat4.rotateY(modelY, modelY, T / 6);
    mat4.multiply(model, model, modelY);
    const modelZ = mat4.create();
    mat4.rotateZ(modelZ, modelZ, T / 7);
    mat4.multiply(model, model, modelZ);

    // Build view-projection matrix
    const view = mat4.create();
    mat4.lookAt(view, camera, [0, 0, 0], [0, 1, 0]);
    const proj = mat4.create();
    mat4.perspective(proj, 45 * RAD, W / H, 0.001, 1000);
    const viewProj = mat4.create();
    mat4.multiply(viewProj, proj, view);

    // Temp vectors
    const vp = vec4.create();
    const wp = vec4.create();
    const wn = vec3.create();
    const temp = vec3.create();

    context.clearRect(0, 0, W, H);
    context.beginPath();

    for (const side of s.cube) {
      // Transform normal
      vec3.transformMat4(wn, side.normal, model);
      // Transform first point to check facing
      vec4.transformMat4(wp, side[0], model);

      // Back-face culling
      vec3.sub(temp, camera, wp);
      if (vec3.dot(wn, temp) > 0) {
        for (const point of side) {
          // Transform point to world space
          vec4.transformMat4(wp, point, model);

          const x = wp[0], y = wp[1], z = wp[2];

          // Apply noise displacement
          const sn = s.simplex.noise4D(x * 0.5, y * 0.5, z * 0.5, T / 10);
          const pr = 0.5 + 0.5 * Math.sin(Math.PI * 2 * (point.rnd + T / 2));

          vec3.normalize(temp, wp);
          vec3.scaleAndAdd(wp, wp, temp, 0.2 * sn + 0.1 * pr * sn);

          // Project to screen
          vec4.transformMat4(vp, wp, viewProj);
          const px = vp[0] / vp[3];
          const py = vp[1] / vp[3];
          const pz = vp[2] / vp[3];
          const pw = vp[3];

          if (pz >= -1 && pz <= 1 && py >= -1 && py <= 1 && px >= -1 && px <= 1) {
            // Lighting
            vec3.sub(temp, light, wp);
            const l = vec3.length(temp);
            vec3.normalize(temp, temp);
            const lightIntensity = (light[3] / (l * l)) * vec3.dot(wn, temp);

            // Particle size based on distance, noise, and light
            let w = (H / pw) * 0.02 * lightIntensity *
              (0.50 + 0.50 * sn) *
              (0.25 + 0.75 * pr);

            if (w > 0.1) {
              const screenX = (px + 1) * 0.5 * W;
              const screenY = (1 - py) * 0.5 * H;
              context.rect(screenX - w, screenY - w, 2 * w, 2 * w);
            }
          }
        }
      }
    }

    context.fillStyle = '#FFF';
    context.fill();

    animationRef.current = requestAnimationFrame(render);
  }, [mat4, vec3, vec4]);

  // Handle resize
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const s = stateRef.current;
    const container = canvas.parentElement;

    const newWidth = container?.clientWidth || window.innerWidth;
    const newHeight = container?.clientHeight || window.innerHeight;

    // Only update if dimensions actually changed (avoid unnecessary resets during scroll)
    if (s.width === newWidth && s.height === newHeight) return;

    s.width = newWidth;
    s.height = newHeight;

    canvas.width = s.width;
    canvas.height = s.height;
  }, []);

  // Setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const s = stateRef.current;
    const container = canvas.parentElement;

    // Find parent section for event attachment
    const section = canvas.closest('section');
    const eventTarget = section || document;

    const initTimer = setTimeout(() => {
      s.simplex = createSimplexNoise();
      s.cube = initCube();
      handleResize();
      s.initialized = true;
      animationRef.current = requestAnimationFrame(render);
    }, 50);

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
    };
  }, [createSimplexNoise, initCube, handleResize, render]);

  return (
    <canvas
      ref={canvasRef}
      className={`cube-animation ${className}`}
      aria-hidden="true"
    />
  );
}

export default CubeAnimation;
