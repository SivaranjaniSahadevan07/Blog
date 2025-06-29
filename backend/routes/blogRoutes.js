const express = require('express');
const { authenticate, authorize } = require('../middlewares/auth');
const { getAdminBlogs,
    searchBlogs,
    getBlogsByUser,
    createNewBlog,
    getAllBlogs,
    deleteBlog,
    likeDislikePost,
    getBlogsByCategory,
    getSingleBlog,
    getBlogComments,
    getblogLikes,
    getblogDislikes } = require('../controllers/blogController')

const upload = require('../middlewares/uploadMiddleware');
const parseUploadType = require('../middlewares/parseUploadType');
const authenticateOptional = require('../middlewares/authenticateOptional');

const router = express.Router();


router.get('/admin', getAdminBlogs); // Route for admin blogs
router.get('/search', searchBlogs); // Route for searching blogs
router.get('/user/:userId', getBlogsByUser);
router.get('/', getAllBlogs);
router.get('/category/:categoryId', getBlogsByCategory);
router.get('/:blogId', getSingleBlog);
// router.get('/:blogId/comments', authenticate, getBlogComments);
// router.get('/:blogId/comments', getBlogComments);
router.get('/:blogId/comments', authenticateOptional, getBlogComments);
router.post('/', authenticate, authorize(['admin', 'editor']), parseUploadType, upload.single('image'), createNewBlog);
router.post('/:blogId/like-dislike', authenticate, authorize(['reader']), likeDislikePost);
router.post('/:blogId/likes', getblogLikes);
router.post('/:blogId/dislikes', getblogDislikes);
router.delete('/:blogId', authenticate, authorize(['admin', 'editor']), deleteBlog);

// router.put('/:blogId', authenticate, authorize(['admin', 'editor']), updateBlog);

module.exports = router;