import { useMemo, memo } from 'react';
import ExpandableItem from '../shared/ExpandableItem.jsx';
import { parseInsightContent } from '../../utils/markdownParser.js';
import './InsightCard.css';

/**
 * InsightCard - Strategic insight component with inline expansion
 *
 * Shows title and opportunity as preview, expands to show
 * currentState, analysis, and proposal inline (no modal)
 *
 * @param {Object} props
 * @param {Object} props.insight - Insight data object
 * @param {number} props.index - Index for animation delay
 */
function InsightCard({ insight, index }) {
  // Parse insight content into sections
  const sections = useMemo(
    () => parseInsightContent(insight),
    [insight]
  );

  return (
    <ExpandableItem
      id={insight.id}
      title={insight.title}
      preview={insight.opportunity}
      keyPoints={[]} // No key points for insights - they're text-focused
      expandedSections={sections}
      tags={[]} // No tags for insights
      enableModal={false} // Insights expand inline only, no modal
      onModalOpen={null}
      showExternalIcon={false} // No external icon for insights
      className="insight-card"
      index={index}
    />
  );
}

export default memo(InsightCard);
