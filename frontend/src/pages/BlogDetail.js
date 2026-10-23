import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSingleBlog } from '../redux/actions/blogActions';
import { useParams } from 'react-router-dom';
import Comments from '../components/Comments';
import CommentForm from '../components/CommentForm';
import BlogsLikesDislikes from '../components/BlogsLikesDislikes';
import { getSavedBlogs, removeSavedBlog, saveBlog } from '../redux/actions/userActions';

const BlogDetail = () => {
  const { blogId } = useParams();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { comments } = useSelector((state) => state.blogs);
  const { savedBlogs } = useSelector((state) => state.users);

  const [hasCommented, setHasCommented] = useState(false);
  const [serverWaking, setServerWaking] = useState(false);
  const [blog, setBlog] = useState(null);
  const [storyLoading, setStoryLoading] = useState(true);
  const [storyError, setStoryError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [savingStory, setSavingStory] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    let isCurrentRequest = true;
    setBlog(null);
    setStoryError(null);
    setStoryLoading(true);
    dispatch(getSingleBlog(blogId))
      .then((story) => {
        if (isCurrentRequest) setBlog(story);
      })
      .catch((error) => {
        if (isCurrentRequest) setStoryError(error.message || 'Error fetching blog');
      })
      .finally(() => {
        if (isCurrentRequest) setStoryLoading(false);
      });
    return () => {
      isCurrentRequest = false;
    };
  }, [dispatch, blogId, retryCount]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'reader') {
      dispatch(getSavedBlogs());
    }
  }, [dispatch, blogId, isAuthenticated, user?.role]);

  useEffect(() => {
    if (!storyLoading) {
      setServerWaking(false);
      return undefined;
    }

    const timer = window.setTimeout(() => setServerWaking(true), 1500);
    return () => window.clearTimeout(timer);
  }, [storyLoading]);

  useEffect(() => {
    if (comments && user) {
      // Check if the current user has already commented
      const userComment = comments.find((comment) => comment.author?._id === user._id);
      setHasCommented(!!userComment); // Set to true if the user has commented
    }
  }, [comments, user]);

  const isStorySaved = Array.isArray(savedBlogs) &&
    savedBlogs.some((savedBlog) => String(savedBlog?._id || savedBlog) === String(blogId));

  const handleSaveToggle = async () => {
    if (!blog || savingStory) return;
    setSavingStory(true);
    setSaveError('');
    const result = isStorySaved
      ? await dispatch(removeSavedBlog(blogId))
      : await dispatch(saveBlog(blogId, blog));
    if (!result?.success) {
      setSaveError(result?.error || 'Could not update your reading list. Please try again.');
    }
    setSavingStory(false);
  };

  return (
    <main className="blog-detail-page">
      {storyError && !storyLoading && <div className="connection-notice mb-3" role="status"><span className="connection-icon" aria-hidden="true">↻</span><div><strong>{storyError.includes('wake up') ? 'The blog server is waking up' : 'We couldn’t load this story'}</strong><p>{storyError}</p>{storyError.includes('wake up') && <p className="connection-hint">You’re still connected. The first visit can take up to a minute.</p>}<button className="text-button" type="button" onClick={() => setRetryCount((count) => count + 1)}>Try again</button></div></div>}
      {storyLoading ? (
        <div className="loading-panel" role="status" aria-live="polite">
          <span className="loading-spinner" aria-hidden="true" />
          <div>
            <strong>{serverWaking ? 'The blog server is waking up…' : 'Loading your story…'}</strong>
            <p>{serverWaking
              ? 'The first visit can take up to a minute. Your story is on its way.'
              : 'Getting your story ready.'}</p>
          </div>
        </div>
      ) : blog ? (
        <>
          <article className="blog-detail-article">
            <span className="eyebrow">From the journal</span>
            <h1>{blog.title}</h1>
            <p className="blog-byline">
              By <i>{blog.author?.username || "Unknown author"}</i>
              {blog.createdAt && ` · ${blog.createdAt.split("T")[0].split("-").reverse().join("-")}`}
            </p>
            {isAuthenticated && user?.role === 'reader' && (
              <div className="story-save-detail">
                <button
                  className={`story-save-detail-button ${isStorySaved ? 'is-saved' : ''}`}
                  type="button"
                  onClick={handleSaveToggle}
                  disabled={savingStory}
                  aria-pressed={isStorySaved}
                >
                  <span aria-hidden="true">{isStorySaved ? '✓' : '♡'}</span>
                  {savingStory ? 'Updating…' : isStorySaved ? 'Saved to your reading list' : 'Save for later'}
                </button>
                {saveError && <span className="story-save-detail-error" role="alert">{saveError}</span>}
              </div>
            )}
            <BlogsLikesDislikes blog={blog} />
            {blog.categories?.length > 0 && (
              <p className="blog-categories">Topics: {blog.categories.map((cat) => <span key={cat._id}>{cat.name} </span>)}</p>
            )}
            {blog.image && <img src={blog.image} alt={blog.title} className="blog-cover" />}
            <p className="blog-body">{blog.content}</p>
          </article>
          <hr />

          {isAuthenticated && user?.role === 'reader' && !hasCommented && blog.author?._id && (
            <div>
              <CommentForm blogId={blog._id} blogAuthorId={blog.author._id} />
            </div>)
          }

          <div>
            <Comments blogId={blog._id} blogAuthorId={blog.author?._id} />
          </div>
        </>
      ) : !storyError ? (
        <div className="empty-state"><h3>Story not found</h3><p>This story may have been moved or is no longer available.</p></div>
      ) : null}
    </main>
  );
};

export default BlogDetail;