import PropTypes from 'prop-types';
import { PARALLAX } from '../../constants/design.js';
import './AnnotatedLayout.css';

/**
 * AnnotatedLayout - Side-by-side layout with annotation and cards
 *
 * Creates 40/60 split with slower-scrolling annotation panel.
 * On mobile: stacks vertically (annotation top, cards below).
 *
 * @param {Object} props
 * @param {Function} props.renderAnnotation - Render function for annotation: () => JSX
 * @param {Function} props.renderCards - Render function for cards: () => JSX
 * @param {string} props.annotationPosition - 'left' | 'right' (default: 'right')
 * @param {number} props.annotationParallax - Parallax speed for annotation (default: PARALLAX.CONTENT.ANNOTATION)
 * @param {number} props.cardsParallax - Parallax base speed for cards (default: PARALLAX.CONTENT.ITEMS_BASE)
 * @param {string} props.className - Additional CSS classes
 */
function AnnotatedLayout({
  renderAnnotation,
  renderCards,
  annotationPosition = 'right',
  annotationParallax = PARALLAX.CONTENT.ANNOTATION,
  cardsParallax = PARALLAX.CONTENT.ITEMS_BASE,
  className = '',
}) {
  const layoutClass = annotationPosition === 'left'
    ? 'annotated-layout annotation-left'
    : 'annotated-layout annotation-right';

  return (
    <div className={`${layoutClass} ${className}`}>
      {/* Cards Column */}
      <div
        className="annotated-layout-cards"
        data-parallax={cardsParallax}
      >
        {renderCards()}
      </div>

      {/* Annotation Column */}
      <div
        className="annotated-layout-annotation"
        data-parallax={annotationParallax}
      >
        {renderAnnotation()}
      </div>
    </div>
  );
}

AnnotatedLayout.propTypes = {
  renderAnnotation: PropTypes.func.isRequired,
  renderCards: PropTypes.func.isRequired,
  annotationPosition: PropTypes.oneOf(['left', 'right']),
  annotationParallax: PropTypes.number,
  cardsParallax: PropTypes.number,
  className: PropTypes.string,
};

export default AnnotatedLayout;
