const express = require('express');
const router = express.Router();
const planController = require('../../controllers/pro/planController');
const authMiddleware = require('../../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', planController.getCurrentPlan);
router.post('/upgrade', planController.upgradeToPro);
router.post('/downgrade', planController.downgradeToFree);

module.exports = router;
