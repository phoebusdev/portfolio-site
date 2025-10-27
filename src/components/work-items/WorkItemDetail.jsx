import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { animate } from 'motion';
import ImpactMetrics from './ImpactMetrics.jsx';
import './WorkItemDetail.css';

function WorkItemDetail({ workItem, onClose }) {
  const modalRef = useRef(null);
  const overlayRef = useRef(null);
  const previousFocus = useRef(null);

  useEffect(() => {
    // Save previous focus for accessibility
    previousFocus.current = document.activeElement;

    // Animate modal entrance
    if (modalRef.current && overlayRef.current) {
      // Overlay fade in
      animate(
        overlayRef.current,
        { opacity: [0, 1] },
        { duration: 0.3, easing: [0.42, 0, 0.58, 1] }
      );

      // Modal slide up
      animate(
        modalRef.current,
        {
          transform: ['translateY(100px)', 'translateY(0)'],
          opacity: [0, 1],
        },
        { duration: 0.5, easing: [0.42, 0, 0.58, 1] }
      );
    }

    // Focus modal for screen readers
    modalRef.current?.focus();

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Cleanup
    return () => {
      document.body.style.overflow = '';
      // Restore previous focus
      previousFocus.current?.focus();
    };
  }, []);

  const handleClose = async () => {
    if (modalRef.current && overlayRef.current) {
      // Animate modal exit
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
      className="work-item-overlay"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="work-item-title"
    >
      <div
        ref={modalRef}
        className="work-item-modal"
        tabIndex={-1}
      >
        <button
          className="close-button"
          onClick={handleClose}
          aria-label="Close modal"
        >
          ✕
        </button>

        <div className="modal-content">
          <header className="modal-header">
            <h2 id="work-item-title">{workItem.title}</h2>
            <p className="modal-description">{workItem.shortDescription}</p>
          </header>

          <ImpactMetrics metrics={workItem.impactMetrics} />

          <div className="modal-story">
            <h3>Detailed Story</h3>
            <ReactMarkdown>{workItem.detailedStory}</ReactMarkdown>
          </div>

          {workItem.explorationContent && (
            <div className="modal-exploration">
              <ReactMarkdown>{workItem.explorationContent}</ReactMarkdown>
            </div>
          )}

          {workItem.visualAssets && workItem.visualAssets.length > 0 && (
            <div className="modal-visuals">
              <h3>Visual Assets</h3>
              <div className="visuals-grid">
                {workItem.visualAssets.map((asset, index) => (
                  <figure key={index} className="visual-item">
                    <img
                      src={asset.url}
                      alt={asset.alt}
                      loading="lazy"
                      width={asset.width}
                      height={asset.height}
                    />
                    {asset.caption && <figcaption>{asset.caption}</figcaption>}
                  </figure>
                ))}
              </div>
            </div>
          )}

          {workItem.technologiesUsed && workItem.technologiesUsed.length > 0 && (
            <div className="modal-tech">
              <h4>Technologies Used</h4>
              <div className="tech-tags">
                {workItem.technologiesUsed.map((tech) => (
                  <span key={tech} className="tech-tag">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default WorkItemDetail;
