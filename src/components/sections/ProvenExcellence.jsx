import { useEffect, useState } from 'react';
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
      <div className="parallax-scene">
        <div className="section-padding content-left">
          <div className="section-header anim-fade-in-up">
            <h1 className="section-heading">{sectionData.heading}</h1>
            {sectionData.subheading && (
              <p className="section-subheading">{sectionData.subheading}</p>
            )}
          </div>

          <div className="section-intro space-organic-md">
            <p>{sectionData.introductoryContent}</p>
          </div>

          <div className="work-items-grid">
            {workItems.map((item, index) => (
              <div
                key={item.id}
                className="work-item-placeholder"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <h3>{item.title}</h3>
                <p>{item.shortDescription}</p>
                <div className="metrics">
                  {item.impactMetrics.slice(0, 2).map((metric, i) => (
                    <span key={i} className="metric">
                      <strong>{metric.value}</strong> {metric.label}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProvenExcellence;
