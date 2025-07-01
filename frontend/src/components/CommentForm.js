import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addComment } from '../redux/actions/commentActions';
import { getBlogComments } from '../redux/actions/blogActions';
// import moment from 'moment';

const CommentForm = ({ blogId, blogAuthorId }) => {
    const dispatch = useDispatch();
    const { error } = useSelector((state) => state.comments);

    const [commentText, setCommentText] = useState('');

    const handleAddComment = async(e) => {
        e.preventDefault();
        if (commentText.trim()) {
            await dispatch(addComment(blogId, { content: commentText }));
            setCommentText(''); // Clear the input field after adding the comment
            dispatch(getBlogComments(blogId)); // Fetch updated comments
        }
    };

    return (
        <div className="mt-4">
            <h5>Add yor comments</h5>
            {error && <p className="text-danger">{error}</p>}

            {/* Add Comment Form */}
                <form onSubmit={handleAddComment} className="mb-4">
                    <div className="mb-3">
                        <textarea
                            className="form-control"
                            rows="3"
                            placeholder="Write a comment..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                        ></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary">
                        Add Comment
                    </button>
                </form>


        </div>
    );
};

export default CommentForm;