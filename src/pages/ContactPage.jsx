import ImmediateValue from '../components/sections/ImmediateValue.jsx';
import './Page.css';

function ContactPage() {
  return (
    <div className="page page-contact">
      {/* Hero section for Contact page */}
      <section className="page-hero">
        <div className="hero-content">
          <h1>Contact</h1>
          <p className="hero-subtitle">
            Get in touch to discuss your project or explore collaboration opportunities.
          </p>
        </div>
      </section>

      {/* Contact information placeholder */}
      <section className="page-section">
        <div className="section-content">
          <div className="contact-grid">
            <div className="contact-info">
              <h2>Let&apos;s Connect</h2>
              <p className="lead-text">
                Whether you have a project in mind or just want to chat about
                technology and innovation, I&apos;d love to hear from you.
              </p>

              <div className="contact-methods">
                <div className="contact-method">
                  <h3>Email</h3>
                  <a href="mailto:hello@example.com">hello@example.com</a>
                </div>
                <div className="contact-method">
                  <h3>Location</h3>
                  <p>Available worldwide, remote-first</p>
                </div>
                <div className="contact-method">
                  <h3>Availability</h3>
                  <p>Currently accepting new projects</p>
                </div>
              </div>
            </div>

            <div className="contact-form-placeholder">
              <h3>Send a Message</h3>
              <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input type="text" id="name" placeholder="Your name" />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input type="email" id="email" placeholder="your@email.com" />
                </div>
                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea id="message" rows="5" placeholder="Tell me about your project..."></textarea>
                </div>
                <button type="submit" className="submit-button">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Products/Value section */}
      <ImmediateValue />
    </div>
  );
}

export default ContactPage;
