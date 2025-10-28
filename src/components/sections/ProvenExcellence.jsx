import { useEffect, useState } from 'react';
import ParallaxBackground from './ParallaxBackground.jsx';
import LayeredBackground from '../effects/LayeredBackground.jsx';
import GlowOrb from '../effects/GlowOrb.jsx';
import WorkCard from '../work-items/WorkCard.jsx';
import './Section.css';

function ProvenExcellence() {
  const [sectionData, setSectionData] = useState(null);
  const [workItems, setWorkItems] = useState([]);

  useEffect(() => {
    // Load section content
    import('@content/sections.json')
      .then((module) => {
        const section = module.default.sections.find(
          (s) => s.sectionType === 'proven-excellence'
        );
        setSectionData(section);
      })
      .catch((err) => console.error('Failed to load section data:', err));

    // Load work items
    import('@content/work.json')
      .then((module) => {
        setWorkItems(module.default.workItems || []);
      })
      .catch((err) => console.error('Failed to load work items:', err));
  }, []);

  if (!sectionData) {
    return <div>Loading...</div>;
  }

  return (
    <section
      className="section scroll-snap-section section-proven-excellence"
      data-section="proven-excellence"
    >
      <ParallaxBackground intensity={0.6} />
      <LayeredBackground />
      <GlowOrb size={600} color="rgba(255,255,255,0.02)" duration={30} />

      <div className="parallax-scene">
        <div className="section-padding content-left">
          <div className="section-header anim-fade-in-up">
            <h1 className="section-heading text-shadow-medium">{sectionData.heading}</h1>
            {sectionData.subheading && (
              <p className="section-subheading">{sectionData.subheading}</p>
            )}
          </div>

          <div className="section-intro space-organic-md">
            <p>{sectionData.introductoryContent}</p>
          </div>

          <div className="work-items-grid">
            {workItems.map((item, index) => (
              <WorkCard key={item.id} workItem={item} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProvenExcellence;
