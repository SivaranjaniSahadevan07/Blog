import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSingleBlog, getBlogComments } from '../redux/actions/blogActions';
import { useParams } from 'react-router-dom';
import Comments from '../components/Comments';
import CommentForm from '../components/CommentForm';
import BlogsLikesDislikes from '../components/BlogsLikesDislikes';

const BlogDetail = () => {
  const { blogId } = useParams();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { comments } = useSelector((state) => state.blogs);

  const [hasCommented, setHasCommented] = useState(false);
  const [serverWaking, setServerWaking] = useState(false);
  const [blog, setBlog] = useState(null);
  const [storyLoading, setStoryLoading] = useState(true);
  const [storyError, setStoryError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

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
    dispatch(getBlogComments(blogId)); // Fetch comments for the blog
    return () => {
      isCurrentRequest = false;
    };
  }, [dispatch, blogId, retryCount]);

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
            <BlogsLikesDislikes blogId={blogId} />
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