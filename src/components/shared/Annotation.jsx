import PropTypes from 'prop-types';
import './Annotation.css';

/**
 * Annotation - Elegant text component for contextual information
 *
 * Displays heading and paragraphs without card styling.
 * Text is gracefully distinct from background with subtle effects.
 * Uses position: sticky to "stick" to viewport as user scrolls.
 *
 * @param {Object} props
 * @param {string} props.heading - Annotation heading
 * @param {Array<string>} props.paragraphs - Array of paragraph text
 * @param {string} props.className - Additional CSS classes
 */
function Annotation({ heading, paragraphs, className = '' }) {
  return (
    <div className={`annotation ${className}`}>
      <h3 className="annotation-heading">{heading}</h3>
      <div className="annotation-content">
        {paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
}

Annotation.propTypes = {
  heading: PropTypes.string.isRequired,
  paragraphs: PropTypes.arrayOf(PropTypes.string).isRequired,
  className: PropTypes.string,
};

export default Annotation;
