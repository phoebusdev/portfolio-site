import BaseSection from './BaseSection.jsx';
import WorkCard from '../work-items/WorkCard.jsx';
import { PARALLAX } from '../../constants/design.js';
import './Section.css';

function ProvenExcellence() {
  return (
    <BaseSection
      sectionId="proven-excellence"
      loadingMessage="Loading portfolio..."
      contentLoader={async () => {
        const module = await import('@content/work.json');
        return module.default.workItems || [];
      }}
      renderContent={(sectionData, workItems) => (
        <div className="work-items-grid">
          {workItems?.map((item, index) => (
            <div key={item.id} data-parallax={PARALLAX.CONTENT.ITEMS_BASE + (index % 3) * PARALLAX.CONTENT.ITEMS_VARIANCE}>
              <WorkCard workItem={item} index={index} />
            </div>
          ))}
        </div>
      )}
      backgroundEffects={{
        parallaxIntensity: PARALLAX.INTENSITY.HIGH,
        glowOrbs: [{ size: 600, color: 'rgba(255,255,255,0.02)', duration: 30 }],
      }}
      contentAlign="content-left"
    />
  );
}

export default ProvenExcellence;
