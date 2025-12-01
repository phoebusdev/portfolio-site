import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import './Page.css';

function PressPage() {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import('@content/press.json')
      .then((module) => {
        setPosts(module.default.posts || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load press data:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="page page-press">
        <section className="page-hero">
          <div className="hero-content">
            <h1>Press</h1>
            <p className="hero-subtitle">Loading...</p>
          </div>
        </section>
      </div>
    );
  }

  // If a post is selected, show the full post
  if (selectedPost) {
    return (
      <div className="page page-press">
        <article className="blog-post-full">
          <header className="post-header">
            <button
              className="back-button"
              onClick={() => setSelectedPost(null)}
            >
              ← Back to all posts
            </button>
            <h1>{selectedPost.title}</h1>
            <div className="post-meta">
              <span className="post-date">{selectedPost.publishedAt}</span>
              <span className="post-read-time">{selectedPost.readTime}</span>
            </div>
            <div className="post-tags">
              {selectedPost.tags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          </header>
          <div className="post-content">
            <ReactMarkdown>{selectedPost.content}</ReactMarkdown>
          </div>
        </article>
      </div>
    );
  }

  // Show posts list
  const featuredPosts = posts.filter((p) => p.featured);
  const otherPosts = posts.filter((p) => !p.featured);

  return (
    <div className="page page-press">
      {/* Hero section */}
      <section className="page-hero">
        <div className="hero-content">
          <h1>Press</h1>
          <p className="hero-subtitle">
            Insights, announcements, and thoughts on technology and innovation.
          </p>
        </div>
      </section>

      {/* Featured posts */}
      {featuredPosts.length > 0 && (
        <section className="page-section">
          <div className="section-content">
            <h2>Featured</h2>
            <div className="featured-posts-grid">
              {featuredPosts.map((post) => (
                <article
                  key={post.id}
                  className="blog-card featured"
                  onClick={() => setSelectedPost(post)}
                >
                  <div className="blog-card-content">
                    <div className="blog-card-meta">
                      <span className="post-date">{post.publishedAt}</span>
                      <span className="post-read-time">{post.readTime}</span>
                    </div>
                    <h3>{post.title}</h3>
                    <p>{post.excerpt}</p>
                    <div className="post-tags">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="tag small">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All posts */}
      <section className="page-section">
        <div className="section-content">
          <h2>All Posts</h2>
          <div className="posts-list">
            {posts.map((post) => (
              <article
                key={post.id}
                className="blog-card"
                onClick={() => setSelectedPost(post)}
              >
                <div className="blog-card-content">
                  <div className="blog-card-meta">
                    <span className="post-date">{post.publishedAt}</span>
                    <span className="post-read-time">{post.readTime}</span>
                    {post.featured && (
                      <span className="featured-badge">Featured</span>
                    )}
                  </div>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  <div className="post-tags">
                    {post.tags.map((tag) => (
                      <span key={tag} className="tag small">
                        {tag}
                      </span>
                    ))}
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

export default PressPage;
