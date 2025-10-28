import { useEffect, useState } from 'react';
import NoiseOverlay from '../effects/NoiseOverlay.jsx';
import GlowOrb from '../effects/GlowOrb.jsx';
import ParticleSystem from '../effects/ParticleSystem.jsx';
import LayeredBackground from '../effects/LayeredBackground.jsx';
import InsightCard from '../insights/InsightCard.jsx';
import { useSectionData } from '../../hooks/useSectionData.js';
import { LoadingState } from '../ui/LoadingState.jsx';
import { ErrorState } from '../ui/ErrorState.jsx';
import { logError, logWarning } from '../../utils/errorLogger.js';
import './Section.css';
import './StrategicVision.css';

function StrategicVision() {
  const { sectionData, loading: sectionLoading, error: sectionError } = useSectionData('strategic-vision');
  const [insights, setInsights] = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [insightsError, setInsightsError] = useState(null);

  useEffect(() => {
    // Load insights
    import('@content/insights.json')
      .then((module) => {
        const items = module.default.insights || [];
        if (items.length === 0) {
          logWarning('INSIGHTS_EMPTY', { section: 'strategic-vision' });
        }
        setInsights(items);
        setInsightsLoading(false);
      })
      .catch((err) => {
        logError('INSIGHTS_LOAD_FAILED', {
          section: 'strategic-vision',
          error: err.message,
          stack: err.stack
        });
        setInsightsError('Unable to load strategic insights');
        setInsightsLoading(false);
      });
  }, []);

  // Retry function
  const handleRetry = () => {
    window.location.reload();
  };

  // Show loading state
  if (sectionLoading || insightsLoading) {
    return (
      <section className="section scroll-snap-section section-strategic-vision" data-section="strategic-vision">
        <LayeredBackground />
        <LoadingState message="Loading insights..." />
      </section>
    );
  }

  // Show error state
  if (sectionError) {
    return (
      <section className="section scroll-snap-section section-strategic-vision" data-section="strategic-vision">
        <LayeredBackground />
        <ErrorState
          error={sectionError.message}
          section="Strategic Vision"
          onRetry={handleRetry}
        />
      </section>
    );
  }

  return (
    <section
      className="section scroll-snap-section section-strategic-vision"
      data-section="strategic-vision"
    >
      {/* Enhanced depth layers from DepthShowcase */}
      <LayeredBackground />

      {/* Ambient effects for atmospheric depth */}
      <NoiseOverlay opacity={0.03} />
      <GlowOrb size={600} color="rgba(255,255,255,0.02)" duration={25} />
      <GlowOrb size={400} color="rgba(0,0,0,0.03)" duration={30} />
      <ParticleSystem count={15} />

      <div className="parallax-scene">
        <div className="section-padding content-right">
          <div className="section-header anim-fade-in-up" data-parallax="0.08">
            <h1 className="section-heading depth-heading">{sectionData.heading}</h1>
            {sectionData.subheading && (
              <p className="section-subheading">{sectionData.subheading}</p>
            )}
          </div>

          <div className="section-intro space-organic-md" data-parallax="0.1">
            <p>{sectionData.introductoryContent}</p>
          </div>

          {/* Show insights error if load failed */}
          {insightsError ? (
            <ErrorState
              error={insightsError}
              section="insights"
              onRetry={handleRetry}
            />
          ) : (
            <div className="insights-list">
              {insights.map((insight, index) => (
                <div key={insight.id} data-parallax={0.12 + (index % 3) * 0.03}>
                  <InsightCard insight={insight} index={index} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default StrategicVision;
