import {
  LOGIN_SUCCESS,
  LOGOUT,
  REGISTER_SUCCESS,
  REFRESH_TOKEN_SUCCESS,
  AUTH_ERROR,
} from '../../constants/actionTypes';

const initialState = {
  isAuthenticated: false,
  accessToken: null,
  user: null,
  error: null,
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case REGISTER_SUCCESS:
      return initialState;
    case LOGIN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        accessToken: action.payload.accessToken,
        user: action.payload.user, // Contains id, username, role
        error: null,
      };
    case REFRESH_TOKEN_SUCCESS:
      return {
        ...state,
        accessToken: action.payload.accessToken,
      };
    case LOGOUT:
      return initialState;
    case AUTH_ERROR:
      return {
        ...state,
        isAuthenticated: false,
        accessToken: null,
        user: null,
        error: action.payload,
      };
    default:
      return state;
  }
};

export default authReducer;