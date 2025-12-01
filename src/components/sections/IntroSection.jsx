import BaseSection from './BaseSection.jsx';
import { PARALLAX, GLOW_ORBS } from '../../constants/design.js';
import './Section.css';

function IntroSection() {
  return (
    <BaseSection
      sectionId="intro-hero"
      loadingMessage="Loading..."
      renderContent={(sectionData) => (
        <>
          {/* Name header */}
          <div className="intro-name anim-fade-in-up" data-parallax={PARALLAX.CONTENT.NAME}>
            <h2>Your Name</h2>
          </div>

          {/* Elegant intro text with enhanced animation */}
          <div className="section-intro intro-hero-enhanced space-organic-md anim-fade-in-up" data-parallax={PARALLAX.CONTENT.INTRO}>
            <p>{sectionData.introductoryContent}</p>
          </div>
        </>
      )}
      backgroundEffects={{
        parallaxIntensity: PARALLAX.INTENSITY.DRAMATIC,
        glowOrbs: [
          { ...GLOW_ORBS.EXTRA_LARGE, style: { top: '10%', left: '15%' } },
          { ...GLOW_ORBS.BLUE, style: { top: '50%', right: '20%' } },
          { ...GLOW_ORBS.LARGE, style: { bottom: '20%', left: '40%' } },
        ],
      }}
      contentAlign="content-left"
      sectionStyle={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}
      showHeader={true}
      showIntro={false}
    />
  );
}

export default IntroSection;
