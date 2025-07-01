import axios from "axios";
import {store} from '../redux/store';
import { refreshAccessToken } from '../redux/actions/authActions';
import { getAccessToken } from '../utils/tokenService';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8010/api", // or your backend URL
  withCredentials: true, // important: sends the refresh token cookie
});

instance.interceptors.request.use(
  (config) => {
    const accessToken = getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;
      await store.dispatch(refreshAccessToken());
      const accessToken = getAccessToken();
      if (accessToken) {
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axios(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
