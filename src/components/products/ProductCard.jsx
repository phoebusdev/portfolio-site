import { useState } from 'react';
import { animate } from 'motion';
import ProductDetail from './ProductDetail.jsx';
import analyticsTracker from '../../utils/analytics.js';
import './ProductCard.css';

function ProductCard({ product, index }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = () => {
    setIsExpanded(true);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  const handleClose = () => {
    setIsExpanded(false);
  };

  return (
    <>
      <article
        className="product-card hover-lift"
        onClick={handleClick}
        onKeyPress={handleKeyPress}
        role="button"
        tabIndex={0}
        aria-label={`View details for ${product.name}`}
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        <span className="product-category">{product.category}</span>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-value-prop">{product.valueProposition}</p>

        <div className="product-timeline">
          <span className="timeline-icon">⏱</span>
          <span>{product.timeline}</span>
        </div>

        <div className="product-roi">
          {product.roiMetrics.slice(0, 2).map((metric, i) => (
            <div key={i} className="roi-item">
              <span className="roi-value">{metric.value}</span>
              <span className="roi-label">{metric.label}</span>
            </div>
          ))}
        </div>

        <span className="product-cta">View Demo →</span>
      </article>

      {isExpanded && (
        <ProductDetail product={product} onClose={handleClose} />
      )}
    </>
  );
}

export default ProductCard;
