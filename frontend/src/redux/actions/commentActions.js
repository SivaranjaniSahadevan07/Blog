import axios from '../../api/axios';
import {
  ADD_COMMENT,
  EDIT_COMMENT,
  DELETE_COMMENT,
  REPLY_TO_COMMENT,
  LIKE_DISLIKE_COMMENT,
  GET_COMMENT_LIKES,
  GET_COMMENT_DISLIKES,
  COMMENT_ERROR,
} from '../../constants/actionTypes';

// Add a comment
export const addComment = (blogId, commentData) => async (dispatch, getState) => {
  try {
    const { auth } = getState();
    const res = await axios.post(`/comments/${blogId}`, commentData, {
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
      },
    });
    // console.log(res.data.comment)
    dispatch({
      type: ADD_COMMENT,
      payload: res.data.comment, // Contains the added comment
    });
  } catch (error) {
    dispatch({
      type: COMMENT_ERROR,
      payload: error.response?.data?.message || 'Error adding comment',
    });
  }
};

// Edit a comment
export const editComment = (commentId, updatedComment) => async (dispatch, getState) => {
  try {
    const { auth } = getState();
    const res = await axios.patch(`/comments/${commentId}`, updatedComment, {
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
      },
    });
    dispatch({
      type: EDIT_COMMENT,
      payload: res.data, // Contains the updated comment
    });
  } catch (error) {
    dispatch({
      type: COMMENT_ERROR,
      payload: error.response?.data?.message || 'Error editing comment',
    });
  }
};

// Soft delete a comment
export const deleteComment = (commentId, reason) => async (dispatch, getState) => {
  try {
    const { auth } = getState();
    await axios.delete(`/comments/${commentId}`, {
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
      },
      data: { reason },
    });
    dispatch({
      type: DELETE_COMMENT,
      payload: commentId, // Pass the deleted comment ID
    });
  } catch (error) {
    dispatch({
      type: COMMENT_ERROR,
      payload: error.response?.data?.message || 'Error deleting comment',
    });
  }
};

// Reply to a comment
export const replyToComment = (commentId, replyData) => async (dispatch, getState) => {
  try {
    const { auth } = getState();
    const res = await axios.post(`/comments/reply/${commentId}`, replyData, {
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
      },
    });
    dispatch({
      type: REPLY_TO_COMMENT,
      payload: res.data, // Contains the reply
    });
  } catch (error) {
    dispatch({
      type: COMMENT_ERROR,
      payload: error.response?.data?.message || 'Error replying to comment',
    });
  }
};

// Like or dislike a comment
export const likeDislikeComment = (commentId, actionType) => async (dispatch, getState) => {
  try {
    const { auth } = getState();
    const endpoint = actionType === 'like' ? `/comments/${commentId}/likes` : `/comments/${commentId}/dislikes`;
    const res = await axios.post(endpoint, {}, {
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
      },
    });
    dispatch({
      type: LIKE_DISLIKE_COMMENT,
      payload: { commentId, actionType, count: res.data }, // Contains updated like/dislike count
    });
  } catch (error) {
    dispatch({
      type: COMMENT_ERROR,
      payload: error.response?.data?.message || 'Error liking/disliking comment',
    });
  }
};

// Get likes for a comment
export const getCommentLikes = (commentId) => async (dispatch) => {
  try {
    const res = await axios.post(`/comments/${commentId}/likes`);
    dispatch({
      type: GET_COMMENT_LIKES,
      payload: { commentId, likes: res.data.likes },
    });
  } catch (error) {
    dispatch({
      type: COMMENT_ERROR,
      payload: error.response?.data?.message || 'Error fetching comment likes',
    });
  }
};

// Get dislikes for a comment
export const getCommentDislikes = (commentId) => async (dispatch) => {
  try {
    const res = await axios.post(`/comments/${commentId}/dislikes`);
    dispatch({
      type: GET_COMMENT_DISLIKES,
      payload: { commentId, dislikes: res.data.dislikes },
    });
  } catch (error) {
    dispatch({
      type: COMMENT_ERROR,
      payload: error.response?.data?.message || 'Error fetching comment dislikes',
    });
  }
};