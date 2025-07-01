import axios from '../../api/axios';
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

export const getProfile = () => async (dispatch, getState) => {
  try {
    const { auth } = getState();
    const res = await axios.get('/users/profile', {
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
      },
    });
    dispatch({ type: GET_PROFILE, payload: res.data });
  } catch (error) {
    dispatch({ type: USER_ERROR, payload: error.response?.data?.message || 'Failed to fetch profile' });
  }
};

export const updateProfilePicture = (formData) => async (dispatch, getState) => {
  try {
    const { auth } = getState();

    // Append uploadType to the formData
    formData.append('uploadType', 'profile');

    const res = await axios.put('/users/profile-picture?uploadType=profile', formData, {
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
        'Content-Type': 'multipart/form-data', // Ensure the correct content type
        'x-upload-type': 'profile', // Optional: Send as a custom header
      },
    });

    dispatch({ type: UPDATE_PROFILE_PICTURE, payload: res.data });
  } catch (error) {
    dispatch({ type: USER_ERROR, payload: error.response?.data?.message || 'Failed to update profile picture' });
  }
};

export const updateUsername = (username) => async (dispatch, getState) => {
  try {
    const { auth } = getState();
    const res = await axios.put('/users/username', { username }, {
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
      },
    });
    dispatch({ type: UPDATE_USERNAME, payload: res.data });
  } catch (error) {
    dispatch({ type: USER_ERROR, payload: error.response?.data?.message || 'Failed to update username' });
  }
};

export const updateEmail = (email) => async (dispatch, getState) => {
  try {
    const { auth } = getState();
    const res = await axios.put('/users/email', { email }, {
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
      },
    });
    dispatch({ type: UPDATE_EMAIL, payload: res.data });
  } catch (error) {
    dispatch({ type: USER_ERROR, payload: error.response?.data?.message || 'Failed to update email' });
  }
};

export const updatePassword = (oldPassword, newPassword) => async (dispatch, getState) => {
  try {
    const { auth } = getState();
    const res = await axios.put('/users/password', { oldPassword, newPassword }, {
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
      },
    });
    dispatch({ type: UPDATE_PASSWORD, payload: res.data });
  } catch (error) {
    dispatch({ type: USER_ERROR, payload: error.response?.data?.message || 'Failed to update password' });
  }
};

// Get all users (Admin only)
export const getAllUsers = (page, limit, searchQuery) => async (dispatch, getState) => {
  try {
    const { auth } = getState();
    const res = await axios.get(`/users?page=${page}&limit=${limit}&search=${searchQuery}`, {
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
      },
    });
    // console.log(res.data)
    dispatch({ type: GET_ALL_USERS, payload: res.data });
  } catch (error) {
    dispatch({ type: USER_ERROR, payload: error.response?.data?.message || 'Failed to fetch users' });
  }
};


// Create a new user
export const createUser = (userData) => async (dispatch, getState) => {
  try {
    const { auth } = getState();
    const res = await axios.post('/users', userData, {
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
      },
    });
    dispatch({
      type: CREATE_USER,
      payload: res.data,
    });
  } catch (error) {
    dispatch({
      type: USER_ERROR,
      payload: error.response?.data?.message || 'Failed to create user',
    });
  }
};

// Update user role (Admin only)
export const updateUserRole = (userId, role) => async (dispatch, getState) => {
  try {
    const { auth } = getState();
    const res = await axios.put(`/users/${userId}/role`, { role }, {
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
      },
    });
    dispatch({ type: UPDATE_USER_ROLE, payload: res.data });
  } catch (error) {
    dispatch({ type: USER_ERROR, payload: error.response?.data?.message || 'Failed to update user role' });
  }
};

// Delete user (Admin only)
export const deleteUser = (userId) => async (dispatch, getState) => {
  try {
    const { auth } = getState();
    await axios.delete(`/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
      },
    });
    dispatch({ type: DELETE_USER, payload: userId });
  } catch (error) {
    dispatch({ type: USER_ERROR, payload: error.response?.data?.message || 'Failed to delete user' });
  }
}

// Block or unblock a user
export const blockUnblockUser = (userId, isBlocked) => async (dispatch, getState) => {
  try {
    const { auth } = getState();
    const res = await axios.put(`/users/${userId}/block`, { isBlocked }, {
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
      },
    });
    dispatch({
      type: BLOCK_UNBLOCK_USER,
      payload: res.data,
    });
  } catch (error) {
    dispatch({
      type: USER_ERROR,
      payload: error.response?.data?.message || 'Failed to block/unblock user',
    });
  }
};

// Save a blog (Reader only)
export const saveBlog = (blogId) => async (dispatch, getState) => {
  try {
    const { auth } = getState();
    const res = await axios.post('/users/save-blog', { blogId }, {
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
      },
    });
    // console.log(res.data)
    dispatch({ type: SAVE_BLOG, payload: res.data });
  } catch (error) {
    dispatch({ type: USER_ERROR, payload: error.response?.data?.message || 'Failed to save blog' });
  }
};

// Get saved blogs (Reader only)
export const getSavedBlogs = () => async (dispatch, getState) => {
  try {
    const { auth } = getState();
    const res = await axios.get('/users/saved-blogs', {
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
      },
    });
    // console.log(res.data)

    dispatch({ type: GET_SAVED_BLOGS, payload: res.data.savedBlogs });
  } catch (error) {
    dispatch({ type: USER_ERROR, payload: error.response?.data?.message || 'Failed to fetch saved blogs' });
  }
};

// Remove saved blog (Reader only)
export const removeSavedBlog = (blogId) => async (dispatch, getState) => {
  try {
    const { auth } = getState();
    // const res = await axios.post('/users/saved-blogs', { blogId }, {
    await axios.post('/users/saved-blogs', { blogId }, {
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
      },
    });
    dispatch({ type: REMOVE_SAVED_BLOG, payload: blogId });
  } catch (error) {
    dispatch({ type: USER_ERROR, payload: error.response?.data?.message || 'Failed to remove saved blog' });
  }
};