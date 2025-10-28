import { useMemo, memo } from 'react';
import ExpandableItem from '../shared/ExpandableItem.jsx';
import { parseExplorationContent, extractKeyPoints } from '../../utils/markdownParser.js';
import './WorkCard.css';

/**
 * WebsiteLink - Component for displaying website link button
 */
function WebsiteLink({ url, itemName }) {
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
      className="work-card-website-link"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="link"
      tabIndex={0}
      aria-label={`Visit ${itemName} website in new tab`}
    >
      <span className="website-link-icon">🔗</span>
      <span className="website-link-text">Visit Website</span>
    </div>
  );
}

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

  // Determine card type for visual styling
  const isCompany = workItem.type === 'company';
  const isSubProject = workItem.type === 'project' && workItem.parentCompany;

  const cardClassName = `work-card ${
    isCompany ? 'work-card--company' : ''
  } ${isSubProject ? 'work-card--sub-project' : ''}`;

  // Create website link component if URL exists
  const websiteLink = useMemo(() => {
    if (!workItem.websiteUrl) return null;
    return <WebsiteLink url={workItem.websiteUrl} itemName={workItem.title} />;
  }, [workItem.websiteUrl, workItem.title]);

  return (
    <ExpandableItem
      id={workItem.id}
      title={workItem.title}
      preview={workItem.shortDescription}
      previewImage={websiteLink}
      keyPoints={keyPoints}
      expandedSections={parsedSections}
      tags={workItem.technologiesUsed || []}
      enableModal={false}
      onModalOpen={null}
      showExternalIcon={false}
      className={cardClassName}
      index={index}
    />
  );
}

export default memo(WorkCard);
