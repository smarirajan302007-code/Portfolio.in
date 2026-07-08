const express = require('express');
const router = express.Router();
const { getSettings, updateSettings, uploadFavicon } = require('../controllers/settingsController');
const { protect } = require('../middleware/auth');
const { uploadGeneral, localUrlMiddleware } = require('../middleware/upload');

router.get('/', getSettings);
router.put('/', protect, updateSettings);
router.post('/upload-favicon', protect, uploadGeneral.single('favicon'), localUrlMiddleware, uploadFavicon);

module.exports = router;
