import NoiseOverlay from '../effects/NoiseOverlay.jsx';
import GlowOrb from '../effects/GlowOrb.jsx';
import ParticleSystem from '../effects/ParticleSystem.jsx';
import GlassCard from '../effects/GlassCard.jsx';
import LayeredBackground from '../effects/LayeredBackground.jsx';
import './DepthShowcase.css';

function DepthShowcase() {
  return (
    <section
      className="section scroll-snap-section section-depth-showcase"
      data-section="depth-showcase"
    >
      {/* Background depth layers */}
      <LayeredBackground />

      {/* Ambient effects */}
      <NoiseOverlay opacity={0.03} />
      <GlowOrb size={600} color="rgba(255,255,255,0.02)" duration={25} />
      <GlowOrb size={400} color="rgba(0,0,0,0.03)" duration={30} />
      <ParticleSystem count={15} />

      <div className="parallax-scene">
        <div className="section-padding content-right">
          <div className="section-header anim-fade-in-up">
            <h1 className="section-heading depth-heading">
              Enhanced Depth System
            </h1>
            <p className="section-subheading">
              Monochrome aesthetic with texture, shadow, and atmospheric depth
            </p>
          </div>

          <div className="depth-demo-grid">
            <GlassCard intensity="base" className="demo-card">
              <h3>Glass Morphism</h3>
              <p>Frosted glass effect with backdrop blur creates subtle depth and layering</p>
            </GlassCard>

            <div className="demo-card shadow-depth-3">
              <h3>Multi-Layer Shadows</h3>
              <p>Depth perception through carefully crafted layered shadow systems</p>
            </div>

            <div className="demo-card depth-typography">
              <h2 className="depth-text-shadow">Enhanced Typography</h2>
              <p>Subtle depth applied to text elements for visual hierarchy</p>
            </div>

            <GlassCard intensity="medium" className="demo-card">
              <h3>Atmospheric Glow</h3>
              <p>Subtle animated orbs create spatial depth and ambient atmosphere</p>
            </GlassCard>

            <div className="demo-card texture-grain">
              <h3>Texture Overlay</h3>
              <p>Grain and noise overlays add tactile feel and visual richness</p>
            </div>

            <div className="demo-card particle-demo">
              <h3>Particle System</h3>
              <p>Floating particles provide subtle motion and dimensional depth</p>
            </div>
          </div>

          <div className="mobile-notice">
            <p>
              <strong>Performance Note:</strong> Advanced depth effects are optimized for desktop viewing.
              Mobile devices display a simplified version for optimal performance.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DepthShowcase;
