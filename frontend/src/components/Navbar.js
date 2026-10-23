import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/actions/authActions";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, user: authUser } = useSelector((state) => state.auth);
  const { user: profileUser } = useSelector((state) => state.users);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const closeMenu = () => setMenuOpen(false);
  const handleLogout = () => {
    dispatch(logout());
    closeMenu();
    navigate("/");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light">
      <div className="container-fluid p-0">
        <Link className="navbar-brand" to="/" onClick={closeMenu}>MyBlogApp</Link>
        <button
          className={`navbar-toggler ${menuOpen ? "is-open" : ""}`}
          type="button"
          aria-controls="navbarNav"
          aria-expanded={menuOpen}
          aria-label="Toggle navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="navbar-toggle-lines" aria-hidden="true"><span /><span /><span /></span>
        </button>
        <div className={`navbar-collapse ${menuOpen ? "show" : ""}`} id="navbarNav">
          <ul className="navbar-nav">
            {/* <li className="nav-item">
              <Link className="nav-link" to="/" onClick={closeMenu}>Blogs</Link>
            </li> */}
            {isAuthenticated && (
              <>
                {["admin", "editor", "reader"].includes(authUser?.role) && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/profile" onClick={closeMenu}>Profile</Link>
                  </li>
                )}
                {["admin", "editor"].includes(authUser?.role) && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/create-blog" onClick={closeMenu}>Blog +</Link>
                  </li>
                )}
                {authUser?.role === "reader" && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/saved-blogs" onClick={closeMenu}>Saved Blogs</Link>
                  </li>
                )}
                {authUser?.role === "admin" && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/create-category" onClick={closeMenu}>Category +</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/promote-user" onClick={closeMenu}>Promote</Link>
                    </li>
                  </>
                )}
              </>
            )}
          </ul>

          <ul className="navbar-nav ms-auto navbar-account-nav">
            {isAuthenticated ? (
              <>
                <li className="nav-item navbar-account">
                  <img
                    src={profileUser?.profileImage || "default-avatar.png"}
                    alt=""
                    className="rounded-circle border object-fit-cover"
                    style={{ width: "32px", height: "32px" }}
                  />
                  <span className="navbar-text">
                    {profileUser?.username || authUser?.username || "Account"} <span className="navbar-role">({authUser?.role})</span>
                  </span>
                </li>
                <li className="nav-item">
                  <button className="btn navbar-logout" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="btn btn-outline-light" to="/login" onClick={closeMenu}>Login</Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-light" to="/register" onClick={closeMenu}>Register</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;