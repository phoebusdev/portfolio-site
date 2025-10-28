import { useEffect, useState } from 'react';
import ParallaxBackground from './ParallaxBackground.jsx';
import LayeredBackground from '../effects/LayeredBackground.jsx';
import GlowOrb from '../effects/GlowOrb.jsx';
import ProductCard from '../products/ProductCard.jsx';
import analyticsTracker from '../../utils/analytics.js';
import './Section.css';

function ImmediateValue() {
  const [sectionData, setSectionData] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Load section content
    import('@content/sections.json')
      .then((module) => {
        const section = module.default.sections.find(
          (s) => s.sectionType === 'immediate-value'
        );
        setSectionData(section);
      })
      .catch((err) => console.error('Failed to load section data:', err));

    // Load products
    import('@content/products.json')
      .then((module) => {
        setProducts(module.default.products || []);
      })
      .catch((err) => console.error('Failed to load products:', err));
  }, []);

  if (!sectionData) {
    return <div>Loading...</div>;
  }

  return (
    <section
      className="section scroll-snap-section section-immediate-value"
      data-section="immediate-value"
    >
      <ParallaxBackground intensity={0.4} />
      <LayeredBackground />
      <GlowOrb size={700} color="rgba(255,255,255,0.015)" duration={40} />

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

          <div className="products-grid">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>

          <div className="contact-section space-organic-lg">
            <h2>Ready to get started?</h2>
            <button
              className="cta-button"
              onClick={() => analyticsTracker.trackContactClick('section-end')}
            >
              Get in Touch
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ImmediateValue;
