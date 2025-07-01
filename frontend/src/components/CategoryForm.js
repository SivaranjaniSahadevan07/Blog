import { useDispatch } from 'react-redux';
import { createCategory, getAllCategories } from '../redux/actions/categoryActions';
import { useState } from 'react';

const CategoryForm = () => {
  const dispatch = useDispatch();
  const [categoryName, setCategoryName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(createCategory({ name: categoryName }));
    dispatch(getAllCategories()); // Refresh the category list after creation
    setCategoryName('');
  };

  return (
    <form onSubmit={handleSubmit} className='d-flex justify-content-center'>
      <input
        type="text"
        value={categoryName}
        onChange={(e) => setCategoryName(e.target.value)}
        placeholder="Enter category name"
        className="border-secondary-subtle"
      />
      <button type="submit">Create Category</button>
    </form>
  );
};

export default CategoryForm;