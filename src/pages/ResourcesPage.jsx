import { useState, useEffect } from 'react';
import SitePreview from '../components/shared/SitePreview.jsx';
import { logError } from '../utils/errorLogger.js';
import './Page.css';

function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    import('@content/resources.json')
      .then((module) => {
        setResources(module.default.resources || []);
        setLoading(false);
      })
      .catch((err) => {
        logError('RESOURCES_LOAD_FAILED', { error: err.message, page: 'ResourcesPage' });
        setLoading(false);
      });
  }, []);

  const categories = ['all', ...new Set(resources.map((r) => r.category))];
  const filteredResources =
    filter === 'all'
      ? resources
      : resources.filter((r) => r.category === filter);

  if (loading) {
    return (
      <div className="page page-resources">
        <section className="page-hero">
          <div className="hero-content">
            <h1>Resources</h1>
            <p className="hero-subtitle">Loading...</p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page page-resources">
      {/* Hero section */}
      <section className="page-hero">
        <div className="hero-content">
          <h1>Resources</h1>
          <p className="hero-subtitle">
            Production-ready tools and projects you can use today.
          </p>
        </div>
      </section>

      {/* Filter bar */}
      <section className="filter-bar">
        <div className="section-content">
          <div className="filter-buttons">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`filter-button ${filter === cat ? 'active' : ''}`}
                onClick={() => setFilter(cat)}
              >
                {cat === 'all' ? 'All' : cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Resources grid */}
      <section className="page-section">
        <div className="section-content">
          <div className="resources-grid">
            {filteredResources.map((resource) => (
              <article key={resource.id} className="resource-card">
                {/* Site Preview */}
                {resource.previewUrl && (
                  <SitePreview
                    url={resource.previewUrl}
                    title={resource.name}
                  />
                )}

                <div className="resource-card-content">
                  <div className="resource-header">
                    <h3>{resource.name}</h3>
                    <span className={`status-badge ${resource.status}`}>
                      {resource.status}
                    </span>
                  </div>

                  <p className="resource-category">{resource.category}</p>
                  <p className="resource-description">{resource.description}</p>

                  {/* Features */}
                  <ul className="resource-features">
                    {resource.features.slice(0, 3).map((feature, idx) => (
                      <li key={idx}>{feature}</li>
                    ))}
                  </ul>

                  {/* Tags */}
                  <div className="resource-tags">
                    {resource.tags.map((tag) => (
                      <span key={tag} className="tag small">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Links */}
                  <div className="resource-links">
                    {resource.previewUrl && (
                      <a
                        href={resource.previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="resource-link"
                      >
                        Live Demo
                      </a>
                    )}
                    {resource.documentationUrl && (
                      <a
                        href={resource.documentationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="resource-link"
                      >
                        Docs
                      </a>
                    )}
                    {resource.githubUrl && (
                      <a
                        href={resource.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="resource-link"
                      >
                        GitHub
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default ResourcesPage;
