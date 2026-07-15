const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, markAsRead, deleteMessage, getStats, replyToMessage } = require('../controllers/contactController');
const { protect } = require('../middleware/auth');

router.post('/', sendMessage);
router.get('/stats', protect, getStats);
router.get('/', protect, getMessages);
router.put('/:id/read', protect, markAsRead);
router.delete('/:id', protect, deleteMessage);
router.post('/:id/reply', protect, replyToMessage);

module.exports = router;
