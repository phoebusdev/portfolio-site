import BaseSection from './BaseSection.jsx';
import NoiseOverlay from '../effects/NoiseOverlay.jsx';
import ParticleSystem from '../effects/ParticleSystem.jsx';
import InsightCard from '../insights/InsightCard.jsx';
import { PARALLAX, NOISE, PARTICLES, GLOW_ORBS } from '../../constants/design.js';
import './Section.css';
import './StrategicVision.css';

function StrategicVision() {
  return (
    <>
      {/* Additional ambient effects for atmospheric depth */}
      <NoiseOverlay opacity={NOISE.DEFAULT_OPACITY} />
      <ParticleSystem count={PARTICLES.DEFAULT_COUNT} />

      <BaseSection
        sectionId="strategic-vision"
        loadingMessage="Loading insights..."
        contentLoader={async () => {
          const module = await import('@content/insights.json');
          return module.default.insights || [];
        }}
        renderContent={(sectionData, insights) => (
          <div className="insights-list">
            {insights?.map((insight, index) => (
              <div key={insight.id} data-parallax={PARALLAX.CONTENT.ITEMS_BASE + (index % 3) * PARALLAX.CONTENT.ITEMS_VARIANCE_STRATEGIC}>
                <InsightCard insight={insight} index={index} />
              </div>
            ))}
          </div>
        )}
        backgroundEffects={{
          parallaxIntensity: PARALLAX.INTENSITY.MEDIUM,
          glowOrbs: [
            { size: 600, color: GLOW_ORBS.MEDIUM.color, duration: 25 },
            { size: 400, color: GLOW_ORBS.SMALL.color, duration: 30 },
          ],
        }}
        contentAlign="content-right"
      />
    </>
  );
}

export default StrategicVision;
