import PropTypes from 'prop-types';
import './Annotation.css';

/**
 * Annotation - Elegant text component for contextual information
 *
 * Displays heading and paragraphs without card styling.
 * Text is gracefully distinct from background with subtle effects.
 *
 * @param {Object} props
 * @param {string} props.heading - Annotation heading
 * @param {Array<string>} props.paragraphs - Array of paragraph text
 * @param {number} props.parallax - Parallax speed value for data-parallax attribute
 * @param {string} props.className - Additional CSS classes
 */
function Annotation({ heading, paragraphs, parallax, className = '' }) {
  return (
    <div
      className={`annotation ${className}`}
      data-parallax={parallax}
    >
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
  parallax: PropTypes.number,
  className: PropTypes.string,
};

export default Annotation;
