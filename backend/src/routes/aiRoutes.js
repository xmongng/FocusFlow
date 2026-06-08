const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');
const rateLimitMiddleware = require('../middleware/rateLimitMiddleware');

// Áp dụng middleware xác thực và giới hạn request AI cho tất cả route bên dưới
router.use(authMiddleware);
router.use(rateLimitMiddleware);

router.post('/chat', aiController.chatWithAI);
router.post('/plan', aiController.generatePlan);
router.post('/plan/commit', aiController.commitPlan);

module.exports = router;
