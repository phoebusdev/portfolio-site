import { useMemo, memo } from 'react';
import ExpandableItem from '../shared/ExpandableItem.jsx';
import { parseExplorationContent, extractKeyPoints } from '../../utils/markdownParser.js';
import './WorkCard.css';

function WorkCard({ workItem, index }) {
  // Parse exploration content once and memoize
  const parsedSections = useMemo(
    () => parseExplorationContent(workItem.explorationContent || ''),
    [workItem.explorationContent]
  );

  const keyPoints = useMemo(
    () => extractKeyPoints(parsedSections),
    [parsedSections]
  );

  return (
    <ExpandableItem
      id={workItem.id}
      title={workItem.title}
      preview={workItem.shortDescription}
      keyPoints={keyPoints}
      expandedSections={parsedSections}
      tags={workItem.technologiesUsed || []}
      enableModal={false}
      onModalOpen={null}
      showExternalIcon={false}
      className="work-card"
      index={index}
    />
  );
}

export default memo(WorkCard);
