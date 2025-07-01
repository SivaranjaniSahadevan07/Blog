import {
  // GET_ALL_BLOGS,
  GET_BLOGS_BY_USER,
  GET_BLOGS,
  GET_SINGLE_BLOG,
  // GET_BLOGS_BY_CATEGORY,
  GET_BLOG_COMMENTS,
  CREATE_BLOG,
  DELETE_BLOG,
  LIKE_DISLIKE_BLOG,
  BLOG_ERROR,
} from '../../constants/actionTypes';

const initialState = {
  blogs: [],
  blog: null,
  comments: [],
  totalBlogs: 0,
  currentPage: 1,
  totalPages: 1,
  error: null,
};

const blogReducer = (state = initialState, action) => {
  switch (action.type) {
    // case GET_ALL_BLOGS:
    case GET_BLOGS: // Reuse GET_BLOGS for all filtered blog fetches
      return {
        ...state,
        blogs: action.payload.blogs,
        totalBlogs: action.payload.totalBlogs,
        currentPage: action.payload.currentPage,
        totalPages: action.payload.totalPages,
        error: null,
      };
    case GET_SINGLE_BLOG:
      return {
        ...state,
        blog: action.payload,
        error: null,
      };
    case GET_BLOGS_BY_USER:
      return {
        ...state,
        blogs: action.payload.blogs,
        totalBlogs: action.payload.totalBlogs,
        currentPage: action.payload.currentPage,
        totalPages: action.payload.totalPages,
        error: null,
      };
    // case GET_BLOGS_BY_CATEGORY:
    //   return {
    //     ...state,
    //     blogs: action.payload.blogs,
    //     totalBlogs: action.payload.totalBlogs,
    //     currentPage: action.payload.currentPage,
    //     totalPages: action.payload.totalPages,
    //     error: null,
    //   };
    case GET_BLOG_COMMENTS:
      return {
        ...state,
        comments: action.payload,
        error: null,
      };
    case CREATE_BLOG:
      return {
        ...state,
        blogs: [action.payload, ...state.blogs], // Add the new blog to the list
        error: null,
      };
    case DELETE_BLOG:
      return {
        ...state,
        blogs: state.blogs.filter((blog) => blog._id !== action.payload), // Remove the deleted blog
        error: null,
      };
    // case LIKE_DISLIKE_BLOG:
    //   return {
    //     ...state,
    //     blogs: state.blogs.map((blog) =>
    //       blog._id === action.payload.blogId
    //         ? {
    //           ...blog,
    //           likes: action.payload.actionType === 'like' ? action.payload.count.likes : blog.likes,
    //           dislikes: action.payload.actionType === 'dislike' ? action.payload.count.dislikes : blog.dislikes,
    //         }
    //         : blog
    //     ),
    //     error: null,
    //   };
    case LIKE_DISLIKE_BLOG:
      return {
        ...state,
        blogs: state.blogs.map((blog) =>
          blog._id === action.payload.blogId
            ? {
              ...blog,
              likes: action.payload.likes,
              dislikes: action.payload.dislikes,
            }
            : blog
        ),
        error: null,
      };
    case BLOG_ERROR:
      return {
        ...state,
        error: action.payload,
      };
    default:
      return state;
  }
};

export default blogReducer;