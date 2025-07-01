import { combineReducers } from 'redux';
import storage from 'redux-persist/lib/storage'; // Uses localStorage
import { persistReducer } from 'redux-persist';
import authReducer from './authReducer';
import userReducer from './userReducer';
import blogReducer from './blogReducer';
import categoryReducer from './categoryReducer';
import commentReducer from './commentReducer';

const authPersistConfig = {
    key: 'auth',
    storage,
    whitelist: ['isAuthenticated', 'user'], // Persist only these keys
  };

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer), // Wrap authReducer with persistReducer
  users: userReducer,
  blogs: blogReducer,
  categories: categoryReducer,
  comments: commentReducer,
});

export default rootReducer;
