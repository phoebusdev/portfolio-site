import { useState } from 'react';
import './CommentForm.css';

function CommentForm({ projectId, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: 'feedback',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.message.trim()) return;

    setIsSubmitting(true);

    // Simulate submission delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    onSubmit(projectId, formData);

    setFormData({
      name: '',
      email: '',
      type: 'feedback',
      message: '',
    });
    setIsSubmitting(false);
  };

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <p className="form-notice">
        Your feedback is private and only visible to the project owner.
        This helps validate ideas and gather contributions.
      </p>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor={`name-${projectId}`}>Name (optional)</label>
          <input
            type="text"
            id={`name-${projectId}`}
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your name"
          />
        </div>
        <div className="form-group">
          <label htmlFor={`email-${projectId}`}>Email (optional)</label>
          <input
            type="email"
            id={`email-${projectId}`}
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your@email.com"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor={`type-${projectId}`}>Feedback Type</label>
        <select
          id={`type-${projectId}`}
          name="type"
          value={formData.type}
          onChange={handleChange}
        >
          <option value="feedback">General Feedback</option>
          <option value="validation">Idea Validation</option>
          <option value="contribution">Offer to Contribute</option>
          <option value="partnership">Partnership Interest</option>
          <option value="question">Question</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor={`message-${projectId}`}>Your Message *</label>
        <textarea
          id={`message-${projectId}`}
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Share your thoughts, suggestions, or how you'd like to contribute..."
          rows="5"
          required
        />
      </div>

      <button
        type="submit"
        className="submit-button"
        disabled={isSubmitting || !formData.message.trim()}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Privately'}
      </button>
    </form>
  );
}

export default CommentForm;
