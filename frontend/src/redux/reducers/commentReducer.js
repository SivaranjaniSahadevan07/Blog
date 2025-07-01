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
  
  const initialState = {
    comments: [],
    error: null,
  };
  
  const commentReducer = (state = initialState, action) => {
    switch (action.type) {
      case ADD_COMMENT:
        return {
          ...state,
          comments: [...state.comments, action.payload],
          error: null,
        };
      case EDIT_COMMENT:
        return {
          ...state,
          comments: state.comments.map((comment) =>
            comment._id === action.payload._id ? action.payload : comment
          ),
          error: null,
        };
      case DELETE_COMMENT:
        return {
          ...state,
          comments: state.comments.filter((comment) => comment._id !== action.payload),
          error: null,
        };
      case REPLY_TO_COMMENT:
        return {
          ...state,
          comments: [...state.comments, action.payload],
          error: null,
        };
      case LIKE_DISLIKE_COMMENT:
        return {
          ...state,
          comments: state.comments.map((comment) =>
            comment._id === action.payload.commentId
              ? {
                  ...comment,
                  likes: action.payload.actionType === 'like' ? action.payload.count.likes : comment.likes,
                  dislikes: action.payload.actionType === 'dislike' ? action.payload.count.dislikes : comment.dislikes,
                }
              : comment
          ),
          error: null,
        };
      case GET_COMMENT_LIKES:
        return {
          ...state,
          comments: state.comments.map((comment) =>
            comment._id === action.payload.commentId
              ? { ...comment, likes: action.payload.likes }
              : comment
          ),
          error: null,
        };
      case GET_COMMENT_DISLIKES:
        return {
          ...state,
          comments: state.comments.map((comment) =>
            comment._id === action.payload.commentId
              ? { ...comment, dislikes: action.payload.dislikes }
              : comment
          ),
          error: null,
        };
      case COMMENT_ERROR:
        return {
          ...state,
          error: action.payload,
        };
      default:
        return state;
    }
  };
  
  export default commentReducer;