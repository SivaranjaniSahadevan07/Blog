import axios from '../../api/axios';
import {
  LOGIN_SUCCESS,
  LOGOUT,
  REGISTER_SUCCESS,
  REFRESH_TOKEN_SUCCESS,
  AUTH_ERROR,
} from '../../constants/actionTypes';
import { getAccessToken, setAccessToken, clearAccessToken } from '../../utils/tokenService';

export const register = (data) => async (dispatch) => {
  try {
    await axios.post('/auth/register', data);
    dispatch({ type: REGISTER_SUCCESS });
  } catch (error) {
    dispatch({ type: AUTH_ERROR });
  }
};

export const login = (credentials) => async (dispatch) => {
  try {
    let res = await axios.post('/auth/login', credentials, { withCredentials: true });
    const { accessToken, user } = res.data;
    setAccessToken(accessToken);
    // console.log(res)
    // console.log(accessToken)
    dispatch({ type: LOGIN_SUCCESS, payload: { accessToken, user } });
  } catch (error) {
    // console.log(error)
    dispatch({ type: AUTH_ERROR, payload: error.response?.data?.message });
  }
};

export const refreshAccessToken = () => async (dispatch) => {
  try {
    const res = await axios.post(
      '/auth/refresh',
      {}, // Empty body
      {
        withCredentials: true, // Include HTTP-only cookies
      }
    );

    const { accessToken } = res.data;
    
    // const token = res.data.accessToken;
    // const expiry = Date.now() + 15 * 60 * 1000; // 15 minutes
    // localStorage.setItem('tokenExpiry', expiry);

    setAccessToken(accessToken); // Save the new access token in memory
    dispatch({ type: REFRESH_TOKEN_SUCCESS, payload: { accessToken } });
  } catch (error) {
    console.error('Failed to refresh access token:', error.message);
    console.error('Error details:', error.response?.data || error);
    dispatch({ type: AUTH_ERROR });
  }
};

export const logout = () => async (dispatch) => {
  try {
    const accessToken = getAccessToken();

    if (!accessToken) {
      throw new Error('No access token found');
    }

    // Send the token in the Authorization header
    await axios.post(
      '/auth/logout',
      {}, // Empty body
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    clearAccessToken();
    dispatch({ type: LOGOUT });

  } catch (error) {
    console.error(error);
  }
};