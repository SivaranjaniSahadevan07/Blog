const express = require('express');
const { authenticate } = require('../middlewares/auth');
const { register, login, refreshToken, logout } = require('../controllers/authController');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', authenticate, logout);

module.exports = router;
