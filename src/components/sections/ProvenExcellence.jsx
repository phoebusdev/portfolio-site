import { useEffect, useState } from 'react';
import ParallaxBackground from './ParallaxBackground.jsx';
import LayeredBackground from '../effects/LayeredBackground.jsx';
import GlowOrb from '../effects/GlowOrb.jsx';
import WorkCard from '../work-items/WorkCard.jsx';
import { useSectionData } from '../../hooks/useSectionData.js';
import { LoadingState } from '../ui/LoadingState.jsx';
import { ErrorState } from '../ui/ErrorState.jsx';
import { logError, logWarning } from '../../utils/errorLogger.js';
import './Section.css';

function ProvenExcellence() {
  const { sectionData, loading: sectionLoading, error: sectionError } = useSectionData('proven-excellence');
  const [workItems, setWorkItems] = useState([]);
  const [workItemsLoading, setWorkItemsLoading] = useState(true);
  const [workItemsError, setWorkItemsError] = useState(null);

  useEffect(() => {
    // Load work items
    import('@content/work.json')
      .then((module) => {
        const items = module.default.workItems || [];
        if (items.length === 0) {
          logWarning('WORK_ITEMS_EMPTY', { section: 'proven-excellence' });
        }
        setWorkItems(items);
        setWorkItemsLoading(false);
      })
      .catch((err) => {
        logError('WORK_ITEMS_LOAD_FAILED', {
          section: 'proven-excellence',
          error: err.message,
          stack: err.stack
        });
        setWorkItemsError('Unable to load portfolio items');
        setWorkItemsLoading(false);
      });
  }, []);

  // Retry function
  const handleRetry = () => {
    window.location.reload();
  };

  // Show loading state
  if (sectionLoading || workItemsLoading) {
    return (
      <section className="section scroll-snap-section section-proven-excellence" data-section="proven-excellence">
        <ParallaxBackground intensity={0.6} />
        <LoadingState message="Loading portfolio..." />
      </section>
    );
  }

  // Show error state
  if (sectionError) {
    return (
      <section className="section scroll-snap-section section-proven-excellence" data-section="proven-excellence">
        <ParallaxBackground intensity={0.6} />
        <ErrorState
          error={sectionError.message}
          section="Proven Excellence"
          onRetry={handleRetry}
        />
      </section>
    );
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
          <div className="section-header anim-fade-in-up" data-parallax="0.08">
            <h1 className="section-heading text-shadow-medium">{sectionData.heading}</h1>
            {sectionData.subheading && (
              <p className="section-subheading">{sectionData.subheading}</p>
            )}
          </div>

          <div className="section-intro space-organic-md" data-parallax="0.1">
            <p>{sectionData.introductoryContent}</p>
          </div>

          {/* Show work items error if load failed */}
          {workItemsError ? (
            <ErrorState
              error={workItemsError}
              section="work items"
              onRetry={handleRetry}
            />
          ) : (
            <div className="work-items-grid">
              {workItems.map((item, index) => (
                <div key={item.id} data-parallax={0.12 + (index % 3) * 0.02}>
                  <WorkCard workItem={item} index={index} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default ProvenExcellence;
