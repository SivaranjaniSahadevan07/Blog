import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllCategories } from "../redux/actions/categoryActions";
import { getBlogsByUser, createBlog, deleteBlog } from "../redux/actions/blogActions";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import "./CreateBlog.css";

const CreateBlog = () => {
  const [blogForm, setBlogForm] = useState({ title: "", content: "", categories: [], blogImage: "" });
  const fileInputRef = useRef(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    setError("");
    setBlogForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle category selection by clicking on category names
  const handleCategoryClick = (categoryId) => {
    setError("");
    setBlogForm((prev) => {
      const isSelected = prev.categories.some((id) => String(id) === String(categoryId));

      // const updatedCategories = isSelected
      //   ? prev.categories.filter((id) => id !== categoryId) // Remove if already selected
      //   : [...prev.categories, categoryId]; // Add if not selected

      const updatedCategories = isSelected
        ? prev.categories.filter((id) => String(id) !== String(categoryId))
        : [...prev.categories, String(categoryId)];
      // console.log(updatedCategories)
      return { ...prev, categories: updatedCategories };
    });
  };

  const handleCreateBlog = async (e) => {
    e.preventDefault();

    if (blogForm.categories.length === 0) {
      setError("Please select at least one category.");
      return;
    }

    if (!blogForm.blogImage) {
      setError("Please choose a cover image.");
      return;
    }

    const formData = new FormData();
    formData.append("title", blogForm.title.trim());
    formData.append("content", blogForm.content.trim());
    formData.append("categories", JSON.stringify(blogForm.categories));
    formData.append("image", blogForm.blogImage);

    setError("");
    setIsSubmitting(true);
    try {
      await dispatch(createBlog(formData));
      setBlogForm({ title: "", content: "", categories: [], blogImage: "" });
      if (fileInputRef.current) fileInputRef.current.value = "";
      await dispatch(getBlogsByUser(user._id, page, limit));
    } catch (submitError) {
      setError(submitError.message || "Unable to publish your blog. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    setError("");
    if (file && !["image/jpeg", "image/png"].includes(file.type)) {
      setError("Please choose a JPG or PNG image.");
      e.target.value = "";
      setBlogForm((prev) => ({ ...prev, blogImage: "" }));
      return;
    }
    if (file && file.size > 2 * 1024 * 1024) {
      setError("Your image must be smaller than 2 MB.");
      e.target.value = "";
      setBlogForm((prev) => ({ ...prev, blogImage: "" }));
      return;
    }
    setBlogForm((prev) => ({ ...prev, blogImage: file || "" }));
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
    <main className="create-blog-page">
      <div className="create-blog-shell">
        <header className="create-blog-heading">
          <span className="create-blog-eyebrow">YOUR WRITING SPACE</span>
          <h1>Share a story worth reading.</h1>
          <p>Turn your ideas into a post and share them with the community.</p>
        </header>

        <form onSubmit={handleCreateBlog} className="create-blog-form">
          <div className="create-blog-form-heading">
            <div>
              <span className="create-blog-step">NEW POST</span>
              <h2>Create a blog</h2>
            </div>
            <span className="create-blog-required">* Required</span>
          </div>
          <div className="create-blog-field">
            <label htmlFor="blog-title">Title <span>*</span></label>
            <input
              id="blog-title"
              type="text"
              name="title"
              className="form-control"
              placeholder="Give your story a great title"
              value={blogForm.title}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="create-blog-field">
            <label htmlFor="blog-content">Your story <span>*</span></label>
            <textarea
              id="blog-content"
              name="content"
              className="form-control"
              placeholder="Start writing your story..."
              value={blogForm.content}
              onChange={handleInputChange}
              rows={8}
              required
            />
          </div>

          <div className="create-blog-field">
            <label htmlFor="blog-image">Cover image <span>*</span></label>
            <input
              id="blog-image"
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              name="blogImage"
              className="form-control"
              accept="image/jpeg,image/png"
              required
            />
            <small>JPG or PNG · up to 2 MB</small>
          </div>

          <fieldset className="create-blog-categories">
            <legend>Choose categories <span>*</span></legend>
            <p>Select one or more topics for your story.</p>
            <div className="create-blog-category-list">
              {categories.map((cat) => {
                const selected = blogForm.categories.some((id) => String(id) === String(cat._id));
                return (
                  <button
                    type="button"
                    key={cat._id}
                    className={`create-blog-category ${selected ? "is-selected" : ""}`}
                    aria-pressed={selected}
                    onClick={() => handleCategoryClick(cat._id)}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {error && <p className="create-blog-error" role="alert">{error}</p>}
          <button className="create-blog-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Publishing..." : "Publish story"}
            {!isSubmitting && <span aria-hidden="true">→</span>}
          </button>
        </form>

        <section className="create-blog-list">
          <div className="create-blog-list-heading">
            <div>
              <span className="create-blog-step">YOUR WRITING</span>
              <h2>My blogs <span className="create-blog-count">{totalBlogs}</span></h2>
            </div>
            <span className="create-blog-page-count">Page {currentPage} of {totalPages}</span>
          </div>
          {blogs.length === 0 ? (
            <div className="create-blog-empty">
              <span aria-hidden="true">✍</span>
              <h3>Your stories will live here</h3>
              <p>Publish your first blog and it will appear in this list.</p>
            </div>
          ) : (
            <ul className="create-blog-posts">
              {blogs.map((b) => (
                <li key={b._id} className="create-blog-post">
                  <button className="create-blog-post-content" type="button" onClick={() => handleBlogClick(b._id)}>
                    <span className="create-blog-post-date">{moment(b.createdAt).fromNow()}</span>
                    <h3>{b.title}</h3>
                    <p>{b.content.slice(0, 140)}{b.content.length > 140 ? "..." : ""}</p>
                    <small>{getCategoryNames(b.categories) || "No category"}</small>
                  </button>
                  <button
                    className="create-blog-delete"
                    type="button"
                    onClick={() => handleDeleteBlog(b._id)}
                    aria-label={`Delete ${b.title}`}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="create-blog-pagination">
            <button type="button" onClick={handlePreviousPage} disabled={page === 1}>
              ← Previous
            </button>
            <button type="button" onClick={handleNextPage} disabled={page === totalPages}>
              Next →
            </button>
          </div>
        </section>
      </div>
    </main>
  );
};

export default CreateBlog;