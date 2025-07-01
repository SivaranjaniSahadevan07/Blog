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
  const { blog, comments, error } = useSelector((state) => state.blogs);

  const [hasCommented, setHasCommented] = useState(false);

  useEffect(() => {
    dispatch(getSingleBlog(blogId));
    dispatch(getBlogComments(blogId)); // Fetch comments for the blog
  }, [dispatch, blogId]);

  useEffect(() => {
    if (comments && user) {
      // Check if the current user has already commented
      const userComment = comments.find((comment) => comment.author._id === user._id);
      console.log(userComment)
      console.log(!!userComment)
      setHasCommented(!!userComment); // Set to true if the user has commented
    }
  }, [comments, user]);

  return (
    <div className="container-fluid p-md-5 bg-dark-subtle p-3">
      {error && <p className="text-danger">{error}</p>}
      {blog ? (
        <>
          <div className='bg-light-subtle p-md-5 p-3'>
            <h3>{blog.title}</h3>
            <p className="text-muted">By <i>{blog.author.username}</i> on {blog.createdAt.split("T")[0].split("-").reverse().join('-')}</p>
            <BlogsLikesDislikes blogId={blogId} />
            <p className="text-muted">Categories: {blog.categories.map(cat => <span>{cat.name}, </span>)}</p>
            {blog.image && <img src={blog.image} alt={blog.title} className="img-fluid pb-3" />}
            <p className='text-justify'>{blog.content}</p>
          </div>
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
        <p>Loading blog details...</p>
      )}
    </div>
  );
};

export default BlogDetail;