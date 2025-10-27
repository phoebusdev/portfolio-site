import { useState } from 'react';
import { animate } from 'motion';
import WorkItemDetail from './WorkItemDetail.jsx';
import analyticsTracker from '../../utils/analytics.js';
import './WorkCard.css';

function WorkCard({ workItem, index }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = () => {
    setIsExpanded(true);
    analyticsTracker.trackWorkItemExplored(workItem.id);
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
        className="work-card hover-lift"
        onClick={handleClick}
        onKeyPress={handleKeyPress}
        role="button"
        tabIndex={0}
        aria-label={`View details for ${workItem.title}`}
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        <h3 className="work-card-title">{workItem.title}</h3>
        <p className="work-card-description">{workItem.shortDescription}</p>

        <div className="work-card-metrics">
          {workItem.impactMetrics.slice(0, 2).map((metric, i) => (
            <div key={i} className="metric-item">
              <span className="metric-value">{metric.value}</span>
              <span className="metric-label">{metric.label}</span>
              {metric.context && (
                <span className="metric-context">{metric.context}</span>
              )}
            </div>
          ))}
        </div>

        <div className="work-card-tech">
          {workItem.technologiesUsed.slice(0, 4).map((tech) => (
            <span key={tech} className="tech-tag">
              {tech}
            </span>
          ))}
        </div>

        <span className="work-card-cta">Explore →</span>
      </article>

      {isExpanded && (
        <WorkItemDetail workItem={workItem} onClose={handleClose} />
      )}
    </>
  );
}

export default WorkCard;
