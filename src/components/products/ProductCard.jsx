import { useMemo, memo } from 'react';
import ExpandableItem from '../shared/ExpandableItem.jsx';
import { parseProductContent, extractProductKeyPoints } from '../../utils/markdownParser.js';
import './ProductCard.css';

/**
 * DemoLink - Component for displaying demo link button
 */
function DemoLink({ url, productName }) {
  const handleClick = (e) => {
    e.stopPropagation(); // Prevent card expansion on link click
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      handleClick(e);
    }
  };

  return (
    <div
      className="product-demo-link"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="link"
      tabIndex={0}
      aria-label={`Visit ${productName} demo in new tab`}
    >
      <span className="demo-link-icon">🔗</span>
      <span className="demo-link-text">View Demo</span>
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

  // Create demo link component
  const demoLink = useMemo(() => {
    if (!product.liveUrl) return null;
    return <DemoLink url={product.liveUrl} productName={product.name} />;
  }, [product.liveUrl, product.name]);

  return (
    <ExpandableItem
      id={product.id}
      title={product.name}
      preview={preview}
      previewImage={demoLink}
      keyPoints={keyPoints}
      expandedSections={parsedSections}
      tags={[product.category, product.demoType]}
      className="product-card"
      index={index}
    />
  );
}

export default memo(ProductCard);
