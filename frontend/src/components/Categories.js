import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllCategories, deleteCategory } from '../redux/actions/categoryActions';

const Categories = ({ onCategoryClick }) => {
  const dispatch = useDispatch();
  const { categories, error } = useSelector((state) => state.categories);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!categories || categories.length === 0) {
      dispatch(getAllCategories()); // Fetch categories with blog counts
    }
  }, [dispatch, categories]);

  const handleDelete = (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      dispatch(deleteCategory(categoryId));
    }
  };

  if (!categories || categories.length === 0) {
    return <section className="categories-widget">
      <h5 className="categories-title">Topics</h5>
      <p className="text-muted small mb-0">{error ? 'Topics are temporarily unavailable.' : 'Loading topics…'}</p>
    </section>;
  }

  return (
    <section className="categories-widget">
      <h5 className="categories-title">Topics</h5>
      {error && <p className="text-danger">{error}</p>}
      <ul className="categories-list">
        {categories.map((category) => (
          <li key={category._id}>
            <button
              type="button"
              className="category-chip"
              onClick={onCategoryClick ? () => onCategoryClick(category._id) : undefined}
              disabled={!onCategoryClick}
            >
              {category.name}
              <span className="category-count">{category.blogCount || 0}</span>
            </button>
            {user?.role === "admin" && category.blogCount === 0 && (
              <button
                className="delete-link"
                onClick={() => handleDelete(category._id)}
              >
                Delete
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Categories;