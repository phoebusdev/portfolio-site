import { useState, useEffect } from 'react';
import SitePreview from '../components/shared/SitePreview.jsx';
import CommentForm from '../components/shared/CommentForm.jsx';
import SphereAnimation from '../components/effects/SphereAnimation.jsx';
import { logError } from '../utils/errorLogger.js';
import './Page.css';

const STATUS_LABELS = {
  'concept': 'Concept',
  'seeking-validation': 'Seeking Validation',
  'active-development': 'Active Development',
  'launched': 'Launched',
};

const STATUS_COLORS = {
  'concept': '#9ca3af',
  'seeking-validation': '#f59e0b',
  'active-development': '#3b82f6',
  'launched': '#10b981',
};

function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedProject, setExpandedProject] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    import('@content/projects.json')
      .then((module) => {
        setProjects(module.default.projects || []);
        setLoading(false);
      })
      .catch((err) => {
        logError('PROJECTS_LOAD_FAILED', { error: err.message, page: 'ProjectsPage' });
        setLoading(false);
      });
  }, []);

  const statuses = ['all', ...Object.keys(STATUS_LABELS)];
  const filteredProjects =
    statusFilter === 'all'
      ? projects
      : projects.filter((p) => p.status === statusFilter);

  const handleCommentSubmit = (projectId, comment) => {
    // Comments are stored in localStorage (only visible to site owner)
    const storageKey = `project-comments-${projectId}`;
    const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const newComment = {
      id: Date.now(),
      ...comment,
      timestamp: new Date().toISOString(),
    };
    existing.push(newComment);
    localStorage.setItem(storageKey, JSON.stringify(existing));
    alert('Thank you! Your feedback has been submitted privately.');
  };

  if (loading) {
    return (
      <div className="page page-projects">
        <section className="page-hero page-hero-split">
          <SphereAnimation />
          <div className="hero-content hero-content-left">
            <h1>Projects</h1>
            <p className="hero-subtitle">Loading...</p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page page-projects">
      {/* Hero section */}
      <section className="page-hero page-hero-split">
        <SphereAnimation />
        <div className="hero-content hero-content-left">
          <h1>Projects</h1>
          <p className="hero-subtitle">
            Ideas seeking validation, contribution, and collaboration.
            Share your thoughts privately.
          </p>
        </div>
      </section>

      {/* Filter bar */}
      <section className="filter-bar">
        <div className="section-content">
          <div className="filter-buttons">
            {statuses.map((status) => (
              <button
                key={status}
                className={`filter-button ${statusFilter === status ? 'active' : ''}`}
                onClick={() => setStatusFilter(status)}
              >
                {status === 'all' ? 'All' : STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects list */}
      <section className="page-section">
        <div className="section-content">
          <div className="projects-list">
            {filteredProjects.map((project) => (
              <article key={project.id} className="project-card-full">
                <div className="project-header">
                  <div className="project-title-row">
                    <h3>{project.title}</h3>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: STATUS_COLORS[project.status] }}
                    >
                      {STATUS_LABELS[project.status]}
                    </span>
                  </div>
                  <p className="project-date">Started {project.createdAt}</p>
                </div>

                <p className="project-description">{project.description}</p>

                {/* Site Preview if available */}
                {project.previewUrl && (
                  <div className="project-preview">
                    <SitePreview url={project.previewUrl} title={project.title} />
                    <a
                      href={project.previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="preview-link"
                    >
                      View Live Demo →
                    </a>
                  </div>
                )}

                {/* Goals */}
                <div className="project-section">
                  <h4>Goals</h4>
                  <ul className="goals-list">
                    {project.goals.map((goal, idx) => (
                      <li key={idx}>{goal}</li>
                    ))}
                  </ul>
                </div>

                {/* Seeking Contributions */}
                <div className="project-section">
                  <h4>Seeking Contributions</h4>
                  <ul className="contributions-list">
                    {project.seekingContributions.map((contribution, idx) => (
                      <li key={idx}>{contribution}</li>
                    ))}
                  </ul>
                </div>

                {/* Tags */}
                <div className="project-tags">
                  {project.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Comment Form Toggle */}
                <div className="project-feedback">
                  <button
                    className="feedback-toggle"
                    onClick={() =>
                      setExpandedProject(
                        expandedProject === project.id ? null : project.id
                      )
                    }
                  >
                    {expandedProject === project.id
                      ? 'Hide Feedback Form'
                      : 'Share Your Thoughts (Private)'}
                  </button>

                  {expandedProject === project.id && (
                    <CommentForm
                      projectId={project.id}
                      onSubmit={handleCommentSubmit}
                    />
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default ProjectsPage;
