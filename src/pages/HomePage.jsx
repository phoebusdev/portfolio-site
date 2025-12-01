import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import IntroSection from '../components/sections/IntroSection.jsx';
import './Page.css';

function HomePage() {
  const [featuredPosts, setFeaturedPosts] = useState([]);

  useEffect(() => {
    import('@content/press.json')
      .then((module) => {
        const posts = module.default.posts || [];
        setFeaturedPosts(posts.filter((p) => p.featured).slice(0, 2));
      })
      .catch((err) => {
        console.error('Failed to load press data:', err);
      });
  }, []);

  return (
    <div className="page page-home">
      <IntroSection />

      {/* Welcome section */}
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

      {/* Featured Press section */}
      {featuredPosts.length > 0 && (
        <section className="page-section">
          <div className="section-content">
            <div className="section-header-row">
              <h2>Latest from Press</h2>
              <Link to="/press" className="view-all-link">
                View all posts →
              </Link>
            </div>

            <div className="featured-posts-grid home-featured">
              {featuredPosts.map((post) => (
                <Link
                  key={post.id}
                  to="/press"
                  className="blog-card featured home-blog-card"
                >
                  <div className="blog-card-content">
                    <div className="blog-card-meta">
                      <span className="post-date">{post.publishedAt}</span>
                      <span className="post-read-time">{post.readTime}</span>
                    </div>
                    <h3>{post.title}</h3>
                    <p>{post.excerpt}</p>
                    <div className="post-tags">
                      {post.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="tag small">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default HomePage;
