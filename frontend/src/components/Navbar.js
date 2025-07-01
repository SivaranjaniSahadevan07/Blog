import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/actions/authActions";
import { getProfile } from "../redux/actions/userActions";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user: authUser } = useSelector((state) => state.auth);
  const { user: profileUser } = useSelector((state) => state.users);

  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout(navigate("/")));
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
      <Link className="navbar-brand" to="/">MyBlogApp</Link>
      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav">
          <li className="nav-item">
            <Link className="nav-link" to="/">Blogs</Link>
          </li>
          {isAuthenticated && (
            <>
              {["admin", "editor", "reader"].includes(authUser?.role) && (
                <li className="nav-item">
                  <Link className="nav-link" to="/profile">Profile</Link>
                </li>
              )}
              {["admin", "editor"].includes(authUser?.role) && (
                <li className="nav-item">
                  <Link className="nav-link" to="/create-blog">Blog +</Link>
                </li>
              )}
              {authUser?.role === "reader" && (
                <li className="nav-item">
                  <Link className="nav-link" to="/saved-blogs">Saved Blogs</Link>
                </li>
              )}
              {authUser?.role === "admin" && (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/create-category">Category +</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/promote-user">Promote</Link>
                  </li>
                </>
              )}
            </>
          )}
        </ul>

        <ul className="navbar-nav ms-auto">
          {isAuthenticated ? (
            <>
              <li className="nav-item me-2 d-flex align-items-center">
                <img
                  src={profileUser?.profileImage || "default-avatar.png"}
                  alt="Profile"
                  className="rounded-circle me-2 border border-light object-fit-cover"
                  style={{ width: "30px", height: "30px" }}
                />
                <span className="navbar-text text-white">
                  {profileUser?.username} ({authUser.role})
                </span>
              </li>
              <li className="nav-item">
                <button className="btn btn-danger btn-outline-light" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item me-2">
                <Link className="btn btn-outline-light" to="/login">Login</Link>
              </li>
              <li className="nav-item">
                <Link className="btn btn-light" to="/register">Register</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;