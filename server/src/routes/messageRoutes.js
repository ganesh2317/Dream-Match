const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.get('/conversations', protect, messageController.getConversations);
router.get('/:userId', protect, messageController.getMessages);
router.post('/:userId', protect, messageController.sendMessage);

module.exports = router;
