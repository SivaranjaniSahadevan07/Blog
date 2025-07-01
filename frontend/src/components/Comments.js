import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getBlogComments } from '../redux/actions/blogActions';
// import { likeDislikeComment, editComment, deleteComment } from '../redux/actions/commentActions';
import { editComment, deleteComment } from '../redux/actions/commentActions';
import moment from 'moment'; // Import moment.js for "time ago" formatting

const Comments = ({ blogId, blogAuthorId }) => {
  const dispatch = useDispatch();
  // const { comments, error } = useSelector((state) => state.blogs);
  const { comments, currentPage, totalPages, error } = useSelector((state) => state.blogs);
  const { user } = useSelector((state) => state.auth);
  const [page, setPage] = useState(1); // Current page for pagination
  const limit = 10; // Number of comments per page

  // console.log(comments)

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedContent, setEditedContent] = useState('');

  useEffect(() => {
    dispatch(getBlogComments(blogId, page, limit)); // Fetch comments for the blog
    // console.log(blogAuthorId)
    // console.log(user._id)
  }, [dispatch, blogId, user?._id, page]);

  // const handleLike = (commentId) => {
  //   dispatch(likeDislikeComment(commentId, 'like'));
  // };

  // const handleDislike = (commentId) => {
  //   dispatch(likeDislikeComment(commentId, 'dislike'));
  // };

  const handleEdit = (commentId, content) => {
    setEditingCommentId(commentId);
    setEditedContent(content);
  };

  const handleSaveEdit = async (commentId) => {
    await dispatch(editComment(commentId, { content: editedContent }));
    setEditingCommentId(null); // Exit edit mode
    setEditedContent('');
    dispatch(getBlogComments(blogId)); // Refresh comments after editing
  };

  const handleDelete = async (commentId) => {
    if (user.role !== "reader") {
      const reason = prompt('Enter the reason for deletion:');
      if (!reason) {
        alert('Deletion reason is required.');
        return;
      }
      await dispatch(deleteComment(commentId, reason));
    }
    await dispatch(deleteComment(commentId));
    dispatch(getBlogComments(blogId)); // Refresh comments after deleting
  }

  return (
    <div className="mt-4 pb-md-5 md-4">
      <h3>Comments</h3>
      {error && <p className="text-danger">Failed to load comments: {error}</p>}
      {Array.isArray(comments) && comments.length > 0 ? (
        <>
          <ul className="list-group">
            {comments.map((comment) => (
              <li className="list-group-item bg-secondary-subtle" key={comment._id}>
                <div className="d-flex justify-content-between">
                  <div>
                    <strong>{comment.author?.username || 'Unknown User'}</strong> ·{' '}
                    <span className="text-muted">{moment(comment.createdAt).fromNow()}</span> {/* Time ago */}
                  </div>
                  {/* <div>
                  <button
                    className="btn btn-sm btn-outline-success me-2"
                    onClick={() => handleLike(comment._id)}
                  >
                    👍 {comment.likes || 0}
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDislike(comment._id)}
                  >
                    👎 {comment.dislikes || 0}
                  </button>
                </div> */}
                </div>

                {/* Edit Mode */}
                {editingCommentId === comment._id ? (
                  <div className="mt-2">
                    <textarea
                      className="form-control"
                      rows="2"
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                    ></textarea>
                    <button
                      className="btn btn-sm btn-success mt-2"
                      onClick={() => handleSaveEdit(comment._id)}
                    >
                      Save
                    </button>
                    <button
                      className="btn btn-sm btn-secondary mt-2 ms-2"
                      onClick={() => setEditingCommentId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <p className="mt-2">{comment.content || 'No content available'}</p>
                )}

                {/* Actions */}
                {editingCommentId === null && (<div className="mt-2">
                  {user && user._id === comment.author._id && (
                    <button
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => handleEdit(comment._id, comment.content)}
                    >
                      Edit
                    </button>
                  )}
                  {(user && (user._id === comment.author._id || user._id === blogAuthorId || user.role === 'admin')) && (
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(comment._id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
                )}
              </li>
            ))}
          </ul>
          {/* Pagination */}
          <div className="d-flex justify-content-between">
            <button
              className="btn btn-secondary"
              disabled={page === 1}
              onClick={() => setPage((prev) => prev - 1)}
            >
              Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button
              className="btn btn-secondary"
              disabled={page === totalPages}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Next
            </button>
          </div>
        </>
      ) : (
        user?.role === "reader" ? <p>No comments yet. Be the first to comment!</p> : <p>No comments yet.</p>
      )}
    </div>
  );
};

export default Comments;