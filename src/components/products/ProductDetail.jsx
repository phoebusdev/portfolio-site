import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { animate } from 'motion';
import ROIMetrics from './ROIMetrics.jsx';
import analyticsTracker from '../../utils/analytics.js';
import './ProductDetail.css';

function ProductDetail({ product, onClose }) {
  const modalRef = useRef(null);
  const overlayRef = useRef(null);
  const previousFocus = useRef(null);

  useEffect(() => {
    previousFocus.current = document.activeElement;

    if (modalRef.current && overlayRef.current) {
      animate(
        overlayRef.current,
        { opacity: [0, 1] },
        { duration: 0.3, easing: [0.42, 0, 0.58, 1] }
      );

      animate(
        modalRef.current,
        {
          transform: ['translateY(100px)', 'translateY(0)'],
          opacity: [0, 1],
        },
        { duration: 0.5, easing: [0.42, 0, 0.58, 1] }
      );
    }

    modalRef.current?.focus();
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
      previousFocus.current?.focus();
    };
  }, []);

  const handleClose = async () => {
    if (modalRef.current && overlayRef.current) {
      await Promise.all([
        animate(
          overlayRef.current,
          { opacity: [1, 0] },
          { duration: 0.3, easing: [0.42, 0, 0.58, 1] }
        ).finished,
        animate(
          modalRef.current,
          {
            transform: ['translateY(0)', 'translateY(100px)'],
            opacity: [1, 0],
          },
          { duration: 0.4, easing: [0.42, 0, 0.58, 1] }
        ).finished,
      ]);
    }

    onClose();
  };

  const handleDemoClick = () => {
    analyticsTracker.trackProductDemoLaunched(product.id, product.demoType);

    if (product.demoUrl) {
      window.open(product.demoUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      handleClose();
    }
  };

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  };

  return (
    <div
      ref={overlayRef}
      className="product-overlay"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-title"
    >
      <div ref={modalRef} className="product-modal" tabIndex={-1}>
        <button
          className="close-button"
          onClick={handleClose}
          aria-label="Close modal"
        >
          ✕
        </button>

        <div className="modal-content">
          <header className="modal-header">
            <span className="product-category-large">{product.category}</span>
            <h2 id="product-title">{product.name}</h2>
            <p className="product-value-prop-large">{product.valueProposition}</p>

            <div className="product-timeline-large">
              <strong>Timeline:</strong> {product.timeline}
            </div>
          </header>

          {product.demoUrl && (
            <div className="demo-section">
              <button
                className="demo-button"
                onClick={handleDemoClick}
                aria-label={`Launch ${product.demoType} demo`}
              >
                {product.demoType === 'live' && '🚀 Launch Live Demo'}
                {product.demoType === 'video' && '▶️ Watch Video Demo'}
                {product.demoType === 'interactive' && '🎮 Try Interactive Demo'}
              </button>
            </div>
          )}

          <ROIMetrics metrics={product.roiMetrics} />

          <div className="product-description">
            <ReactMarkdown>{product.description}</ReactMarkdown>
          </div>

          <div className="integration-requirements">
            <h3>Integration Requirements</h3>
            <ReactMarkdown>{product.integrationRequirements}</ReactMarkdown>
          </div>

          <div className="product-cta-section">
            <h3>Ready to get started?</h3>
            <button
              className="contact-button"
              onClick={() => analyticsTracker.trackContactClick('product')}
            >
              Request Implementation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
