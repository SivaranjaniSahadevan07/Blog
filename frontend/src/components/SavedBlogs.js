import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { getSavedBlogs, removeSavedBlog } from '../redux/actions/userActions';

const SavedBlogs = () => {
  const dispatch = useDispatch();
  const { savedBlogs: storedBlogs } = useSelector((state) => state.users);
  const savedBlogs = useMemo(
    () => (Array.isArray(storedBlogs) ? storedBlogs.filter(Boolean) : []),
    [storedBlogs]
  );
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const loadSavedBlogs = useCallback(async () => {
    setLoading(true);
    setError('');
    const result = await dispatch(getSavedBlogs());
    if (result === null) setError('Your saved stories could not be loaded. Please try again.');
    setLoading(false);
  }, [dispatch]);

  useEffect(() => {
    loadSavedBlogs();
  }, [loadSavedBlogs]);

  const filteredBlogs = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return savedBlogs;
    return savedBlogs.filter((blog) => (
      blog.title?.toLowerCase().includes(query) ||
      blog.content?.toLowerCase().includes(query) ||
      blog.author?.username?.toLowerCase().includes(query)
    ));
  }, [savedBlogs, search]);

  const handleRemove = async (blogId) => {
    if (removingId) return;
    setRemovingId(blogId);
    setError('');
    const result = await dispatch(removeSavedBlog(blogId));
    if (!result?.success) setError(result?.error || 'This story could not be removed. Please try again.');
    setRemovingId(null);
  };

  return (
    <main className="saved-page">
      <div className="saved-shell">
        <header className="saved-heading">
          <div>
            <span className="eyebrow">YOUR PERSONAL COLLECTION</span>
            <h1>Stories to come back to.</h1>
            <p>Keep your favorite reads close, all in one place.</p>
          </div>
          <div className="saved-total">
            <strong>{savedBlogs.length}</strong>
            <span>{savedBlogs.length === 1 ? 'saved story' : 'saved stories'}</span>
          </div>
        </header>

        <div className="saved-toolbar">
          <label className="visually-hidden" htmlFor="saved-search">Search saved stories</label>
          <input
            id="saved-search"
            type="search"
            className="form-control"
            placeholder="Search your saved stories..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <span>Reading list</span>
        </div>

        {error && (
          <p className="saved-error" role="alert">
            {error} <button type="button" onClick={loadSavedBlogs}>Try again</button>
          </p>
        )}

        {loading ? (
          <div className="saved-empty-state" role="status">
            <span className="loading-spinner" aria-hidden="true" />
            <p>Gathering your saved stories…</p>
          </div>
        ) : filteredBlogs.length ? (
          <section className="saved-grid" aria-label="Saved stories">
            {filteredBlogs.map((blog) => (
              <article className="saved-story-card" key={blog._id}>
                {blog.image ? (
                  <Link to={`/blog/${blog._id}`} className="saved-story-image-link" aria-label={`Read ${blog.title || 'story'}`}>
                    <img src={blog.image} alt="" className="saved-story-image" loading="lazy" />
                  </Link>
                ) : (
                  <Link to={`/blog/${blog._id}`} className="saved-story-placeholder" aria-label={`Read ${blog.title || 'story'}`}>✳</Link>
                )}
                <div className="saved-story-content">
                  <div className="saved-story-meta">
                    <span>Saved for later</span>
                    {blog.createdAt && <time dateTime={blog.createdAt}>{moment(blog.createdAt).format('MMM D, YYYY')}</time>}
                  </div>
                  <h2><Link to={`/blog/${blog._id}`}>{blog.title || 'Untitled story'}</Link></h2>
                  <p>{blog.content ? `${blog.content.slice(0, 150)}${blog.content.length > 150 ? '…' : ''}` : 'Open this story to continue reading.'}</p>
                  {blog.author?.username && <span className="saved-story-author">By {blog.author.username}</span>}
                  <div className="saved-story-actions">
                    <Link to={`/blog/${blog._id}`} className="saved-read-link">Read story <span aria-hidden="true">→</span></Link>
                    <button
                      className="saved-remove-button"
                      type="button"
                      onClick={() => handleRemove(blog._id)}
                      disabled={Boolean(removingId)}
                    >
                      {removingId === blog._id ? 'Removing…' : 'Remove'}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="saved-empty-state">
            <span aria-hidden="true">♡</span>
            <h2>{savedBlogs.length ? 'No matching stories' : 'Your reading list is ready'}</h2>
            <p>{savedBlogs.length
              ? 'Try a different search term.'
              : 'Save a story from the journal and it will be waiting for you here.'}</p>
            {!savedBlogs.length && <Link className="saved-browse-link" to="/">Explore stories <span aria-hidden="true">→</span></Link>}
          </section>
        )}
      </div>
    </main>
  );
};

export default SavedBlogs;
