import { useEffect, useState } from 'react';
import ParallaxBackground from './ParallaxBackground.jsx';
import LayeredBackground from '../effects/LayeredBackground.jsx';
import GlowOrb from '../effects/GlowOrb.jsx';
import './Section.css';

function IntroSection() {
  const [sectionData, setSectionData] = useState(null);

  useEffect(() => {
    // Load section content
    import('@content/sections.json')
      .then((module) => {
        const section = module.default.sections.find(
          (s) => s.sectionType === 'intro-hero'
        );
        setSectionData(section);
      })
      .catch((err) => console.error('Failed to load section data:', err));
  }, []);

  if (!sectionData) {
    return <div>Loading...</div>;
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
          {/* Elegant intro text with enhanced animation */}
          <div
            className="section-intro intro-hero-text space-organic-md"
            data-parallax="0.05"
            style={{
              maxWidth: '75ch',
              fontSize: 'clamp(1.25rem, 2vw, 1.5rem)',
              lineHeight: '1.8',
              animation: 'fadeInUp 1.2s cubic-bezier(0.42, 0, 0.58, 1) both',
              animationDelay: '0.2s'
            }}
          >
            <p>{sectionData.introductoryContent}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default IntroSection;
