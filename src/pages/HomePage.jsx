import IntroSection from '../components/sections/IntroSection.jsx';
import './Page.css';

function HomePage() {
  return (
    <div className="page page-home">
      <IntroSection />

      {/* Placeholder content for iteration */}
      <section className="page-section">
        <div className="section-content">
          <h2>Welcome</h2>
          <p className="lead-text">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
            tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
            quis nostrud exercitation ullamco laboris.
          </p>

          <div className="feature-grid">
            <div className="feature-item">
              <h3>Feature One</h3>
              <p>
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
                dolore eu fugiat nulla pariatur.
              </p>
            </div>
            <div className="feature-item">
              <h3>Feature Two</h3>
              <p>
                Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
                officia deserunt mollit anim id est laborum.
              </p>
            </div>
            <div className="feature-item">
              <h3>Feature Three</h3>
              <p>
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem
                accusantium doloremque laudantium.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
