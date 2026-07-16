const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, markAsRead, deleteMessage, getStats, replyToMessage, editReply, deleteReply } = require('../controllers/contactController');
const { protect } = require('../middleware/auth');

router.post('/', sendMessage);
router.get('/stats', getStats);
router.get('/', protect, getMessages);
router.put('/:id/read', protect, markAsRead);
router.delete('/:id', protect, deleteMessage);
router.post('/:id/reply', protect, replyToMessage);
router.put('/:id/reply/:replyId', protect, editReply);
router.delete('/:id/reply/:replyId', protect, deleteReply);

module.exports = router;
