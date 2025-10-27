# Bundle Optimization Research: Performance-Critical Pitch Site

## Decision: Vite + Rollup with Aggressive Tree-Shaking

**Target**: <150KB per route, <2s load time on 4G

## Rationale

### Bundle Size Achievement: How to Stay Under 150KB

Based on 2025 industry data:
- **Vite produces 13% smaller bundles** than Webpack (130KB vs 150KB average)
- **Modern best practice targets 50KB chunks** for optimal HTTP/2 multiplexing
- **150KB per route is achievable** but conservative; aim for 50-100KB per route

**Strategy to achieve target**:
1. **Aggressive tree-shaking**: Rollup's tree-shaking removes unused code automatically
2. **Route-based code splitting**: 50-70% reduction in initial bundle size
3. **Brotli compression**: Additional 10-15% reduction beyond gzip (70% total compression)
4. **Minimal animation library**: Motion One (2.3KB-18KB) vs GSAP (69KB) or Anime.js (75KB)

### Code Splitting Approach: Route-Based Primary, Component-Level Secondary

**Route-Based (Primary)**:
```javascript
// Vue Router with dynamic imports
const Section1 = () => import('./views/Section1.vue')
const Section2 = () => import('./views/Section2.vue')
const Section3 = () => import('./views/Section3.vue')

// React Router with React.lazy
const Section1 = lazy(() => import('./views/Section1'))
```

**Benefits**:
- Native support in Vue Router and React Router
- Automatic code splitting by Vite/Rollup
- Deferred loading until route visited
- Best for single-page app with distinct sections

**Component-Level (Secondary)**:
- Heavy components (3D viewers, charts, etc.)
- Below-fold interactive elements
- Animation-heavy sections

**Chunking Strategy**:
- Vendor dependencies: Separate chunk for better caching
- Shared utilities: Common chunk across routes
- Route-specific: Individual chunks per section

### Load Time Impact: Expected Performance on 4G

**Industry Benchmarks (2025)**:
- 47% of users expect <2s load time
- Average mobile page: 1.9s to load main content
- Google LCP recommendation: 2.5s

**Expected Performance**:
- **Initial load**: 1.2-1.5s (first route only)
- **Route transitions**: 200-400ms (cached chunks)
- **4G network**: Well under 2s target with proper optimization

**Real-world improvements from similar optimization**:
- ~740KB savings, 1.14s rendering time reduction
- ~200KB HTML reduction, 250-300ms download improvement
- 70% bundle size reduction with compression
- 60% page load time improvement
- 56% time-to-interactive reduction

## Alternatives Considered

### 1. Webpack 5
**Pros**:
- Mature ecosystem with extensive plugins
- Advanced optimization techniques
- Granular control over tree-shaking

**Cons**:
- 13% larger bundles than Vite (150KB vs 130KB)
- Slower build times
- More complex configuration required
- No automatic code splitting out-of-the-box

**Tree-shaking**: Excellent in production mode, but requires manual configuration

**Verdict**: Too heavy and complex for a performance-critical pitch site

### 2. Parcel 2
**Pros**:
- Zero-config setup
- Tree-shaking enabled by default
- Fast builds (<1s for small apps, 10ms hot-reload)
- Automatic code splitting

**Cons**:
- Less granular control than Vite/Webpack
- Smaller ecosystem and plugin support
- Less transparent optimization process

**Tree-shaking**: Good out-of-the-box but less control

**Verdict**: Good for rapid prototyping but lacks fine-tuning capabilities needed for <150KB target

### 3. esbuild (Standalone)
**Pros**:
- 10-100x faster than JavaScript bundlers
- Written in Go for maximum performance
- Excellent for development speed

**Cons**:
- Code splitting still experimental and only works with ESM
- Less stable bundling compared to Rollup
- Cannot produce single optimized bundle with lazy routes by default
- Missing advanced optimization features

**Verdict**: Great for development, not production-ready for aggressive optimization

### 4. Pure Rollup
**Pros**:
- Best-in-class tree-shaking
- Minimal bundle overhead
- Maximum control over output

**Cons**:
- No dev server out-of-the-box
- Requires extensive manual configuration
- Slower development experience

**Verdict**: Excellent bundler but Vite wraps it with better DX

### 5. GSAP (Animation Library Alternative)
**Bundle size**: 69KB minified
**Pros**: Most powerful animation library
**Cons**: 5x larger than Motion One
**Verdict**: Too heavy for 150KB budget

### 6. Anime.js (Animation Library Alternative)
**Bundle size**: 75KB minified
**Pros**: Simple API, comprehensive features
**Cons**: Not tree-shakable, 7x larger than Motion One
**Verdict**: Excessive for performance budget

## Implementation Strategy

