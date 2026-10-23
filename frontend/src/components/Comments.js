import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getBlogComments } from '../redux/actions/blogActions';
import { editComment, deleteComment } from '../redux/actions/commentActions';
import moment from 'moment';

const COMMENTS_PER_PAGE = 10;

const Comments = ({ blogId, blogAuthorId }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { comments: storedComments } = useSelector((state) => state.blogs);
  const comments = Array.isArray(storedComments) ? storedComments : [];
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedContent, setEditedContent] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    let isCurrentRequest = true;
    setLoading(true);
    setError('');
    dispatch(getBlogComments(blogId, page, COMMENTS_PER_PAGE))
      .then((result) => {
        if (!isCurrentRequest) return;
        if (!Array.isArray(result)) setError('Comments could not be loaded. Please try again.');
      })
      .catch(() => {
        if (isCurrentRequest) setError('Comments could not be loaded. Please try again.');
      })
      .finally(() => {
        if (isCurrentRequest) setLoading(false);
      });
    return () => {
      isCurrentRequest = false;
    };
  }, [dispatch, blogId, page]);

  const refreshComments = async () => {
    await dispatch(getBlogComments(blogId, page, COMMENTS_PER_PAGE));
  };

  const handleSaveEdit = async (commentId) => {
    const content = editedContent.trim();
    if (!content || savingEdit) return;
    setSavingEdit(true);
    setError('');
    try {
      const result = await dispatch(editComment(commentId, { content }));
      if (!result?.comment) {
        setError(result?.error || 'Your comment could not be updated. Please try again.');
        return;
      }
      setEditingCommentId(null);
      setEditedContent('');
      await refreshComments();
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (commentId) => {
    const isModerator = user?.role && user.role !== 'reader';
    const reason = isModerator ? window.prompt('Enter the reason for deletion:') : undefined;
    if (isModerator && !reason?.trim()) return;
    if (!window.confirm('Delete this comment?')) return;
    await dispatch(deleteComment(commentId, reason));
    await refreshComments();
  };

  return (
    <section className="comments-section" aria-labelledby="comments-heading">
      <div className="comments-heading">
        <div>
          <span className="eyebrow">COMMUNITY</span>
          <h2 id="comments-heading">The conversation</h2>
        </div>
        {!loading && <span className="comments-count">{comments.length} {comments.length === 1 ? 'comment' : 'comments'}</span>}
      </div>

      {error && <div className="comments-alert" role="alert">{error}</div>}
      {loading ? (
        <div className="comments-loading" role="status">
          <span className="loading-spinner" aria-hidden="true" />
          <span>Loading the conversation…</span>
        </div>
      ) : comments.length > 0 ? (
        <div className="comments-list">
          {comments.map((comment) => {
            const authorId = comment.author?._id;
            const canEdit = user?._id && String(user._id) === String(authorId);
            const canDelete = canEdit || (user?._id && String(user._id) === String(blogAuthorId)) || user?.role === 'admin';
            return (
              <article className="comment-card" key={comment._id}>
                <div className="comment-avatar" aria-hidden="true">
                  {(comment.author?.username || 'U').slice(0, 1).toUpperCase()}
                </div>
                <div className="comment-main">
                  <div className="comment-meta">
                    <strong>{comment.author?.username || 'Unknown reader'}</strong>
                    <time dateTime={comment.createdAt}>{moment(comment.createdAt).fromNow()}</time>
                  </div>
                  {editingCommentId === comment._id ? (
                    <div className="comment-edit">
                      <textarea
                        className="form-control"
                        rows={3}
                        value={editedContent}
                        maxLength={2000}
                        onChange={(event) => setEditedContent(event.target.value)}
                        aria-label="Edit comment"
                      />
                      <div className="comment-edit-count">{editedContent.length}/2000</div>
                      <div className="comment-actions">
                        <button className="comment-action-primary" type="button" onClick={() => handleSaveEdit(comment._id)} disabled={!editedContent.trim() || savingEdit}>
                          {savingEdit ? 'Saving…' : 'Save changes'}
                        </button>
                        <button className="comment-action" type="button" onClick={() => setEditingCommentId(null)} disabled={savingEdit}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <p className="comment-content">{comment.content || 'No content available'}</p>
                  )}
                  {editingCommentId !== comment._id && (canEdit || canDelete) && (
                    <div className="comment-actions">
                      {canEdit && (
                        <button
                          className="comment-action"
                          type="button"
                          onClick={() => {
                            setEditingCommentId(comment._id);
                            setEditedContent(comment.content || '');
                          }}
                        >
                          Edit
                        </button>
                      )}
                      {canDelete && (
                        <button className="comment-action comment-action-danger" type="button" onClick={() => handleDelete(comment._id)}>
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="comments-empty">
          <span aria-hidden="true">✳</span>
          <h3>No comments yet</h3>
          <p>{user?.role === 'reader' ? 'Start the conversation with a thoughtful comment.' : 'Be the first to join the conversation.'}</p>
        </div>
      )}

      {!loading && (page > 1 || comments.length === COMMENTS_PER_PAGE) && (
        <nav className="comments-pagination" aria-label="Comments pages">
          <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1}>
            ← Newer
          </button>
          <span>Page {page}</span>
          <button type="button" onClick={() => setPage((current) => current + 1)} disabled={comments.length < COMMENTS_PER_PAGE}>
            Older →
          </button>
        </nav>
      )}
    </section>
  );
};

export default Comments;
