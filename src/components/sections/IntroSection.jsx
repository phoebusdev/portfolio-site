import ParallaxBackground from './ParallaxBackground.jsx';
import LayeredBackground from '../effects/LayeredBackground.jsx';
import GlowOrb from '../effects/GlowOrb.jsx';
import { useSectionData } from '../../hooks/useSectionData.js';
import { LoadingState } from '../ui/LoadingState.jsx';
import { ErrorState } from '../ui/ErrorState.jsx';
import './Section.css';

function IntroSection() {
  const { sectionData, loading, error } = useSectionData('intro-hero');

  // Retry function
  const handleRetry = () => {
    window.location.reload();
  };

  // Show loading state
  if (loading) {
    return (
      <section
        className="section scroll-snap-section section-intro-hero"
        data-section="intro-hero"
        style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}
      >
        <ParallaxBackground intensity={0.8} />
        <LoadingState message="Loading..." />
      </section>
    );
  }

  // Show error state
  if (error) {
    return (
      <section
        className="section scroll-snap-section section-intro-hero"
        data-section="intro-hero"
        style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}
      >
        <ParallaxBackground intensity={0.8} />
        <ErrorState
          error={error.message}
          section="Intro"
          onRetry={handleRetry}
        />
      </section>
    );
  }

  return (
    <section
      className="section scroll-snap-section section-intro-hero"
      data-section="intro-hero"
      style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}
    >
      {/* Enhanced parallax with higher intensity for dramatic effect */}
      <ParallaxBackground intensity={0.8} />
      <LayeredBackground />

      {/* Multiple large glow orbs for atmospheric depth */}
      <GlowOrb
        size={800}
        color="rgba(168, 85, 247, 0.04)"
        duration={35}
        style={{ top: '10%', left: '15%' }}
      />
      <GlowOrb
        size={600}
        color="rgba(59, 130, 246, 0.03)"
        duration={40}
        style={{ top: '50%', right: '20%' }}
      />
      <GlowOrb
        size={700}
        color="rgba(255, 255, 255, 0.02)"
        duration={38}
        style={{ bottom: '20%', left: '40%' }}
      />

      <div className="parallax-scene">
        <div className="section-padding content-left">
          {/* Name header */}
          <div className="intro-name anim-fade-in-up" data-parallax="0.06">
            <h2>Henri Fontaine</h2>
          </div>

          {/* Section header (empty for intro-hero but maintains pattern) */}
          <div className="section-header anim-fade-in-up" data-parallax="0.08">
            {sectionData.heading && (
              <h1 className="section-heading text-shadow-medium">{sectionData.heading}</h1>
            )}
            {sectionData.subheading && (
              <p className="section-subheading">{sectionData.subheading}</p>
            )}
          </div>

          {/* Elegant intro text with enhanced animation */}
          <div className="section-intro intro-hero-enhanced space-organic-md anim-fade-in-up" data-parallax="0.1">
            <p>{sectionData.introductoryContent}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default IntroSection;