### Build Tool Configuration

**Vite Configuration** (`vite.config.js`):
```javascript
import { defineConfig } from 'vite'
import compression from 'vite-plugin-compression2'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  build: {
    // Target modern browsers for smaller output
    target: 'es2020',

    // Aggressive tree-shaking
    rollupOptions: {
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false
      },
      output: {
        // Manual chunk splitting
        manualChunks: {
          // Vendor chunk for caching
          vendor: ['vue', 'vue-router'], // or ['react', 'react-router-dom']
          // Animation library separate
          animation: ['motion']
        }
      }
    },

    // Reduce chunk size limit warnings
    chunkSizeWarningLimit: 150,

    // Enable CSS code splitting
    cssCodeSplit: true,

    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log']
      }
    }
  },

  plugins: [
    // Brotli + gzip compression
    compression({
      algorithm: 'brotliCompress',
      exclude: [/\.(br)$/, /\.(gz)$/],
      threshold: 1000, // Only compress files >1KB
      deleteOriginFile: false
    }),
    compression({
      algorithm: 'gzip',
      exclude: [/\.(br)$/, /\.(gz)$/],
      threshold: 1000
    }),

    // Bundle analysis
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ]
})
```

### Code Splitting Pattern

**Vue Router Setup**:
```javascript
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Section1',
    component: () => import('./views/Section1.vue')
  },
  {
    path: '/section2',
    name: 'Section2',
    component: () => import('./views/Section2.vue')
  },
  {
    path: '/section3',
    name: 'Section3',
    component: () => import('./views/Section3.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
```

**React Router Setup**:
```javascript
import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Lazy load route components
const Section1 = lazy(() => import('./views/Section1'))
const Section2 = lazy(() => import('./views/Section2'))
const Section3 = lazy(() => import('./views/Section3'))

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Section1 />} />
          <Route path="/section2" element={<Section2 />} />
          <Route path="/section3" element={<Section3 />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
```

**Component-Level Lazy Loading**:
```javascript
// Vue 3
const HeavyChart = defineAsyncComponent(() =>
  import('./components/HeavyChart.vue')
)

// React
const HeavyChart = lazy(() => import('./components/HeavyChart'))
```

### Image Optimization Workflow

