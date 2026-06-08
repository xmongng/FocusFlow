const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const auth = require('../middleware/authMiddleware');

router.use(auth);

router.get('/', eventController.getEvents);
router.post('/', eventController.createEvent);
router.delete('/:id', eventController.deleteEvent);

module.exports = router;
