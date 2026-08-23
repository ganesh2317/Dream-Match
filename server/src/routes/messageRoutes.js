const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

// Static routes before parameterized :userId routes
router.get('/unread-count', protect, messageController.getUnreadCount);
router.post('/attachment', protect, messageController.uploadAttachment);
router.get('/conversations', protect, messageController.getConversations);

// Parameterized routes
router.get('/:userId', protect, messageController.getMessages);
router.post('/:userId', protect, messageController.sendMessage);

module.exports = router;
