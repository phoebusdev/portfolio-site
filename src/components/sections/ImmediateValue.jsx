import { useEffect, useState } from 'react';
import ParallaxBackground from './ParallaxBackground.jsx';
import LayeredBackground from '../effects/LayeredBackground.jsx';
import GlowOrb from '../effects/GlowOrb.jsx';
import ProductCard from '../products/ProductCard.jsx';
import analyticsTracker from '../../utils/analytics.js';
import { useSectionData } from '../../hooks/useSectionData.js';
import { LoadingState } from '../ui/LoadingState.jsx';
import { ErrorState } from '../ui/ErrorState.jsx';
import { logError, logWarning } from '../../utils/errorLogger.js';
import './Section.css';

function ImmediateValue() {
  const { sectionData, loading: sectionLoading, error: sectionError } = useSectionData('immediate-value');
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(null);

  useEffect(() => {
    // Load products
    import('@content/products.json')
      .then((module) => {
        const items = module.default.products || [];
        if (items.length === 0) {
          logWarning('PRODUCTS_EMPTY', { section: 'immediate-value' });
        }
        setProducts(items);
        setProductsLoading(false);
      })
      .catch((err) => {
        logError('PRODUCTS_LOAD_FAILED', {
          section: 'immediate-value',
          error: err.message,
          stack: err.stack
        });
        setProductsError('Unable to load product offerings');
        setProductsLoading(false);
      });
  }, []);

  // Retry function
  const handleRetry = () => {
    window.location.reload();
  };

  // Show loading state
  if (sectionLoading || productsLoading) {
    return (
      <section className="section scroll-snap-section section-immediate-value" data-section="immediate-value">
        <ParallaxBackground intensity={0.4} />
        <LoadingState message="Loading products..." />
      </section>
    );
  }

  // Show error state
  if (sectionError) {
    return (
      <section className="section scroll-snap-section section-immediate-value" data-section="immediate-value">
        <ParallaxBackground intensity={0.4} />
        <ErrorState
          error={sectionError.message}
          section="Immediate Value"
          onRetry={handleRetry}
        />
      </section>
    );
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
          <div className="section-header anim-fade-in-up" data-parallax="0.08">
            <h1 className="section-heading text-shadow-medium">{sectionData.heading}</h1>
            {sectionData.subheading && (
              <p className="section-subheading">{sectionData.subheading}</p>
            )}
          </div>

          <div className="section-intro space-organic-md" data-parallax="0.1">
            <p>{sectionData.introductoryContent}</p>
          </div>

          {/* Show products error if load failed */}
          {productsError ? (
            <ErrorState
              error={productsError}
              section="products"
              onRetry={handleRetry}
            />
          ) : (
            <>
              <div className="products-grid">
                {products.map((product, index) => (
                  <div key={product.id} data-parallax={0.12 + (index % 3) * 0.02}>
                    <ProductCard product={product} index={index} />
                  </div>
                ))}
              </div>

              <div className="contact-section space-organic-lg" data-parallax="0.06">
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
        </div>
      </div>
    </section>
  );
}

export default ImmediateValue;
