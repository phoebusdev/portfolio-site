// Device capability detection for performance optimization

/* eslint-disable no-console */

class DeviceCapabilityDetector {
  constructor() {
    this.tier = null;
    this.capabilities = {};
  }

  detect() {
    this.capabilities = {
      isDesktop: window.matchMedia('(pointer: fine)').matches,
      isMobile: window.matchMedia('(pointer: coarse)').matches,
      isLowEnd: this.detectLowEnd(),
      supportsWebP: this.checkWebPSupport(),
      supportsAVIF: this.checkAVIFSupport(),
      prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      connectionSpeed: this.detectConnectionSpeed(),
      deviceMemory: navigator.deviceMemory || 4, // GB, default to 4
      hardwareConcurrency: navigator.hardwareConcurrency || 2,
    };

    this.tier = this.calculateTier();

    console.log('[DeviceCapability] Detected:', this.tier, this.capabilities);

    return {
      tier: this.tier,
      ...this.capabilities,
    };
  }

  detectLowEnd() {
    // Detect low-end devices based on hardware
    const memory = navigator.deviceMemory || 4;
    const cores = navigator.hardwareConcurrency || 2;

    // Low-end: <2GB RAM or <2 CPU cores
    return memory < 2 || cores < 2;
  }

  detectConnectionSpeed() {
    if (!navigator.connection) return 'unknown';

    const connection = navigator.connection;
    const effectiveType = connection.effectiveType;

    // Map to simple categories
    if (effectiveType === 'slow-2g' || effectiveType === '2g') return 'slow';
    if (effectiveType === '3g') return 'medium';
    if (effectiveType === '4g') return 'fast';

    return 'unknown';
  }

  checkWebPSupport() {
    // Simple WebP detection
    const canvas = document.createElement('canvas');
    if (canvas.getContext && canvas.getContext('2d')) {
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }
    return false;
  }

  checkAVIFSupport() {
    // AVIF support (may not be accurate in all cases)
    // For production, use feature detection library
    return false; // Conservative default
  }

  calculateTier() {
    const { isDesktop, isLowEnd, connectionSpeed, deviceMemory } = this.capabilities;

    // Desktop with good specs
    if (isDesktop && !isLowEnd && deviceMemory >= 4) {
      return 'high';
    }

    // Mobile or low-end desktop
    if (isLowEnd || deviceMemory < 4 || connectionSpeed === 'slow') {
      return 'low';
    }

    // Default: medium tier
    return 'medium';
  }

  getTier() {
    return this.tier || this.detect().tier;
  }

  getCapabilities() {
    if (!this.tier) {
      this.detect();
    }
    return this.capabilities;
  }

  shouldUseParallax() {
    const tier = this.getTier();
    const { prefersReducedMotion } = this.capabilities;

    // Only use parallax on high-tier devices without reduced motion preference
    return tier === 'high' && !prefersReducedMotion;
  }

  shouldLoadGSAP() {
    const tier = this.getTier();
    const { isDesktop } = this.capabilities;

    // Only load GSAP on desktop high-tier devices
    return tier === 'high' && isDesktop;
  }

  getParallaxLayerCount() {
    const tier = this.getTier();

    switch (tier) {
      case 'high':
        return 7; // Desktop: 7 layers
      case 'medium':
        return 3; // Mobile/medium: 3-4 layers
      case 'low':
        return 0; // Low-end: no parallax
      default:
        return 3;
    }
  }

  shouldUseDepthEffects() {
    const tier = this.getTier();
    const { isDesktop, prefersReducedMotion } = this.capabilities;

    // Only use depth effects on desktop without reduced motion preference
    return tier !== 'low' && isDesktop && !prefersReducedMotion;
  }

  getDepthEffectLevel() {
    const tier = this.getTier();

    switch (tier) {
      case 'high':
        return 'full'; // All effects enabled
      case 'medium':
        return 'reduced'; // Some effects enabled
      case 'low':
        return 'none'; // No depth effects
      default:
        return 'reduced';
    }
  }
}

// Singleton instance
const deviceCapabilityDetector = new DeviceCapabilityDetector();

export default deviceCapabilityDetector;
