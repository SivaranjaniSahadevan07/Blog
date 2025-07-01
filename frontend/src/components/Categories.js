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
    return <p>Loading categories...</p>; // Handle loading state
  }

  return (
    <div style={{ width: 'fit-content' }} className='p-3'>
      <h5>Categories</h5>
      {error && <p className="text-danger">{error}</p>}
      <ul className="list-group d-flex flex-row flex-wrap">
        {categories.map((category) => (
          <li
            key={category._id}
            className="list-group-item m-1 d-flex justify-content-between align-items-center"
            style={{ cursor: onCategoryClick ? 'pointer' : 'default' }}
          >
            <span
              onClick={onCategoryClick ? () => onCategoryClick(category._id) : undefined}
            >
              {category.name}{' '}
              <span className="badge bg-primary">
                {category.blogCount || 0} {/* Display blog count */}
              </span>
            </span>
            {user?.role === "admin" && category.blogCount === 0 && (
              <button
                className="btn btn-sm btn-danger"
                onClick={() => handleDelete(category._id)}
              >
                Delete
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Categories;