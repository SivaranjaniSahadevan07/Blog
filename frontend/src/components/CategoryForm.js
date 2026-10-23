import { useDispatch } from 'react-redux';
import { createCategory, getAllCategories } from '../redux/actions/categoryActions';
import { useState } from 'react';

const CategoryForm = () => {
  const dispatch = useDispatch();
  const [categoryName, setCategoryName] = useState('');
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = categoryName.trim();
    if (!name || isSubmitting) return;
    setIsSubmitting(true);
    setFeedback('');
    const result = await dispatch(createCategory({ name }));
    if (result?.payload) {
      setFeedbackType('success');
      setFeedback(`“${name}” is ready to use.`);
      setCategoryName('');
      await dispatch(getAllCategories());
    } else {
      setFeedbackType('error');
      setFeedback(result?.error || 'Could not create this category. Please try again.');
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="category-create-card">
      <div className="category-create-copy">
        <span className="category-create-icon" aria-hidden="true">✳</span>
        <div>
          <span className="eyebrow">ORGANIZE THE JOURNAL</span>
          <h2>Add a category</h2>
          <p>Give readers another way to find stories they love.</p>
        </div>
      </div>
      <label htmlFor="new-category-name">Category name</label>
      <div className="category-create-controls">
        <input
          id="new-category-name"
          type="text"
          value={categoryName}
          onChange={(e) => {
            setCategoryName(e.target.value);
            setFeedback('');
          }}
          placeholder="e.g. Personal growth"
          className="form-control"
          maxLength={40}
          required
        />
        <button className="category-create-submit" type="submit" disabled={!categoryName.trim() || isSubmitting}>
          {isSubmitting ? 'Adding…' : 'Add category'}
          {!isSubmitting && <span aria-hidden="true">→</span>}
        </button>
      </div>
      {feedback && <p className={`category-feedback is-${feedbackType}`} role={feedbackType === 'error' ? 'alert' : 'status'}>{feedback}</p>}
    </form>
  );
};

export default CategoryForm;