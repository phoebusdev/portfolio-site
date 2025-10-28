import PropTypes from 'prop-types';
import './AnnotatedLayout.css';

/**
 * AnnotatedLayout - Side-by-side layout with annotation and cards
 *
 * Creates 40/60 split. Parallax should be applied to content within
 * renderAnnotation and renderCards functions, not to the layout columns.
 * On mobile: stacks vertically (annotation top, cards below).
 *
 * @param {Object} props
 * @param {Function} props.renderAnnotation - Render function for annotation: () => JSX
 * @param {Function} props.renderCards - Render function for cards: () => JSX
 * @param {string} props.annotationPosition - 'left' | 'right' (default: 'right')
 * @param {string} props.className - Additional CSS classes
 */
function AnnotatedLayout({
  renderAnnotation,
  renderCards,
  annotationPosition = 'right',
  className = '',
}) {
  const layoutClass = annotationPosition === 'left'
    ? 'annotated-layout annotation-left'
    : 'annotated-layout annotation-right';

  return (
    <div className={`${layoutClass} ${className}`}>
      {/* Cards Column */}
      <div className="annotated-layout-cards">
        {renderCards()}
      </div>

      {/* Annotation Column */}
      <div className="annotated-layout-annotation">
        {renderAnnotation()}
      </div>
    </div>
  );
}

AnnotatedLayout.propTypes = {
  renderAnnotation: PropTypes.func.isRequired,
  renderCards: PropTypes.func.isRequired,
  annotationPosition: PropTypes.oneOf(['left', 'right']),
  className: PropTypes.string,
};

export default AnnotatedLayout;
