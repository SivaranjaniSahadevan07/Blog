import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSingleBlog, likeDislikeBlog } from '../redux/actions/blogActions';

const BlogsLikesDislikes = ({ blogId }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { blog, error } = useSelector((state) => state.blogs);

  useEffect(() => {
    dispatch(getSingleBlog(blogId)); // Fetch the blog data initially
  }, [dispatch, blogId]);

  const handleAction = async (actionType) => {
    await dispatch(likeDislikeBlog(blogId, actionType)); // Dispatch like/dislike action
    dispatch(getSingleBlog(blogId)); // Refresh the blog data after the action
  };

  const hasLiked = blog?.likes?.includes(user?._id); // Check if the user has liked the post

  return (
    <div className="d-flex flex-column align-items-start my-3">
      <h5 className="mb-3">Blog Actions</h5>
      {blog && blog._id === blogId ? (
        <div className="d-flex align-items-center gap-3">
          <div>
            <p className="mb-1">
              <strong>Likes:</strong> {blog.likes?.length || 0}
            </p>
            <p className="mb-1">
              <strong>Dislikes:</strong> {blog.dislikes?.length || 0}
            </p>
            {isAuthenticated && hasLiked && (
              <p className="text-success mb-1">You have liked this post.</p>
            )}
          </div>
          {isAuthenticated && user.role === 'reader' && (
            <div>
              <button
                className={`btn btn-sm me-2 ${hasLiked ? 'btn-secondary' : 'btn-success'}`}
                onClick={() => handleAction('like')}
                disabled={hasLiked} // Disable the button if the user has already liked
              >
                {hasLiked ? 'Liked' : 'Like'}
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleAction('dislike')}
              >
                Dislike
              </button>
            </div>
          )}
        </div>
      ) : (
        <p className="text-muted">Loading like/dislike data...</p>
      )}
      {error && <p className="text-danger mt-2">{error}</p>}
    </div>
  );
};

export default BlogsLikesDislikes;