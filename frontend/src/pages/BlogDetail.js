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
  const { blog, comments, singleBlogLoading, singleBlogError } = useSelector((state) => state.blogs);

  const [hasCommented, setHasCommented] = useState(false);
  const [serverWaking, setServerWaking] = useState(false);

  useEffect(() => {
    dispatch(getSingleBlog(blogId));
    dispatch(getBlogComments(blogId)); // Fetch comments for the blog
  }, [dispatch, blogId]);

  useEffect(() => {
    if (!singleBlogLoading) {
      setServerWaking(false);
      return undefined;
    }

    const timer = window.setTimeout(() => setServerWaking(true), 1500);
    return () => window.clearTimeout(timer);
  }, [singleBlogLoading]);

  useEffect(() => {
    if (comments && user) {
      // Check if the current user has already commented
      const userComment = comments.find((comment) => comment.author._id === user._id);
      setHasCommented(!!userComment); // Set to true if the user has commented
    }
  }, [comments, user]);

  return (
    <main className="blog-detail-page">
      {singleBlogError && !singleBlogLoading && <div className="connection-notice mb-3" role="status"><span className="connection-icon" aria-hidden="true">↻</span><div><strong>{singleBlogError.includes('wake up') ? 'The blog server is waking up' : 'We couldn’t load this story'}</strong><p>{singleBlogError}</p>{singleBlogError.includes('wake up') && <p className="connection-hint">You’re still connected. The first visit can take up to a minute.</p>}<button className="text-button" type="button" onClick={() => dispatch(getSingleBlog(blogId))}>Try again</button></div></div>}
      {singleBlogLoading ? (
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
            <p className="blog-byline">By <i>{blog.author.username}</i> · {blog.createdAt.split("T")[0].split("-").reverse().join('-')}</p>
            <BlogsLikesDislikes blogId={blogId} />
            <p className="blog-categories">Topics: {blog.categories.map((cat) => <span key={cat._id}>{cat.name} </span>)}</p>
            {blog.image && <img src={blog.image} alt={blog.title} className="blog-cover" />}
            <p className="blog-body">{blog.content}</p>
          </article>
          <hr />

          {isAuthenticated && user.role === 'reader' && !hasCommented && (
            <div>
              <CommentForm blogId={blog._id} blogAuthorId={blog.author._id} />
            </div>)
          }

          <div>
            <Comments blogId={blog._id} blogAuthorId={blog.author._id} />
          </div>
        </>
      ) : (
        <div className="empty-state"><h3>Story not found</h3><p>This story may have been moved or is no longer available.</p></div>
      )}
    </main>
  );
};

export default BlogDetail;