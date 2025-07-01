import axios from '../../api/axios';
import {
  GET_ALL_CATEGORIES,
  GET_SINGLE_CATEGORY,
  CREATE_CATEGORY,
  DELETE_CATEGORY,
  CATEGORY_ERROR,
} from '../../constants/actionTypes';

// Get all categories
export const getAllCategories = () => async (dispatch) => {
  try {
    const res = await axios.get('/categories');
    dispatch({
      type: GET_ALL_CATEGORIES,
      payload: res.data, // Contains the list of categories
    });
  } catch (error) {
    dispatch({
      type: CATEGORY_ERROR,
      payload: error.response?.data?.message || 'Error fetching categories',
    });
  }
};

// Fetch a single category by ID
export const getSingleCategory = (categoryId) => async (dispatch) => {
  try {
    const res = await axios.get(`/categories/${categoryId}`);
    //   console.log(res.data)
    dispatch({
      type: GET_SINGLE_CATEGORY,
      payload: res.data, // Contains the category details
    });
  } catch (error) {
    dispatch({
      type: CATEGORY_ERROR,
      payload: error.response?.data?.error || 'Error fetching category',
    });
  }
};

// Create a new category
export const createCategory = (categoryData) => async (dispatch, getState) => {
  try {
    const { auth } = getState();
    const res = await axios.post('/categories', categoryData, {
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
      },
    });
    dispatch({
      type: CREATE_CATEGORY,
      payload: res.data, // Contains the created category
    });
    return { payload: res.data }; // Return the created category
  } catch (error) {
    dispatch({
      type: CATEGORY_ERROR,
      payload: error.response?.data?.message || 'Error creating category',
    });
    return { payload: null }; // Return null in case of an error
  }
};

export const deleteCategory = (categoryId) => async (dispatch, getState) => {
  try {
    const { auth } = getState();
    await axios.delete(`/categories/${categoryId}`, {
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
      },
    });
    dispatch({ type: DELETE_CATEGORY, payload: categoryId });
  } catch (error) {
    dispatch({ type: CATEGORY_ERROR, payload: error.response.data.message });
  }
};