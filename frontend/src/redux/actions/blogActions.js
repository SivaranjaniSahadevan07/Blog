import axios from '../../api/axios';
import {
  // GET_ALL_BLOGS,
  GET_BLOGS,
  BLOGS_LOADING,
  SINGLE_BLOG_LOADING,
  SINGLE_BLOG_ERROR,
  GET_SINGLE_BLOG,
  GET_BLOGS_BY_USER,
  // GET_BLOGS_BY_CATEGORY,
  GET_BLOG_COMMENTS,
  CREATE_BLOG,
  DELETE_BLOG,
  LIKE_DISLIKE_BLOG,
  BLOG_ERROR,
} from '../../constants/actionTypes';

const getBlogFetchError = (error, fallback) => (
  error.response?.data?.message ||
  error.response?.data?.error ||
  (error.request
    ? 'The blog server is taking a little longer to wake up. The first visit can take up to a minute.'
    : fallback)
);

// Fetch all blogs
export const getAllBlogs = (page, limit) => async (dispatch) => {
  dispatch({ type: BLOGS_LOADING });
  try {
    const res = await axios.get(`/blogs?page=${page}&limit=${limit}`);
    dispatch({ type: GET_BLOGS, payload: res.data });
  } catch (error) {
    dispatch({ type: BLOG_ERROR, payload: getBlogFetchError(error, 'Failed to fetch blogs') });
  }
};

// Get a single blog by ID
export const getSingleBlog = (blogId) => async (dispatch) => {
  dispatch({ type: SINGLE_BLOG_LOADING });
  try {
    const res = await axios.get(`/blogs/${blogId}`);
    dispatch({
      type: GET_SINGLE_BLOG,
      payload: res.data,
    });
    return res.data;
  } catch (error) {
    const message = getBlogFetchError(error, 'Error fetching blog');
    dispatch({
      type: SINGLE_BLOG_ERROR,
      payload: message,
    });
    throw new Error(message);
  }
};

// Fetch blogs by category
export const getBlogsByUser = (userId, page, limit) => async (dispatch) => {
  dispatch({ type: BLOGS_LOADING });
  try {
    const res = await axios.get(`/blogs/user/${userId}?page=${page}&limit=${limit}`);
    // console.log(res.data)
    dispatch({ type: GET_BLOGS_BY_USER, payload: res.data });
  } catch (error) {
    dispatch({ type: BLOG_ERROR, payload: getBlogFetchError(error, 'Failed to fetch blogs by user') });
  }
};

// Fetch blogs by category
// export const getBlogsByCategory = (categoryId, page, limit) => async (dispatch) => {
//   try {
//     const res = await axios.get(`/blogs/category/${categoryId}?page=${page}&limit=${limit}`);
//     // console.log(res.data)
//     dispatch({ type: GET_BLOGS, payload: res.data });
//   } catch (error) {
//     dispatch({ type: BLOG_ERROR, payload: error.response?.data?.message || 'Failed to fetch blogs by category' });
//   }
// };

export const getBlogsByCategory = (categoryId, page, limit) => async (dispatch) => {
  dispatch({ type: BLOGS_LOADING });
  try {
    const res = await axios.get(`/blogs/category/${categoryId}?page=${page}&limit=${limit}`);
    dispatch({ type: GET_BLOGS, payload: res.data });
    return { payload: res.data }; // Return the response data
  } catch (error) {
    dispatch({ type: BLOG_ERROR, payload: getBlogFetchError(error, 'Failed to fetch blogs by category') });
    return { payload: { totalBlogs: 0 } }; // Return 0 blogs in case of an error
  }
};

