import { useMemo, memo } from 'react';
import ExpandableItem from '../shared/ExpandableItem.jsx';
import { parseProductContent, extractProductKeyPoints } from '../../utils/markdownParser.js';
import './ProductCard.css';

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
    const roiPreview = product.roiMetrics
      .slice(0, 2)
      .map(m => `${m.value} ${m.label}`)
      .join(' • ');

    return `${product.valueProposition}\n\n⏱ ${product.timeline}\n\n${roiPreview}`;
  }, [product]);

  return (
    <ExpandableItem
      id={product.id}
      title={product.name}
      preview={preview}
      keyPoints={keyPoints}
      expandedSections={parsedSections}
      tags={[product.category, product.demoType]}
      enableModal={false}
      onModalOpen={null}
      showExternalIcon={false}
      className="product-card"
      index={index}
    />
  );
}

export default memo(ProductCard);