**Tools**:
- **Sharp**: High-performance Node.js image processing (actively maintained)
- **Squoosh CLI**: DEPRECATED (web app still works, but don't use for automation)
- **ImageMinimizerWebpackPlugin**: Works with Vite via Rollup plugins

**Format Priority** (2025 recommendations):
1. **AVIF**: 20-30% smaller than WebP, 50%+ smaller than JPEG
2. **WebP**: 25-35% smaller than JPEG, universal browser support
3. **JPEG/PNG**: Fallback for older browsers

**Automation Script** (`optimize-images.js`):
```javascript
import sharp from 'sharp'
import { glob } from 'glob'
import path from 'path'

async function optimizeImages() {
  const images = await glob('src/assets/images/**/*.{jpg,jpeg,png}')

  for (const image of images) {
    const filename = path.parse(image).name
    const dir = path.dirname(image)

    // Generate AVIF (best compression)
    await sharp(image)
      .avif({ quality: 80, effort: 9 })
      .toFile(`${dir}/${filename}.avif`)

    // Generate WebP (fallback)
    await sharp(image)
      .webp({ quality: 85, effort: 6 })
      .toFile(`${dir}/${filename}.webp`)

    // Optimize original
    await sharp(image)
      .jpeg({ quality: 85, progressive: true })
      .png({ compressionLevel: 9 })
      .toFile(`${dir}/${filename}.opt${path.extname(image)}`)
  }
}

optimizeImages()
```

**HTML Picture Element**:
```html
<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Description" loading="lazy">
</picture>
```

### Lazy Loading Approach

**Intersection Observer for Images**:
```javascript
// Modern lazy loading with Intersection Observer
class LazyImageLoader {
  constructor() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage(entry.target)
          }
        })
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
        threshold: 0.01
      }
    )
  }

  loadImage(img) {
    const src = img.dataset.src
    const srcset = img.dataset.srcset

    if (src) img.src = src
    if (srcset) img.srcset = srcset

    img.classList.add('loaded')
    this.observer.unobserve(img)
  }

  observe(img) {
    this.observer.observe(img)
  }
}

// Usage
const loader = new LazyImageLoader()
document.querySelectorAll('img[data-src]').forEach(img => loader.observe(img))
```

**Native Lazy Loading (Simpler)**:
```html
<!-- Native browser lazy loading (supported in all modern browsers) -->
<img src="image.jpg" loading="lazy" alt="Description">
```

**Priority Hints for Critical Images** (LCP optimization):
```html
<!-- Hero/LCP image - load immediately -->
<img src="hero.jpg" fetchpriority="high" alt="Hero">

<!-- Below-fold images - deprioritize -->
<img src="footer.jpg" fetchpriority="low" loading="lazy" alt="Footer">
```

**Browser Support** (2025):
- fetchpriority: Chrome 102+, Safari 17.2+, Firefox 132+
- loading="lazy": All modern browsers
- Intersection Observer: All modern browsers

**Below-Fold Content Strategy**:
```javascript
// Defer non-critical JavaScript
const loadHeavyFeature = () => {
  import('./heavy-feature.js').then(module => {
    module.init()
  })
}

// Load when user scrolls near it
const observer = new IntersectionObserver(
  (entries) => {
    if (entries[0].isIntersecting) {
      loadHeavyFeature()
      observer.disconnect()
    }
  },
  { rootMargin: '200px' }
)

observer.observe(document.querySelector('#heavy-section'))
```

## Animation Library Recommendation: Motion One

**Bundle Size**: 2.3KB (mini) to 18KB (full)
**Why**:
- 7x smaller than GSAP (69KB)
- 4x smaller than Anime.js (75KB)
- Tree-shakable ES modules
- Modern API with WAAPI support

**Installation**:
```bash
npm install motion
```

**Usage Example**:
```javascript
import { animate, scroll, inView } from 'motion'

// Basic animation (2.3KB)
animate('.element', { opacity: 1, transform: 'translateY(0)' })

// Scroll-triggered (adds ~8KB)
scroll(animate('.parallax', { transform: ['translateY(0)', 'translateY(100px)'] }))

// Viewport triggers (adds ~5KB)
inView('.fade-in', ({ target }) => {
  animate(target, { opacity: 1 })
})
```

## Performance Budget Enforcement

**Package.json Script**:
```json
{
  "scripts": {
    "build": "vite build",
    "analyze": "vite build --mode analyze",
    "check-size": "size-limit"
  },
  "size-limit": [
    {
      "path": "dist/assets/index-*.js",
      "limit": "150 KB"
    },
    {
      "path": "dist/assets/*.css",
      "limit": "30 KB"
    }
  ]
}
```

**CI/CD Integration** (GitHub Actions example):
```yaml
name: Bundle Size Check
on: [pull_request]
jobs:
  size:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npx size-limit
```

## Expected Bundle Breakdown (per route)

### Route 1 (Initial Load): ~120KB total
- Vendor chunk (Vue/React + Router): 45KB
- Route component: 30KB
- Motion One (tree-shaken): 8KB
- Images (lazy loaded): 0KB (loaded on demand)
- CSS (route-specific): 15KB
- Common utilities: 22KB

### Route 2 (Subsequent): ~85KB total
- Vendor chunk: 0KB (cached)
- Route component: 35KB
- Route-specific CSS: 18KB
- Common utilities: 0KB (cached)
- Additional features: 32KB

### Route 3 (Subsequent): ~90KB total
- Vendor chunk: 0KB (cached)
- Route component: 40KB
- Route-specific CSS: 20KB
- Common utilities: 0KB (cached)
- Additional features: 30KB

## Key Takeaways

1. **Vite is the clear winner** for modern, performance-critical applications
2. **Route-based code splitting** is essential - reduces initial bundle by 50-70%
3. **Motion One over GSAP/Anime.js** - saves 50-70KB per route
4. **AVIF + WebP** images with native lazy loading
5. **Brotli compression** adds 10-15% extra reduction
6. **Target 50-100KB per route** for optimal performance (150KB is achievable but conservative)
7. **Use Intersection Observer** for lazy loading (performance-friendly)
8. **Enforce budgets in CI/CD** to prevent regressions

## Implementation Checklist

- [ ] Configure Vite with aggressive tree-shaking
- [ ] Set up route-based code splitting
- [ ] Install Motion One instead of GSAP/Anime.js
- [ ] Configure Brotli + gzip compression plugins
- [ ] Set up Sharp image optimization pipeline
- [ ] Convert images to AVIF + WebP formats
- [ ] Implement Intersection Observer for lazy loading
- [ ] Add fetchpriority="high" to LCP image
- [ ] Install bundle analyzer (rollup-plugin-visualizer)
- [ ] Configure size-limit for CI/CD checks
- [ ] Test on simulated 4G connection
- [ ] Measure Core Web Vitals (LCP < 2.5s target)

## Resources

- Vite Build Options: https://vite.dev/config/build-options
- Motion One Docs: https://motion.dev
- Sharp Image Processing: https://sharp.pixelplumbing.com
- Intersection Observer API: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
- Priority Hints: https://web.dev/articles/fetch-priority
- Bundle Size Tools: https://github.com/ai/size-limit
