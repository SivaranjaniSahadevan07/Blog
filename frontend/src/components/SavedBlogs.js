import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getSavedBlogs, removeSavedBlog } from '../redux/actions/userActions';
import 'bootstrap/dist/css/bootstrap.min.css';

const SavedBlogs = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { savedBlogs } = useSelector((state) => state.users);

  useEffect(() => {
    dispatch(getSavedBlogs());
  }, [dispatch]);

  const handleRemove = (blogId) => {
    dispatch(removeSavedBlog(blogId));
  };

  const handleBlogClick = (blogId) => {
    navigate(`/blog/${blogId}`); // Navigate to the blog detail page
  };

  return (
    <div className="container-fluid p-md-5 p-4 bg-dark-subtle">
      <h1 className="text-center mb-4">Saved Blogs</h1>
      <div className="row">
        {savedBlogs?.length > 0 ? (
          <div className="d-flex justify-content-evenly flex-wrap">
            {savedBlogs.map((blog) => (
              <div key={blog._id} className="col-md-4 m-1">
                <div
                  className="card h-100"
                  onClick={() => handleBlogClick(blog._id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="card-body">
                    <h5 className="card-title text-primary">{blog.title}</h5>
                    <p className="card-text text-muted">
                      {blog.content.substring(0, 100)}...
                    </p>
                  </div>
                  <div className="card-footer text-end">
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering the blog click
                        handleRemove(blog._id);
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>) : <p className="text-center">No blogs have been saved yet!</p>
        }
      </div>
    </div>
  );
};

export default SavedBlogs;