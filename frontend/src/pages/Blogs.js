import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllBlogs, getBlogsByCategory, searchBlogs, getAdminBlogs } from '../redux/actions/blogActions';
import { getAllCategories } from '../redux/actions/categoryActions';
import { getSingleCategory } from '../redux/actions/categoryActions';
import { saveBlog, getSavedBlogs } from "../redux/actions/userActions"
import { deleteBlog } from '../redux/actions/blogActions';
import { Link } from 'react-router-dom';
import Categories from '../components/Categories';
import moment from 'moment';

const Blogs = () => {
  const dispatch = useDispatch();
  const { blogs, totalBlogs, currentPage, totalPages, error } = useSelector((state) => state.blogs);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { category } = useSelector((state) => state.categories);
  const { savedBlogs } = useSelector((state) => state.users)

  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null); // Track selected category
  const [searchQuery, setSearchQuery] = useState(''); // Track search query
  const [filter, setFilter] = useState('latest'); // Track selected filter (latest, admin, category)

  const limit = 10; // Number of blogs per page

  // Fetch blogs based on filter
  useEffect(() => {
    if (filter === 'category' && selectedCategory) {
      dispatch(getBlogsByCategory(selectedCategory, page, limit));
      dispatch(getSingleCategory(selectedCategory));
    } else if (filter === 'admin') {
      dispatch(getAdminBlogs(page, limit));
    } else if (filter === 'search' && searchQuery) {
      dispatch(searchBlogs(searchQuery, page, limit));
    } else {
      dispatch(getAllBlogs(page, limit)); // Default to latest blogs
    }
    // Dispatch getSavedBlogs only if the user is authenticated and has the "reader" role
    if (isAuthenticated && user?.role === 'reader') {
      dispatch(getSavedBlogs());
    }
    dispatch(getAllCategories());
  }, [dispatch, page, limit, filter, selectedCategory, searchQuery, isAuthenticated, user?.role]);

  // console.log(blogs)

  // Handle pagination
  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const handlePreviousPage = () => {
    if (page > 1) setPage(page - 1);
  };

  // Handle category click
  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    setFilter('category'); // Set filter to category
    setPage(1); // Reset to the first page
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setFilter('search'); // Set filter to search
    setPage(1); // Reset to the first page
  };

  // Handle filter change
  const handleFilterChange = (filterType) => {
    setFilter(filterType);
    setSelectedCategory(null); // Clear selected category
    setSearchQuery(''); // Clear search query
    setPage(1); // Reset to the first page
  };

  const handleBlogSave = async (blogId) => {
    await dispatch(saveBlog(blogId));
    dispatch(getSavedBlogs());
  };

  const handleBlogDelete = (blogId) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      dispatch(deleteBlog(blogId));
    }
  };

  return (
    <div className="container-fluid bg-dark-subtle p-md-5 pb-4">
      <div className="row">
        {/* Main Content */}
        <div className="col-md-8 mt-2 pb-md-5">
          <h4 className="mb-4">
            {filter === 'category' && selectedCategory
              ? `Blogs in ${category?.name} (${totalBlogs})`
              : filter === 'admin'
                ? `Admin Blogs (${totalBlogs})`
                : filter === 'search'
                  ? `Search Results for "${searchQuery}" (${totalBlogs})`
                  : `Latest Blogs (${totalBlogs})`}
          </h4>
          {error && <p className="text-danger">{error}</p>}
          <div className="row order-md-first order-last">
            {blogs.map((blog) => (
              <div className="row-md-4 mb-3" key={blog._id}>
                <div className="card bg-light-subtle">
                  {isAuthenticated && user.role === 'reader' ? (
                    <div className="text-end mt-2 me-2 mb-0">
                      {savedBlogs.find(sblog => sblog._id === blog._id) ? (
                        <span className="badge bg-success">Saved</span> // Show "Saved" label
                      ) : (
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => {
                            handleBlogSave(blog._id);
                          }}
                        >
                          Save
                        </button>
                      )}
                    </div>
                  ) : null}

                  <div className="card-body">
                    <span className="text-muted">{moment(blog.createdAt).fromNow()}</span> {/* Time ago */}
                    <h5 className="card-title">{blog.title}</h5>
                    <p className="card-text">{blog.content.substring(0, 100)}...</p>
                    <p className="card-text">Posted by <i>{blog.author.username}</i></p>
                    <div className='d-flex justify-content-between'>
                      <div>
                        <Link to={`/blog/${blog._id}`} className="btn btn-primary">
                          Read More
                        </Link>
                      </div>
                      <div>
                        {user && user.role === 'admin' && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleBlogDelete(blog._id)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="d-flex justify-content-between mt-4">
            <button
              className="btn btn-secondary"
              onClick={handlePreviousPage}
              disabled={page === 1}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="btn btn-secondary"
              onClick={handleNextPage}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-md-4 order-first order-md-last bg-secondary-subtle p-3 sticky-md-top" style={{ height: "fit-content" }}>
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-4">
            <input
              type="text"
              className="form-control"
              placeholder="Search blogs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="btn btn-primary mt-2 w-100">
              Search
            </button>
          </form>

          {/* Filters */}
          <div className="mb-4">
            <h5>Filters</h5>
            <button
              className={`btn btn-link ${filter === 'latest' ? 'fw-bold' : ''}`}
              onClick={() => handleFilterChange('latest')}
            >
              Latest Blogs
            </button>
            <button
              className={`btn btn-link ${filter === 'admin' ? 'fw-bold' : ''}`}
              onClick={() => handleFilterChange('admin')}
            >
              Admin Blogs
            </button>
          </div>

          {/* Categories */}
          <Categories onCategoryClick={handleCategoryClick} />
        </div>
      </div>
    </div>
  );
};

export default Blogs;