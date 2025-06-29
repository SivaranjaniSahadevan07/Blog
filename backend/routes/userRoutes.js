const express = require('express');
const { authenticate, authorize } = require('../middlewares/auth');
const {
    getUserProfile,
    updateProfilePicture,
    updateUsername,
    updateEmail,
    updatePassword,
    createUser,
    getAllUsers,
    updateUserRole,
    deleteUser,
    blockUnblockUser,
    saveBlog,
    getSavedBlogs,
    removeSavedBlogs
} = require('../controllers/userController');
const upload = require('../middlewares/uploadMiddleware');
const parseUploadType = require('../middlewares/parseUploadType');

const router = express.Router();

router.get('/profile', authenticate, getUserProfile);
router.put('/profile-picture', authenticate, parseUploadType, upload.single('profileImage'), updateProfilePicture);
router.put('/username', authenticate, updateUsername);
router.put('/email', authenticate, updateEmail);
router.put('/password', authenticate, updatePassword);

router.post('/', authenticate, authorize(['admin']), createUser);
router.get('/', authenticate, authorize(['admin']), getAllUsers);
router.put('/:userId/role', authenticate, authorize(['admin']), updateUserRole);
router.delete('/:userId', authenticate, authorize(['admin']), deleteUser);
router.put('/:userId/block', authenticate, authorize(['admin']), blockUnblockUser); // Block/Unblock user

router.post('/save-blog', authenticate, authorize(['reader']), saveBlog);
router.get('/saved-blogs', authenticate, authorize(['reader']), getSavedBlogs);
router.post('/saved-blogs', authenticate, authorize(['reader']), removeSavedBlogs);


module.exports = router;