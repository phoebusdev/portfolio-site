import BaseSection from './BaseSection.jsx';
import ProductCard from '../products/ProductCard.jsx';
import analyticsTracker from '../../utils/analytics.js';
import { PARALLAX, GLOW_ORBS } from '../../constants/design.js';
import './Section.css';

function ImmediateValue() {
  return (
    <BaseSection
      sectionId="immediate-value"
      loadingMessage="Loading products..."
      contentLoader={async () => {
        const module = await import('@content/products.json');
        return module.default.products || [];
      }}
      renderContent={(sectionData, products) => (
        <>
          <div className="products-grid">
            {products?.map((product, index) => (
              <div key={product.id} data-parallax={PARALLAX.CONTENT.ITEMS_BASE + (index % 3) * PARALLAX.CONTENT.ITEMS_VARIANCE}>
                <ProductCard product={product} index={index} />
              </div>
            ))}
          </div>

          <div className="contact-section space-organic-lg" data-parallax={PARALLAX.CONTENT.CONTACT}>
            <h2>Ready to get started?</h2>
            <button
              className="cta-button"
              onClick={() => analyticsTracker.trackContactClick('section-end')}
            >
              Get in Touch
            </button>
          </div>
        </>
      )}
      backgroundEffects={{
        parallaxIntensity: PARALLAX.INTENSITY.LOW,
        glowOrbs: [GLOW_ORBS.MUTED],
      }}
      contentAlign="content-left"
    />
  );
}

export default ImmediateValue;
