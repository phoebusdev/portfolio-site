import { useState, useRef, useEffect } from 'react';
import { animate } from 'motion';
import ReactMarkdown from 'react-markdown';
import { getSectionDisplayName } from '../../utils/markdownParser.js';
import analyticsTracker from '../../utils/analytics.js';
import { ANIMATION } from '../../constants/design.js';
import './ExpandableItem.css';

/**
 * ExpandableItem - Shared expandable card component
 *
 * Handles hover expansion with inline content display
 * Optionally supports click-to-modal behavior
 *
 * @param {Object} props
 * @param {string} props.id - Unique identifier for analytics
 * @param {string} props.title - Item title
 * @param {string} props.preview - Preview text shown when collapsed
 * @param {Array<Object>} props.keyPoints - Key points to display (optional)
 * @param {Object} props.expandedSections - Sections to show when expanded { key: markdownContent }
 * @param {Array<string>} props.tags - Tags to display (optional, e.g., technologies)
 * @param {boolean} props.enableModal - Whether clicking opens a modal
 * @param {Function} props.onModalOpen - Callback when modal should open
 * @param {boolean} props.showExternalIcon - Whether to show external link icon on hover
 * @param {string} props.className - Additional CSS class
 * @param {number} props.index - Index for animation delay
 */
function ExpandableItem({
  id,
  title,
  preview,
  keyPoints = [],
  expandedSections = {},
  tags = [],
  enableModal = false,
  onModalOpen,
  showExternalIcon = false,
  className = '',
  index = 0,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef(null);

  // Handle click - toggle expansion
  const handleClick = (e) => {
    e.preventDefault();
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);

    // Track expansion with correct state
    if (id) {
      const eventName = newExpandedState ? 'item_expanded' : 'item_collapsed';
      analyticsTracker.trackEvent?.(eventName, { item_id: id });
    }
  };

  // Handle keyboard navigation
  const handleKeyPress = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick(event);
    }
  };

  // Animate expanded content height
  useEffect(() => {
    if (!contentRef.current) return;

    let animation;
    const element = contentRef.current;

    if (isExpanded) {
      const height = element.scrollHeight;

      animation = animate(
        element,
        {
          height: [`0px`, `${height}px`],
          opacity: [0, 1],
        },
        {
          duration: ANIMATION.DURATION.NORMAL,
          easing: ANIMATION.EASING.STANDARD,
        }
      );
    } else {
      const currentHeight = element.scrollHeight;

      animation = animate(
        element,
        {
          height: [`${currentHeight}px`, `0px`],
          opacity: [1, 0],
        },
        {
          duration: ANIMATION.DURATION.FAST,
          easing: ANIMATION.EASING.STANDARD,
        }
      );
    }

    // Cleanup: stop animation if component unmounts or effect re-runs
    return () => {
      animation?.stop?.();
    };
  }, [isExpanded]);

  const hasExpandedContent = Object.keys(expandedSections).length > 0;

  const contentId = `expandable-content-${id}`;
  const titleId = `expandable-title-${id}`;

  return (
    <article
      className={`expandable-item ${isExpanded ? 'expanded' : ''} ${className}`}
      onClick={handleClick}
      onKeyPress={handleKeyPress}
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
      aria-controls={hasExpandedContent ? contentId : undefined}
      aria-label={`${title} - ${isExpanded ? 'collapse' : 'expand'} for more details`}
      style={{ animationDelay: `${index * ANIMATION.DELAY.STEP}s` }}
    >
      {/* Preview Content (Always Visible) */}
      <div className="expandable-item-preview">
        <h3 id={titleId} className="expandable-item-title">{title}</h3>
        <p className="expandable-item-description">{preview}</p>

        {/* Key Points */}
        {keyPoints.length > 0 && (
          <ul className="expandable-item-keypoints">
            {keyPoints.map((point, i) => (
              <li key={i}>{point.text}</li>
            ))}
          </ul>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="expandable-item-tags">
            {tags.slice(0, 4).map((tag) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Expand/Collapse Indicator */}
        <span className="expand-indicator" aria-hidden="true">
          {isExpanded ? '−' : '+'}
        </span>
      </div>

      {/* Expanded Content (Shown on Hover/Click) */}
      {hasExpandedContent && (
        <div
          ref={contentRef}
          id={contentId}
          className="expandable-item-content"
          role="region"
          aria-labelledby={titleId}
          style={{
            height: 0,
            opacity: 0,
            overflow: 'hidden',
          }}
        >
          <div className="expandable-item-sections">
            {Object.entries(expandedSections).map(([key, content]) => (
              <div key={key} className="content-section">
                <h4 className="content-section-title">{getSectionDisplayName(key)}</h4>
                <div className="content-section-body">
                  <ReactMarkdown>{content}</ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

export default ExpandableItem;
