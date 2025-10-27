import { useEffect, useState } from 'react';
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

          <div className="products-grid">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="product-placeholder"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <span className="product-category">{product.category}</span>
                <h3>{product.name}</h3>
                <p>{product.valueProposition}</p>
                <div className="roi-preview">
                  {product.roiMetrics.slice(0, 2).map((metric, i) => (
                    <span key={i} className="roi-metric">
                      <strong>{metric.value}</strong> {metric.label}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="contact-section space-organic-lg">
            <h2>Ready to get started?</h2>
            <button className="cta-button">Get in Touch</button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ImmediateValue;
