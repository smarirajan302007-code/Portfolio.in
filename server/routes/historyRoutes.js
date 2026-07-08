const express = require('express');
const router = express.Router();
const HistoryLog = require('../models/HistoryLog');
const { protect } = require('../middleware/auth');

// Get history logs (Private, Admin only)
router.get('/', protect, async (req, res, next) => {
  try {
    const logs = await HistoryLog.find().sort({ timestamp: -1 }).limit(100);
    res.json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    next(error);
  }
});

// Clear history logs (Private, Admin only)
router.delete('/', protect, async (req, res, next) => {
  try {
    const { ids } = req.body;
    let query = {};
    if (ids && Array.isArray(ids) && ids.length > 0) {
      query = { _id: { $in: ids } };
    }
    await HistoryLog.deleteMany(query);
    res.json({ success: true, message: 'History logs cleared successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
