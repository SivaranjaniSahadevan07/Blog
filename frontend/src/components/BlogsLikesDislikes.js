import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { likeDislikeBlog } from '../redux/actions/blogActions';

const includesUser = (entries, userId) => (
  Array.isArray(entries) && entries.some((entry) => String(entry?._id || entry) === String(userId))
);

const countEntries = (entries) => (Array.isArray(entries) ? entries.length : Number(entries) || 0);

const BlogsLikesDislikes = ({ blog }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [likes, setLikes] = useState(countEntries(blog.likes));
  const [dislikes, setDislikes] = useState(countEntries(blog.dislikes));
  const [liked, setLiked] = useState(includesUser(blog.likes, user?._id));
  const [disliked, setDisliked] = useState(includesUser(blog.dislikes, user?._id));
  const [busyAction, setBusyAction] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setLikes(countEntries(blog.likes));
    setDislikes(countEntries(blog.dislikes));
    setLiked(includesUser(blog.likes, user?._id));
    setDisliked(includesUser(blog.dislikes, user?._id));
  }, [blog, user?._id]);

  const handleAction = async (actionType) => {
    setBusyAction(actionType);
    setError('');
    try {
      const result = await dispatch(likeDislikeBlog(blog._id, actionType));
      setLikes(Number(result.likes) || 0);
      setDislikes(Number(result.dislikes) || 0);
      setLiked(actionType === 'like');
      setDisliked(actionType === 'dislike');
    } catch (actionError) {
      setError(actionError.message || 'Your reaction could not be saved. Please try again.');
    } finally {
      setBusyAction('');
    }
  };

  const canReact = isAuthenticated && user?.role === 'reader' &&
    String(blog.author?._id || blog.author) !== String(user?._id);

  return (
    <section className="story-reactions" aria-label="Story reactions">
      <div className="reaction-summary">
        <span className="reaction-intro">Enjoyed this story?</span>
        <span className="reaction-total">{likes + dislikes} {likes + dislikes === 1 ? 'reaction' : 'reactions'}</span>
      </div>
      <div className="reaction-controls">
        <button
          className={`reaction-button ${liked ? 'is-active' : ''}`}
          type="button"
          onClick={() => handleAction('like')}
          disabled={!canReact || Boolean(busyAction)}
          aria-pressed={liked}
          title={canReact ? 'Like this story' : 'Sign in as a reader to react'}
        >
          <span aria-hidden="true">👍</span>
          <span>Like</span>
          <span className="reaction-count">{likes}</span>
        </button>
        <button
          className={`reaction-button ${disliked ? 'is-active is-dislike' : ''}`}
          type="button"
          onClick={() => handleAction('dislike')}
          disabled={!canReact || Boolean(busyAction)}
          aria-pressed={disliked}
          title={canReact ? 'Dislike this story' : 'Sign in as a reader to react'}
        >
          <span aria-hidden="true">👎</span>
          <span>Dislike</span>
          <span className="reaction-count">{dislikes}</span>
        </button>
        {!isAuthenticated && <span className="reaction-hint">Sign in as a reader to react.</span>}
        {isAuthenticated && user?.role !== 'reader' && <span className="reaction-hint">Reactions are available to readers.</span>}
        {isAuthenticated && String(blog.author?._id || blog.author) === String(user?._id) && (
          <span className="reaction-hint">You can’t react to your own story.</span>
        )}
      </div>
      {error && <p className="reaction-error" role="alert">{error}</p>}
    </section>
  );
};

export default BlogsLikesDislikes;
