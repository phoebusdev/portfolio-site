import { useMemo, memo, useState } from 'react';
import ExpandableItem from '../shared/ExpandableItem.jsx';
import { parseProductContent, extractProductKeyPoints } from '../../utils/markdownParser.js';
import './ProductCard.css';

/**
 * PreviewImage - Inline component for displaying product preview images
 * Handles lazy loading, error states, and click-to-open behavior
 */
function PreviewImage({ previewUrl, liveUrl, productName }) {
  const [imageError, setImageError] = useState(false);

  // Don't render if no URL or if image failed to load
  if (!previewUrl || imageError) {
    return null;
  }

  const handleClick = (e) => {
    e.stopPropagation(); // Prevent card expansion on image click
    if (liveUrl) {
      window.open(liveUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e);
    }
  };

  return (
    <div
      className="product-preview-image-link"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={liveUrl ? 'link' : 'img'}
      tabIndex={liveUrl ? 0 : -1}
      aria-label={liveUrl ? `Open ${productName} live demo in new tab` : `${productName} preview`}
    >
      <div className="product-preview-image-wrapper">
        <img
          src={previewUrl}
          alt={`${productName} - Live demo preview`}
          loading="lazy"
          className="product-preview-image"
          onError={() => setImageError(true)}
        />
      </div>
    </div>
  );
}

function ProductCard({ product, index }) {
  // Parse product content once and memoize
  const parsedSections = useMemo(
    () => parseProductContent(product),
    [product]
  );

  const keyPoints = useMemo(
    () => extractProductKeyPoints(product.description || ''),
    [product.description]
  );

  // Create preview with category, timeline, and ROI preview
  const preview = useMemo(() => {
    const roiPreview = (product.roiMetrics || [])
      .slice(0, 2)
      .map(m => `${m.value} ${m.label}`)
      .join(' • ');

    return `${product.valueProposition}\n\n⏱ ${product.timeline}${roiPreview ? `\n\n${roiPreview}` : ''}`;
  }, [product]);

  // Create preview image component
  const previewImage = useMemo(() => {
    if (!product.previewUrl) return null;

    return (
      <PreviewImage
        previewUrl={product.previewUrl}
        liveUrl={product.liveUrl}
        productName={product.name}
      />
    );
  }, [product.previewUrl, product.liveUrl, product.name]);

  return (
    <ExpandableItem
      id={product.id}
      title={product.name}
      preview={preview}
      previewImage={previewImage}
      keyPoints={keyPoints}
      expandedSections={parsedSections}
      tags={[product.category, product.demoType]}
      className="product-card"
      index={index}
    />
  );
}

export default memo(ProductCard);
