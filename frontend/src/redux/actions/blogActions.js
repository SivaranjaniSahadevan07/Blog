import axios from '../../api/axios';
import {
  // GET_ALL_BLOGS,
  GET_BLOGS,
  GET_SINGLE_BLOG,
  GET_BLOGS_BY_USER,
  // GET_BLOGS_BY_CATEGORY,
  GET_BLOG_COMMENTS,
  CREATE_BLOG,
  DELETE_BLOG,
  LIKE_DISLIKE_BLOG,
  BLOG_ERROR,
} from '../../constants/actionTypes';

// Fetch all blogs
export const getAllBlogs = (page, limit) => async (dispatch) => {
  try {
    const res = await axios.get(`/blogs?page=${page}&limit=${limit}`);
    dispatch({ type: GET_BLOGS, payload: res.data });
  } catch (error) {
    dispatch({ type: BLOG_ERROR, payload: error.response?.data?.message || 'Failed to fetch blogs' });
  }
};

// Get a single blog by ID
export const getSingleBlog = (blogId) => async (dispatch) => {
  try {
    const res = await axios.get(`/blogs/${blogId}`);
    dispatch({
      type: GET_SINGLE_BLOG,
      payload: res.data, // Contains the blog details
    });
  } catch (error) {
    dispatch({
      type: BLOG_ERROR,
      payload: error.response?.data?.message || 'Error fetching blog',
    });
  }
};

// Fetch blogs by category
export const getBlogsByUser = (userId, page, limit) => async (dispatch) => {
  try {
    const res = await axios.get(`/blogs/user/${userId}?page=${page}&limit=${limit}`);
    // console.log(res.data)
    dispatch({ type: GET_BLOGS_BY_USER, payload: res.data });
  } catch (error) {
    dispatch({ type: BLOG_ERROR, payload: error.response?.data?.message || 'Failed to fetch blogs by user' });
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
  try {
    const res = await axios.get(`/blogs/category/${categoryId}?page=${page}&limit=${limit}`);
    dispatch({ type: GET_BLOGS, payload: res.data });
    return { payload: res.data }; // Return the response data
  } catch (error) {
    dispatch({ type: BLOG_ERROR, payload: error.response?.data?.message || 'Failed to fetch blogs by category' });
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
  } catch (error) {
    dispatch({
      type: BLOG_ERROR,
      payload: error.response?.data?.message || 'Error fetching blog comments',
    });
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
        'Content-Type': 'multipart/form-data', // Ensure the correct content type
        'x-upload-type': 'blog', // Optional: Send as a custom header
      },
    });
    dispatch({
      type: CREATE_BLOG,
      payload: res.data, // Contains the created blog
    });
  } catch (error) {
    dispatch({
      type: BLOG_ERROR,
      payload: error.response?.data?.message || 'Error creating blog',
    });
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
  } catch (error) {
    dispatch({
      type: BLOG_ERROR,
      payload: error.response?.data?.message || 'Error liking/disliking blog',
    });
  }
};

// Fetch admin blogs
export const getAdminBlogs = (page, limit) => async (dispatch) => {
  try {
    const res = await axios.get(`/blogs/admin?page=${page}&limit=${limit}`);
    // console.log(res.data)
    dispatch({ type: GET_BLOGS, payload: res.data });
  } catch (error) {
    console.log(error)
    dispatch({ type: BLOG_ERROR, payload: error.response?.data?.message || 'Failed to fetch admin blogs' });
  }
};

// Search blogs
export const searchBlogs = (query, page, limit) => async (dispatch) => {
  try {
    const res = await axios.get(`/blogs/search?q=${query}&page=${page}&limit=${limit}`);
    dispatch({ type: GET_BLOGS, payload: res.data });
  } catch (error) {
    dispatch({ type: BLOG_ERROR, payload: error.response?.data?.message || 'Failed to search blogs' });
  }
};