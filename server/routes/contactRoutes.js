const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, markAsRead, deleteMessage, getStats } = require('../controllers/contactController');
const { protect } = require('../middleware/auth');

router.post('/', sendMessage);
router.get('/stats', protect, getStats);
router.get('/', protect, getMessages);
router.put('/:id/read', protect, markAsRead);
router.delete('/:id', protect, deleteMessage);

module.exports = router;
