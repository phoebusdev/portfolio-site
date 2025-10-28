import { useEffect, useState } from 'react';
import ParallaxBackground from './ParallaxBackground.jsx';
import LayeredBackground from '../effects/LayeredBackground.jsx';
import GlowOrb from '../effects/GlowOrb.jsx';
import './Section.css';

function StrategicVision() {
  const [sectionData, setSectionData] = useState(null);
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    // Load section content
    import('@content/sections.json')
      .then((module) => {
        const section = module.default.sections.find(
          (s) => s.sectionType === 'strategic-vision'
        );
        setSectionData(section);
      })
      .catch((err) => console.error('Failed to load section data:', err));

    // Load insights
    import('@content/insights.json')
      .then((module) => {
        setInsights(module.default.insights || []);
      })
      .catch((err) => console.error('Failed to load insights:', err));
  }, []);

  if (!sectionData) {
    return <div>Loading...</div>;
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
          <div className="section-header anim-fade-in-up" data-parallax="0.03">
            <h1 className="section-heading text-shadow-medium">{sectionData.heading}</h1>
            {sectionData.subheading && (
              <p className="section-subheading">{sectionData.subheading}</p>
            )}
          </div>

          <div className="section-intro space-organic-md" data-parallax="0.04">
            <p>{sectionData.introductoryContent}</p>
          </div>

          <div className="insights-list">
            {insights.map((insight, index) => (
              <div
                key={insight.id}
                className="insight-placeholder"
                style={{ animationDelay: `${index * 0.15}s` }}
                data-parallax={0.05 + (index % 3) * 0.015}
              >
                <h3>{insight.title}</h3>
                <p className="opportunity">{insight.opportunity}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default StrategicVision;
