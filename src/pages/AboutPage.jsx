import PageBackground from '../components/effects/PageBackground.jsx';
import SwarmAnimation from '../components/effects/SwarmAnimation.jsx';
import './Page.css';

function AboutPage() {
  return (
    <div className="page page-about">
      <PageBackground>
        <SwarmAnimation />
      </PageBackground>

      {/* Hero section */}
      <section className="page-hero">
        <div className="hero-content">
          <h1>About</h1>
          <p className="hero-subtitle">
            Building technology that makes a difference.
          </p>
        </div>
      </section>

      {/* About content */}
      <section className="page-section">
        <div className="section-content">
          <div className="about-grid">
            <div className="about-main">
              <h2>Our Story</h2>
              <p className="lead-text">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
              <p>
                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
                reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                pariatur.
              </p>
              <p>
                Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
                officia deserunt mollit anim id est laborum. Sed ut perspiciatis
                unde omnis iste natus error sit voluptatem accusantium doloremque
                laudantium.
              </p>

              <h3>Our Mission</h3>
              <p>
                Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit
                aut fugit, sed quia consequuntur magni dolores eos qui ratione
                voluptatem sequi nesciunt.
              </p>

              <h3>Our Values</h3>
              <ul className="values-list">
                <li>
                  <strong>Innovation</strong> - Pushing boundaries and exploring
                  new possibilities
                </li>
                <li>
                  <strong>Transparency</strong> - Open communication and honest
                  dealings
                </li>
                <li>
                  <strong>Quality</strong> - Excellence in everything we build
                </li>
                <li>
                  <strong>Impact</strong> - Creating meaningful change through
                  technology
                </li>
              </ul>
            </div>

            <aside className="about-sidebar">
              <div className="sidebar-card">
                <h4>Quick Facts</h4>
                <dl className="facts-list">
                  <dt>Founded</dt>
                  <dd>2020</dd>
                  <dt>Location</dt>
                  <dd>Remote-first, Worldwide</dd>
                  <dt>Focus</dt>
                  <dd>Technology & Innovation</dd>
                  <dt>Projects</dt>
                  <dd>10+ Launched</dd>
                </dl>
              </div>

              <div className="sidebar-card">
                <h4>Technologies</h4>
                <div className="tech-tags">
                  <span className="tag">React</span>
                  <span className="tag">Node.js</span>
                  <span className="tag">Python</span>
                  <span className="tag">AI/ML</span>
                  <span className="tag">Cloud</span>
                  <span className="tag">DevOps</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Timeline section */}
      <section className="page-section">
        <div className="section-content">
          <h2>Journey</h2>
          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <h4>2024</h4>
                <p>Launched new platform with AI-powered features</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <h4>2023</h4>
                <p>Expanded to serve clients globally</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <h4>2022</h4>
                <p>Released first open-source tools</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <h4>2021</h4>
                <p>Completed first major client project</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <h4>2020</h4>
                <p>Founded with a vision to build impactful technology</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutPage;
