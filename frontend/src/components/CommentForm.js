import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addComment } from '../redux/actions/commentActions';
import { getBlogComments } from '../redux/actions/blogActions';

const CommentForm = ({ blogId }) => {
  const dispatch = useDispatch();
  const { error } = useSelector((state) => state.comments);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddComment = async (event) => {
    event.preventDefault();
    const content = commentText.trim();
    if (!content || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const comment = await dispatch(addComment(blogId, { content }));
      if (comment) {
        setCommentText('');
        await dispatch(getBlogComments(blogId, 1, 10));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="comment-compose" aria-labelledby="comment-compose-heading">
      <div className="comment-compose-heading">
        <span className="eyebrow">HAVE A THOUGHT?</span>
        <h2 id="comment-compose-heading">Join the conversation</h2>
        <p>Keep it kind, thoughtful, and on topic.</p>
      </div>
      {error && <p className="comments-alert" role="alert">{error}</p>}
      <form onSubmit={handleAddComment}>
        <label className="visually-hidden" htmlFor="comment-content">Your comment</label>
        <textarea
          id="comment-content"
          className="form-control"
          rows={4}
          placeholder="Share what you think about this story..."
          value={commentText}
          onChange={(event) => setCommentText(event.target.value)}
          maxLength={2000}
          required
        />
        <div className="comment-compose-footer">
          <span>{commentText.length}/2000</span>
          <button className="comment-action-primary" type="submit" disabled={!commentText.trim() || isSubmitting}>
            {isSubmitting ? 'Posting…' : 'Post comment'}
            {!isSubmitting && <span aria-hidden="true">→</span>}
          </button>
        </div>
      </form>
    </section>
  );
};

export default CommentForm;
