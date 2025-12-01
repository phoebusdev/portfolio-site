# Deployment Guide

## Quick Deploy

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Or with custom target
VITE_TARGET_COMPANY=acme-corp vercel --prod
```

### Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir dist
```

### Custom Server

```bash
# Build for production
npm run build

# Serve the dist/ folder with any static file server
# Example with serve:
npx serve dist -s
```

## Environment Variables

### Target Company Customization

Set `VITE_TARGET_COMPANY` to load company-specific content:

```bash
# Development
VITE_TARGET_COMPANY=acme-corp npm run dev

# Production build
VITE_TARGET_COMPANY=acme-corp npm run build
```

### Content Structure

Content is loaded from `src/data/targets/{VITE_TARGET_COMPANY}/`:

```
src/data/targets/
├── _template/          # Default content
├── acme-corp/          # Acme Corp specific
└── techstart-inc/      # TechStart Inc specific
```

## Performance Checklist

Before deploying, verify:

- [ ] **Build succeeds**: `npm run build`
- [ ] **Bundle size <150KB**: Check dist/ output
- [ ] **Lighthouse score 90+**: Run `lighthouse http://localhost:4173/`
- [ ] **Content validated**: `npm run validate-content` (if schemas exist)
- [ ] **Accessibility**: Test keyboard navigation and screen reader
- [ ] **Mobile**: Test on real device

## Deployment Workflows

### Single Target Deployment

For one company:

```bash
# 1. Create content
cp -r src/data/targets/_template src/data/targets/company-name
# Edit JSON files in src/data/targets/company-name/

# 2. Build with target
VITE_TARGET_COMPANY=company-name npm run build

# 3. Deploy
vercel --prod --name pitch-company-name
```

### Multiple Target Deployments

For multiple companies, use separate deployments:

```bash
# Deploy for Acme Corp
VITE_TARGET_COMPANY=acme-corp npm run build
vercel --prod --name pitch-acme

# Deploy for TechStart
VITE_TARGET_COMPANY=techstart-inc npm run build
vercel --prod --name pitch-techstart
```

## Custom Domain Setup

### Vercel

```bash
vercel domains add pitch.yoursite.com
# Follow DNS instructions
```

### Netlify

```bash
netlify domains:add pitch.yoursite.com
# Follow DNS instructions
```

## Performance Optimization

### Cloudflare (Optional)

For additional performance:

1. Add site to Cloudflare
2. Enable Auto Minify (JS, CSS, HTML)
3. Enable Brotli compression
4. Set Browser Cache TTL to "Respect Existing Headers"
5. Enable "Always Use HTTPS"

### Image Optimization

Images should be:
- WebP format (25-35% smaller than JPEG)
- AVIF format (20-30% smaller than WebP) for modern browsers
- Properly sized (no larger than display size)
- Lazy loaded (use `loading="lazy"` attribute)

## Monitoring

### Analytics

The site includes built-in privacy-focused analytics:
- Session tracking (localStorage)
- Event tracking (no external services)
- Export data: Call `analyticsTracker.downloadEvents()` in console

### Performance Monitoring

Monitor Core Web Vitals:
- **LCP** (Largest Contentful Paint): <2.5s
- **FID** (First Input Delay): <100ms
- **CLS** (Cumulative Layout Shift): <0.1

Tools:
- Chrome DevTools Performance tab
- Lighthouse CI
- WebPageTest

## Troubleshooting

### Build Fails

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json dist
npm install
npm run build
```

### Content Not Loading

Check that `VITE_TARGET_COMPANY` matches folder name exactly (case-sensitive):

```bash
ls src/data/targets/
# Should show your target folder
```

### Slow Loading

1. Check bundle size: `npm run build`
2. Verify images are optimized (WebP/AVIF)
3. Test on 4G throttle in DevTools
4. Check Lighthouse report for recommendations

## Support

- **Repository**: https://github.com/your-username/portfolio-site
- **Issues**: https://github.com/your-username/portfolio-site/issues
- **Documentation**: README.md, CLAUDE.md (if exists)