// Get comments for a blog
export const getBlogComments = (blogId, page, limit) => async (dispatch, getState) => {
  try {
    const { auth } = getState();
    const res = await axios.get(`/blogs/${blogId}/comments?page=${page}&limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
      },
    });
    // console.log(res.data.comments)
    dispatch({
      type: GET_BLOG_COMMENTS,
      payload: res.data, // Contains the comments array
    });
    return res.data;
  } catch (error) {
    dispatch({
      type: BLOG_ERROR,
      payload: error.response?.data?.message || 'Error fetching blog comments',
    });
    return null;
  }
};

// Create a new blog
export const createBlog = (blogData) => async (dispatch, getState) => {
  // console.log(blogData)
  try {
    const { auth } = getState();
    const res = await axios.post('/blogs?uploadType=blog', blogData, {
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
      },
    });
    dispatch({
      type: CREATE_BLOG,
      payload: res.data,
    });
    return res.data;
  } catch (error) {
    const message = error.response?.data?.message ||
      error.response?.data?.error ||
      (error.request
        ? 'Could not reach the blog server. Check your connection and try again.'
        : 'Error creating blog');
    dispatch({
      type: BLOG_ERROR,
      payload: message,
    });
    throw new Error(message);
  }
};

// Delete a blog
export const deleteBlog = (blogId) => async (dispatch, getState) => {
  try {
    const { auth } = getState();
    await axios.delete(`blogs/${blogId}`, {
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
      },
    });
    dispatch({
      type: DELETE_BLOG,
      payload: blogId, // Pass the deleted blog ID
    });
  } catch (error) {
    dispatch({
      type: BLOG_ERROR,
      payload: error.response?.data?.message || 'Error deleting blog',
    });
  }
};

// Like or dislike a blog
// export const likeDislikeBlog = (blogId, actionType) => async (dispatch, getState) => {
//   try {
//     const { auth } = getState();
//     const endpoint = actionType === 'like' ? `/blogs/${blogId}/likes` : `/blogs/${blogId}/dislikes`;
//     const res = await axios.post(endpoint, {}, {
//       headers: {
//         Authorization: `Bearer ${auth.accessToken}`,
//       },
//     });
//     dispatch({
//       type: LIKE_DISLIKE_BLOG,
//       payload: { blogId, actionType, count: res.data }, // Contains updated like/dislike count
//     });
//   } catch (error) {
//     dispatch({
//       type: BLOG_ERROR,
//       payload: error.response?.data?.message || 'Error liking/disliking blog',
//     });
//   }
// };
export const likeDislikeBlog = (blogId, actionType) => async (dispatch, getState) => {
  try {
    const { auth } = getState();
    const res = await axios.post(
      `/blogs/${blogId}/like-dislike`,
      { action: actionType },
      {
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
        },
      }
    );
    dispatch({
      type: LIKE_DISLIKE_BLOG,
      payload: {
        blogId,
        likes: res.data.likes,
        dislikes: res.data.dislikes,
      },
    });
    return res.data;
  } catch (error) {
    const message = error.response?.data?.message || error.response?.data?.error || 'Error liking/disliking blog';
    dispatch({
      type: BLOG_ERROR,
      payload: message,
    });
    throw new Error(message);
  }
};

// Fetch admin blogs
export const getAdminBlogs = (page, limit) => async (dispatch) => {
  dispatch({ type: BLOGS_LOADING });
  try {
    const res = await axios.get(`/blogs/admin?page=${page}&limit=${limit}`);
    // console.log(res.data)
    dispatch({ type: GET_BLOGS, payload: res.data });
  } catch (error) {
    console.log(error)
    dispatch({ type: BLOG_ERROR, payload: getBlogFetchError(error, 'Failed to fetch admin blogs') });
  }
};

// Search blogs
export const searchBlogs = (query, page, limit) => async (dispatch) => {
  dispatch({ type: BLOGS_LOADING });
  try {
    const res = await axios.get(`/blogs/search?q=${query}&page=${page}&limit=${limit}`);
    dispatch({ type: GET_BLOGS, payload: res.data });
  } catch (error) {
    dispatch({ type: BLOG_ERROR, payload: getBlogFetchError(error, 'Failed to search blogs') });
  }
};