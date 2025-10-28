import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import ParallaxBackground from './ParallaxBackground.jsx';
import LayeredBackground from '../effects/LayeredBackground.jsx';
import GlowOrb from '../effects/GlowOrb.jsx';
import { LoadingState } from '../ui/LoadingState.jsx';
import { ErrorState } from '../ui/ErrorState.jsx';
import { useSectionData } from '../../hooks/useSectionData.js';
import { logError, logWarning } from '../../utils/errorLogger.js';
import { PARALLAX, GLOW_ORBS } from '../../constants/design.js';
import './Section.css';

/**
 * BaseSection - Unified section component
 * Eliminates 70% code duplication across section components
 *
 * @param {string} sectionId - Section identifier (e.g., 'proven-excellence')
 * @param {Function} contentLoader - Async function to load additional content
 * @param {Function} renderContent - Function to render main content (sectionData, additionalData) => JSX
 * @param {Object} backgroundEffects - Customizable background effects
 * @param {string} className - Additional CSS classes
 * @param {string} contentAlign - Content alignment ('content-left', 'content-center', 'content-right')
 * @param {string} loadingMessage - Custom loading message
 * @param {boolean} showHeader - Whether to show section header (default true)
 * @param {boolean} showIntro - Whether to show intro content (default true)
 * @param {string} sectionStyle - Inline style object for section
 */
function BaseSection({
  sectionId,
  contentLoader,
  renderContent,
  backgroundEffects = {},
  className = '',
  contentAlign = 'content-left',
  loadingMessage = 'Loading...',
  showHeader = true,
  showIntro = true,
  sectionStyle,
}) {
  const { sectionData, loading: sectionLoading, error: sectionError } = useSectionData(sectionId);
  const [additionalData, setAdditionalData] = useState(null);
  const [contentLoading, setContentLoading] = useState(!!contentLoader);
  const [contentError, setContentError] = useState(null);

  useEffect(() => {
    if (contentLoader) {
      contentLoader()
        .then((data) => {
          if (Array.isArray(data) && data.length === 0) {
            logWarning('CONTENT_EMPTY', { section: sectionId });
          }
          setAdditionalData(data);
          setContentLoading(false);
        })
        .catch((err) => {
          logError('CONTENT_LOAD_FAILED', {
            section: sectionId,
            error: err.message,
            stack: err.stack,
          });
          setContentError(`Unable to load ${sectionId} content`);
          setContentLoading(false);
        });
    }
  }, [contentLoader, sectionId]);

  const handleRetry = () => {
    window.location.reload();
  };

  // Show loading state
  if (sectionLoading || contentLoading) {
    return (
      <section
        className={`section scroll-snap-section section-${sectionId} ${className}`}
        data-section={sectionId}
        style={sectionStyle}
      >
        <ParallaxBackground intensity={backgroundEffects.parallaxIntensity || PARALLAX.INTENSITY.MEDIUM} />
        <LoadingState message={loadingMessage} />
      </section>
    );
  }

  // Show error state
  if (sectionError) {
    return (
      <section
        className={`section scroll-snap-section section-${sectionId} ${className}`}
        data-section={sectionId}
        style={sectionStyle}
      >
        <ParallaxBackground intensity={backgroundEffects.parallaxIntensity || PARALLAX.INTENSITY.MEDIUM} />
        <ErrorState
          error={sectionError.message}
          section={sectionId.replace(/-/g, ' ')}
          onRetry={handleRetry}
        />
      </section>
    );
  }

  return (
    <section
      className={`section scroll-snap-section section-${sectionId} ${className}`}
      data-section={sectionId}
      style={sectionStyle}
    >
      {/* Background Effects */}
      <ParallaxBackground
        intensity={backgroundEffects.parallaxIntensity || PARALLAX.INTENSITY.MEDIUM}
        enableContentParallax={backgroundEffects.enableContentParallax !== false}
      />
      {backgroundEffects.showLayeredBackground !== false && <LayeredBackground />}
      {backgroundEffects.glowOrbs?.map((orb, i) => (
        <GlowOrb
          key={i}
          size={orb.size || GLOW_ORBS.MEDIUM.size}
          color={orb.color || GLOW_ORBS.MEDIUM.color}
          duration={orb.duration || GLOW_ORBS.MEDIUM.duration}
          style={orb.style}
        />
      ))}

      <div className="parallax-scene">
        <div className={`section-padding ${contentAlign}`}>
          {/* Section Header */}
          {showHeader && (
            <div className="section-header anim-fade-in-up" data-parallax={PARALLAX.CONTENT.HEADER}>
              {sectionData.heading && (
                <h1 className="section-heading text-shadow-medium">{sectionData.heading}</h1>
              )}
              {sectionData.subheading && (
                <p className="section-subheading">{sectionData.subheading}</p>
              )}
            </div>
          )}

          {/* Introductory Content */}
          {showIntro && sectionData.introductoryContent && (
            <div className="section-intro space-organic-md" data-parallax={PARALLAX.CONTENT.INTRO}>
              <p>{sectionData.introductoryContent}</p>
            </div>
          )}

          {/* Main Content */}
          {contentError ? (
            <ErrorState
              error={contentError}
              section={`${sectionId} items`}
              onRetry={handleRetry}
            />
          ) : (
            renderContent(sectionData, additionalData)
          )}
        </div>
      </div>
    </section>
  );
}

BaseSection.propTypes = {
  sectionId: PropTypes.string.isRequired,
  contentLoader: PropTypes.func,
  renderContent: PropTypes.func.isRequired,
  backgroundEffects: PropTypes.shape({
    parallaxIntensity: PropTypes.number,
    enableContentParallax: PropTypes.bool,
    showLayeredBackground: PropTypes.bool,
    glowOrbs: PropTypes.arrayOf(
      PropTypes.shape({
        size: PropTypes.number,
        color: PropTypes.string,
        duration: PropTypes.number,
        style: PropTypes.object,
      })
    ),
  }),
  className: PropTypes.string,
  contentAlign: PropTypes.oneOf(['content-left', 'content-center', 'content-right']),
  loadingMessage: PropTypes.string,
  showHeader: PropTypes.bool,
  showIntro: PropTypes.bool,
  sectionStyle: PropTypes.object,
};

export default BaseSection;
