import { useEffect, useState } from 'react';
import ParallaxBackground from './ParallaxBackground.jsx';
import LayeredBackground from '../effects/LayeredBackground.jsx';
import GlowOrb from '../effects/GlowOrb.jsx';
import InsightCard from '../insights/InsightCard.jsx';
import { useSectionData } from '../../hooks/useSectionData.js';
import './Section.css';

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
      <ParallaxBackground intensity={0.5} />
      <LayeredBackground />
      <GlowOrb size={400} color="rgba(255,255,255,0.025)" duration={25} />
      <GlowOrb size={500} color="rgba(0,0,0,0.02)" duration={35} />

      <div className="parallax-scene">
        <div className="section-padding content-right">
          <div className="section-header anim-fade-in-up" data-parallax="0.08">
            <h1 className="section-heading text-shadow-medium">{sectionData.heading}</h1>
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
