import {
  GET_PROFILE,
  UPDATE_PROFILE_PICTURE,
  UPDATE_USERNAME,
  UPDATE_EMAIL,
  UPDATE_PASSWORD,
  CREATE_USER,
  GET_ALL_USERS,
  UPDATE_USER_ROLE,
  DELETE_USER,
  BLOCK_UNBLOCK_USER,
  SAVE_BLOG,
  GET_SAVED_BLOGS,
  REMOVE_SAVED_BLOG,
  USER_ERROR,
} from '../../constants/actionTypes';

const initialState = {
  users: [],
  savedBlogs: [],
  postedBlogs: 0,
  loading: false,
  error: null,
  totalPages: 1,
  currentPage: 1,
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_PROFILE:
      return { ...state, user: action.payload.user, postedBlogs: action.payload.postedBlogs, error: null };
    case UPDATE_PROFILE_PICTURE:
    case UPDATE_USERNAME:
    case UPDATE_EMAIL:
    case UPDATE_PASSWORD:
      return { ...state, user: { ...state.user, ...action.payload }, error: null };
    case GET_ALL_USERS:
      return {
        ...state,
        loading: false,
        users: action.payload.users,
        totalPages: action.payload.totalPages,
        currentPage: action.payload.currentPage,
      };
    case UPDATE_USER_ROLE:
      return {
        ...state,
        users: state.users.map((user) =>
          user._id === action.payload._id ? action.payload : user
        ),
        userError: null,
      };
    case DELETE_USER:
      return {
        ...state,
        users: state.users.filter((user) => user._id !== action.payload),
        userError: null,
      };
    case CREATE_USER:
      return { ...state, users: [action.payload, ...state.users] };
    case BLOCK_UNBLOCK_USER:
      return {
        ...state,
        users: state.users.map((user) =>
          user._id === action.payload.user._id ? action.payload.user : user
        ),
      };
    case SAVE_BLOG:
      return {
        ...state,
        savedBlogs: [...state.savedBlogs, action.payload],
        userError: null,
      };
    case GET_SAVED_BLOGS:
      return {
        ...state,
        savedBlogs: action.payload,
        userError: null,
      };
    case REMOVE_SAVED_BLOG:
      return {
        ...state,
        savedBlogs: state.savedBlogs.filter((blog) => blog._id !== action.payload),
        userError: null,
      };
    case USER_ERROR:
      return {
        ...state,
        userError: action.payload,
      };
    default:
      return state;
  }
};

export default userReducer;