import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllCategories } from "../redux/actions/categoryActions";
import { getBlogsByUser, createBlog, deleteBlog } from "../redux/actions/blogActions";
import { useNavigate } from "react-router-dom";
import moment from "moment";

const CreateBlog = () => {
  const [blogForm, setBlogForm] = useState({ title: "", content: "", categories: [], blogImage: "" });
  const fileInputRef = useRef(null);
  const [error, setError] = useState(""); // State to manage form errors
  const [page, setPage] = useState(1);

  const limit = 10; // Number of blogs per page

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Access blogs, categories, and user from Redux state
  const { blogs, totalBlogs, currentPage, totalPages, loading: blogsLoading } = useSelector((state) => state.blogs);
  const { categories, loading: categoriesLoading } = useSelector((state) => state.categories);
  const { user } = useSelector((state) => state.auth);

  // Fetch categories and blogs on component mount
  useEffect(() => {
    dispatch(getBlogsByUser(user._id, page, limit));
    dispatch(getAllCategories());
  }, [dispatch, user._id, page, limit]);

  // Handle pagination
  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const handlePreviousPage = () => {
    if (page > 1) setPage(page - 1);
  };

  // Handle input changes for the blog form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBlogForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle category selection by clicking on category names
  const handleCategoryClick = (categoryId) => {
    setBlogForm((prev) => {
      const isSelected = prev.categories.includes(categoryId);

      // const updatedCategories = isSelected
      //   ? prev.categories.filter((id) => id !== categoryId) // Remove if already selected
      //   : [...prev.categories, categoryId]; // Add if not selected

      const updatedCategories = isSelected
        ? Array.from(prev.categories || []).filter((id) => String(id) !== String(categoryId))
        : [...(prev.categories || []), String(categoryId)];
      // console.log(updatedCategories)
      return { ...prev, categories: updatedCategories };
    });
  };

  // Handle blog creation
  const handleCreateBlog = async (e) => {
    e.preventDefault();

    // Validate that at least one category is selected
    if (blogForm.categories.length === 0) {
      setError("Please select at least one category.");
      return;
    }

    // console.log(blogForm)

    // Create FormData and append fields
    const formData = new FormData();
    formData.append('title', blogForm.title);
    formData.append('content', blogForm.content);
    formData.append('categories', blogForm.categories); // Convert categories array to JSON
    formData.append('image', blogForm.blogImage); // Append the file

    // console.log(formData)

    // Dispatch the createBlog action with FormData
    await dispatch(createBlog(formData));

    // Reset the form
    setBlogForm({ title: "", content: "", categories: [], blogImage: "" });
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    dispatch(getBlogsByUser(user._id, page, limit));
  };

  // Handle blog deletion
  const handleDeleteBlog = (blogId) => {
    if (window.confirm("Are you sure you want to delete this blog?")) {
      dispatch(deleteBlog(blogId)); // Dispatch the deleteBlog action
      dispatch(getBlogsByUser(user._id, page, limit));
    }
  };

  // Handle blog click to navigate to the blog detail page
  const handleBlogClick = (blogId) => {
    navigate(`/blog/${blogId}`); // Redirect to the blog detail page
  };

  // Get category names for a blog
  const getCategoryNames = (blogCategories) => {
    return blogCategories
      .map((catId) => categories.find((cat) => cat._id === catId)?.name)
      .filter((name) => name) // Filter out undefined names
      .join(", ");
  };

  if (blogsLoading || categoriesLoading) return <p className="text-center mt-5">Loading...</p>;

  return (
    <div className="container-fluid p-md-5 p-4 bg-dark-subtle">

      {/* Blog Creation */}
      <form onSubmit={handleCreateBlog} className="p-4 border border-light bg-light-subtle rounded mx-auto">
        <fieldset className="border border-3 p-3 rounded">
          <legend className="float-none w-auto px-2 fw-bold">Create Blog</legend>
          <div className="mb-2">
            <input
              type="text"
              name="title"
              className="form-control border-secondary-subtle"
              placeholder="Title*"
              value={blogForm.title}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="mb-2">
            <textarea
              name="content"
              className="form-control border-secondary-subtle"
              placeholder="Content*"
              value={blogForm.content}
              onChange={handleInputChange}
              rows={4}
              required
            />
          </div>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => setBlogForm((prev) => ({ ...prev, blogImage: e.target.files[0] }))} // Store the File object
              name="blogImage"
              className="form-control border-secondary-subtle"
            />
          </div>

          <div className="mb-2">
            <h5>Categories</h5>
            <div className="d-flex flex-wrap">
              {categories.map((cat) => (
                <span
                  key={cat._id}
                  className={`badge m-1 ${blogForm.categories.includes(cat._id) ? "bg-primary" : "bg-secondary"}`}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleCategoryClick(cat._id)}
                >
                  {cat.name}
                </span>
              ))}
            </div>
            {error && <p className="text-danger mt-2">{error}</p>} {/* Display error message */}
          </div>
          <button className="btn btn-primary float-end" type="submit">
            Post Blog
          </button>
        </fieldset>
      </form>

      {/* Blog List */}
      <div className="bg-info-subtle p-3 mt-5 mb-5">
        <h4>My Blogs {totalBlogs !== 0 && totalBlogs}</h4>
        {blogs.length === 0 ? (
          <p>No blogs posted yet.</p>
        ) : (
          <ul className="list-group">
            {blogs.map((b) => (
              <li
                key={b._id}
                className="list-group-item d-flex justify-content-between align-items-center m-1"
                onClick={() => handleBlogClick(b._id)} // Add click handler
                style={{ cursor: "pointer" }} // Add pointer cursor for better UX
              >
                <div>
                  <span className="text-muted">{moment(b.createdAt).fromNow()}</span> {/* Time ago */}
                  <h5>{b.title}</h5>
                  <p>{b.content.slice(0, 100)}...</p>
                  <small className="text-muted">
                    Categories: {getCategoryNames(b.categories) || "None"}
                  </small>
                </div>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering the blog click event
                    handleDeleteBlog(b._id);
                  }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
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

    </div>
  );
};

export default CreateBlog;