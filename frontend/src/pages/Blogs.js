import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllBlogs, getBlogsByCategory, searchBlogs, getAdminBlogs } from '../redux/actions/blogActions';
import { getAllCategories } from '../redux/actions/categoryActions';
import { getSingleCategory } from '../redux/actions/categoryActions';
import { saveBlog, getSavedBlogs } from "../redux/actions/userActions"
import { deleteBlog } from '../redux/actions/blogActions';
import { Link } from 'react-router-dom';
import Categories from '../components/Categories';
import moment from 'moment';

const Blogs = () => {
  const dispatch = useDispatch();
  const { blogs, totalBlogs, currentPage, totalPages, error, loading } = useSelector((state) => state.blogs);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { category } = useSelector((state) => state.categories);
  const { savedBlogs } = useSelector((state) => state.users)

  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null); // Track selected category
  const [searchQuery, setSearchQuery] = useState(''); // Track search query
  const [filter, setFilter] = useState('latest'); // Track selected filter (latest, admin, category)
  const [serverWaking, setServerWaking] = useState(false);

  const limit = 10; // Number of blogs per page

  useEffect(() => {
    if (!loading) {
      setServerWaking(false);
      return undefined;
    }

    const timer = window.setTimeout(() => setServerWaking(true), 1500);
    return () => window.clearTimeout(timer);
  }, [loading]);

  // Fetch blogs based on filter
  useEffect(() => {
    if (filter === 'category' && selectedCategory) {
      dispatch(getBlogsByCategory(selectedCategory, page, limit));
      dispatch(getSingleCategory(selectedCategory));
    } else if (filter === 'admin') {
      dispatch(getAdminBlogs(page, limit));
    } else if (filter === 'search' && searchQuery) {
      dispatch(searchBlogs(searchQuery, page, limit));
    } else {
      dispatch(getAllBlogs(page, limit)); // Default to latest blogs
    }
    // Dispatch getSavedBlogs only if the user is authenticated and has the "reader" role
    if (isAuthenticated && user?.role === 'reader') {
      dispatch(getSavedBlogs());
    }
    dispatch(getAllCategories());
  }, [dispatch, page, limit, filter, selectedCategory, searchQuery, isAuthenticated, user?.role]);

  // console.log(blogs)

  // Handle pagination
  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const handlePreviousPage = () => {
    if (page > 1) setPage(page - 1);
  };

  // Handle category click
  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    setFilter('category'); // Set filter to category
    setPage(1); // Reset to the first page
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setFilter('search'); // Set filter to search
    setPage(1); // Reset to the first page
  };

  // Handle filter change
  const handleFilterChange = (filterType) => {
    setFilter(filterType);
    setSelectedCategory(null); // Clear selected category
    setSearchQuery(''); // Clear search query
    setPage(1); // Reset to the first page
  };

  const handleBlogSave = async (blogId) => {
    await dispatch(saveBlog(blogId));
    dispatch(getSavedBlogs());
  };

  const handleBlogDelete = (blogId) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      dispatch(deleteBlog(blogId));
    }
  };

  const handleRetry = () => {
    if (filter === 'category' && selectedCategory) {
      dispatch(getBlogsByCategory(selectedCategory, page, limit));
    } else if (filter === 'admin') {
      dispatch(getAdminBlogs(page, limit));
    } else if (filter === 'search' && searchQuery) {
      dispatch(searchBlogs(searchQuery, page, limit));
    } else {
      dispatch(getAllBlogs(page, limit));
    }
  };

  return (
    <main className="blog-home">
      <section className="blog-hero">
        <div className="blog-hero-content">
          <span className="eyebrow">A little inspiration, every day</span>
          <h1>Ideas worth<br /><span>sharing.</span></h1>
          <p>Stories, perspectives, and thoughtful reads from our community.</p>
          <a href="#stories" className="hero-link">Explore the latest <span aria-hidden="true">↓</span></a>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="hero-art-orbit orbit-one" />
          <div className="hero-art-orbit orbit-two" />
          <div className="hero-art-note">Read<br />something<br /><em>new.</em></div>
        </div>
      </section>

      <div className="blog-layout" id="stories">
        <section className="feed-section">
          <div className="feed-heading">
            <div>
              <span className="eyebrow">The journal</span>
              <h2>
            {filter === 'category' && selectedCategory
              ? `Blogs in ${category?.name} (${totalBlogs})`
              : filter === 'admin'
                ? `Admin Blogs (${totalBlogs})`
                : filter === 'search'
                  ? `Search Results for "${searchQuery}" (${totalBlogs})`
                  : `Latest Blogs (${totalBlogs})`}
              </h2>
            </div>
            <span className="feed-count">{totalBlogs} {totalBlogs === 1 ? 'story' : 'stories'}</span>
          </div>
          {error && !loading && (
            <div className="connection-notice" role="status">
              <span className="connection-icon" aria-hidden="true">↻</span>
              <div>
                <strong>{error.includes('wake up') ? 'Just a moment — the server is waking up' : 'We couldn’t load the stories'}</strong>
                <p>{error}</p>
                {error.includes('wake up') && <p className="connection-hint">You’re still connected to the site. This can take up to a minute on a first visit.</p>}
                <button className="text-button" type="button" onClick={handleRetry}>Try again</button>
              </div>
            </div>
          )}
          {loading ? (
            <div className="loading-panel" role="status" aria-live="polite">
              <span className="loading-spinner" aria-hidden="true" />
              <div>
                <strong>{serverWaking ? 'The blog server is waking up…' : 'Loading stories…'}</strong>
                <p>{serverWaking
                  ? 'The first visit can take up to a minute. You’re in the right place — your stories are on their way.'
                  : 'Getting the journal ready for you.'}</p>
              </div>
              <div className="skeleton-stack" aria-hidden="true">
                <span /><span /><span />
              </div>
            </div>
          ) : (
          <div className="story-list">
            {blogs.map((blog) => (
              <article className="story-card" key={blog._id}>
                {blog.image && <img src={blog.image} alt="" className="story-image" />}
                <div className="story-content">
                  {isAuthenticated && user.role === 'reader' ? (
                    <div className="story-save">
                      {savedBlogs.find(sblog => sblog._id === blog._id) ? (
                        <span className="saved-label">Saved</span>
                      ) : (
                        <button
                          className="save-button"
                          onClick={() => {
                            handleBlogSave(blog._id);
                          }}
                        >
                          Save
                        </button>
                      )}
                    </div>
                  ) : null}
                  <span className="story-date">{moment(blog.createdAt).fromNow()}</span>
                  <h3>{blog.title}</h3>
                  <p className="story-excerpt">{blog.content.substring(0, 160)}{blog.content.length > 160 ? '…' : ''}</p>
                  <div className="story-meta">
                    <span>By <strong>{blog.author.username}</strong></span>
                    <div className="story-actions">
                      <Link to={`/blog/${blog._id}`} className="read-link">Read story <span aria-hidden="true">→</span></Link>
                      {user && user.role === 'admin' && (
                        <button className="delete-link" onClick={() => handleBlogDelete(blog._id)}>Delete</button>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
          )}
          {!loading && !error && blogs.length === 0 && (
            <div className="empty-state">
              <span aria-hidden="true">✳</span>
              <h3>No stories here yet</h3>
              <p>Try another category or check back soon for something new.</p>
            </div>
          )}
          {!loading && blogs.length > 0 && <div className="pagination-bar">
            <button
              className="pagination-button"
              onClick={handlePreviousPage}
              disabled={page === 1 || loading}
            >
              ← Previous
            </button>
            <span className="pagination-label">
              Page {currentPage} <span>of</span> {totalPages}
            </span>
            <button
              className="pagination-button"
              onClick={handleNextPage}
              disabled={page === totalPages || loading}
            >
              Next →
            </button>
          </div>}
        </section>

        <aside className="blog-sidebar">
          <form onSubmit={handleSearch} className="search-form">
            <label htmlFor="blog-search">Find a story</label>
            <div className="search-input-wrap">
              <input
                id="blog-search"
                type="search"
                placeholder="Search the journal..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" aria-label="Search stories">⌕</button>
            </div>
          </form>
          <div className="filter-group">
            <h3>Browse</h3>
            <button
              className={`filter-button ${filter === 'latest' ? 'is-active' : ''}`}
              onClick={() => handleFilterChange('latest')}
            >
              <span>Latest stories</span><span aria-hidden="true">→</span>
            </button>
            <button
              className={`filter-button ${filter === 'admin' ? 'is-active' : ''}`}
              onClick={() => handleFilterChange('admin')}
            >
              <span>Editor's picks</span><span aria-hidden="true">→</span>
            </button>
          </div>
          <Categories onCategoryClick={handleCategoryClick} />
        </aside>
      </div>
    </main>
  );
};

export default Blogs;