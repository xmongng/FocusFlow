const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const auth = require('../middleware/authMiddleware');

router.use(auth);

router.get('/', categoryController.getCategories);
router.post('/', categoryController.createCategory);

module.exports = router;
