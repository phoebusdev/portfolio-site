import { useEffect, useState } from 'react';
import NoiseOverlay from '../effects/NoiseOverlay.jsx';
import GlowOrb from '../effects/GlowOrb.jsx';
import ParticleSystem from '../effects/ParticleSystem.jsx';
import LayeredBackground from '../effects/LayeredBackground.jsx';
import InsightCard from '../insights/InsightCard.jsx';
import { useSectionData } from '../../hooks/useSectionData.js';
import './Section.css';
import './StrategicVision.css';

function StrategicVision() {
  const { sectionData, loading, error } = useSectionData('strategic-vision');
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    // Load insights
    import('@content/insights.json')
      .then((module) => {
        setInsights(module.default.insights || []);
      })
      .catch((err) => console.error('Failed to load insights:', err));
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Failed to load section: {error}</div>;
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

          <div className="insights-list">
            {insights.map((insight, index) => (
              <div key={insight.id} data-parallax={0.12 + (index % 3) * 0.03}>
                <InsightCard insight={insight} index={index} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default StrategicVision;
