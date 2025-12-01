import ProvenExcellence from '../components/sections/ProvenExcellence.jsx';
import StrategicVision from '../components/sections/StrategicVision.jsx';
import './Page.css';

function WorkPage() {
  return (
    <div className="page page-work">
      {/* Hero section for Work page */}
      <section className="page-hero">
        <div className="hero-content">
          <h1>Work</h1>
          <p className="hero-subtitle">
            Selected projects and case studies showcasing technical expertise
            and measurable impact.
          </p>
        </div>
      </section>

      {/* Existing work sections */}
      <ProvenExcellence />
      <StrategicVision />

      {/* Additional placeholder content for iteration */}
      <section className="page-section">
        <div className="section-content">
          <h2>Additional Projects</h2>
          <p className="lead-text">
            More projects and experiments exploring different technologies and approaches.
          </p>

          <div className="project-list">
            <article className="project-item">
              <h3>Project Alpha</h3>
              <p className="project-meta">Category: Web Application</p>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam
                scelerisque leo nec urna fermentum, at facilisis nisi tincidunt.
              </p>
              <div className="project-tags">
                <span className="tag">React</span>
                <span className="tag">Node.js</span>
                <span className="tag">PostgreSQL</span>
              </div>
            </article>

            <article className="project-item">
              <h3>Project Beta</h3>
              <p className="project-meta">Category: Mobile App</p>
              <p>
                Praesent commodo cursus magna, vel scelerisque nisl consectetur et.
                Donec id elit non mi porta gravida at eget metus.
              </p>
              <div className="project-tags">
                <span className="tag">React Native</span>
                <span className="tag">TypeScript</span>
                <span className="tag">Firebase</span>
              </div>
            </article>

            <article className="project-item">
              <h3>Project Gamma</h3>
              <p className="project-meta">Category: Data Platform</p>
              <p>
                Cras mattis consectetur purus sit amet fermentum. Maecenas faucibus
                mollis interdum.
              </p>
              <div className="project-tags">
                <span className="tag">Python</span>
                <span className="tag">Machine Learning</span>
                <span className="tag">AWS</span>
              </div>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}

export default WorkPage;
