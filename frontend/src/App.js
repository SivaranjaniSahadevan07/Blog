import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { refreshAccessToken } from './redux/actions/authActions';
import {getProfile} from './redux/actions/userActions';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
// import Home from './pages/Home';
import Blogs from './pages/Blogs';
import BlogDetail from './pages/BlogDetail';
import Profile from './pages/Profile';
// import EditorDashboard from './pages/EditorDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
// import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';
import ProtectedRoute from './components/ProtectedRoute';
import CreateBlog from "./components/CreateBlog";
import PromoteUser from "./components/PromoteUser";
import CreateCategory from "./components/CreateCategory";
import SavedBlogs from "./components/SavedBlogs";

const App = () => {

  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth); // Access auth state
  // console.log(isAuthenticated)

  useEffect(() => {
    // Only refresh the access token if the user is authenticated
    if (isAuthenticated) {
      dispatch(refreshAccessToken());
      dispatch(getProfile());
    }
  }, [dispatch, isAuthenticated]);

//   useEffect(() => {
//   // Only refresh the access token if the user is authenticated and the token is about to expire
//   if (isAuthenticated) {
//     const tokenExpiry = localStorage.getItem('tokenExpiry'); // Assuming you store token expiry in localStorage
//     const currentTime = Date.now();

//     // Refresh the token only if it's close to expiring (e.g., within 5 minutes)
//     if (tokenExpiry && currentTime > tokenExpiry - 5 * 60 * 1000) {
//       dispatch(refreshAccessToken());
//     }
//   }
// }, [dispatch, isAuthenticated]);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Blogs />} />
        <Route path="/blog/:blogId" element={<BlogDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/create-blog" element={
          <ProtectedRoute roles={['editor', 'admin']}>
            <CreateBlog />
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute roles={['admin', 'editor', 'reader']}>
            <Profile />
          </ProtectedRoute>
        } />

        <Route path="/create-category" element={
          <ProtectedRoute roles={['admin']}>
            <CreateCategory />
          </ProtectedRoute>
        } />

        <Route path="/promote-user" element={
          <ProtectedRoute roles={['admin']}>
            <PromoteUser />
          </ProtectedRoute>
        } />

        <Route path="/saved-blogs" element={
          <ProtectedRoute roles={['reader']}>
            <SavedBlogs />
          </ProtectedRoute>
        } />

        <Route path="/unauthorized" element={<Unauthorized />} />
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
      <Footer />
    </>
  );
};

export default App;
