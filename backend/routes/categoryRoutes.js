const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth');
const { createCategory, getAllCategories, getSingleCategory, deleteCategory } = require('../controllers/categoryController');

router.get('/', getAllCategories);
router.get('/:categoryId', getSingleCategory);
router.post('/', authenticate, authorize(["admin"]), createCategory);
router.delete('/:categoryId', authenticate, authorize(["admin"]), deleteCategory);

module.exports = router;