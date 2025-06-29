const express = require('express');
const { authenticate, authorize } = require('../middlewares/auth');
const { addComment, editComment, deleteComment, replyToComment, likeDislikeComment, getCommentLikes, getCommentDislikes } = require('../controllers/commentController');

const router = express.Router();

// Routes for comments
router.post('/:blogId', authenticate, authorize(['reader']), addComment); // Readers add a comment
router.patch('/:commentId', authenticate, authorize(['reader']), editComment); // Readers edit their own comment
router.delete('/:commentId', authenticate, deleteComment); // Soft delete (Readers, Editors, Admins)
router.post('/reply/:commentId', authenticate, authorize(['editor']), replyToComment); // Editors reply to comments

router.post('/:commentId/like-dislike', authenticate, authorize(['reader']), likeDislikeComment); // Readers like/dislike a comment
router.post('/:commentId/likes', getCommentLikes);
router.post('/:commentId/dislikes', getCommentDislikes);

module.exports = router;
