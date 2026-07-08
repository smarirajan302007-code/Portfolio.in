const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, uploadPhoto, uploadHeroImage, uploadResume, deleteResume } = require('../controllers/profileController');
const { protect } = require('../middleware/auth');
const { uploadProfile, uploadResume: uploadResumeMW, localUrlMiddleware } = require('../middleware/upload');

router.get('/', getProfile);
router.put('/', protect, updateProfile);
router.post('/upload-photo', protect, uploadProfile.single('photo'), localUrlMiddleware, uploadPhoto);
router.post('/upload-hero', protect, uploadProfile.single('heroImage'), localUrlMiddleware, uploadHeroImage);
router.post('/upload-resume', protect, uploadResumeMW.single('resume'), localUrlMiddleware, uploadResume);
router.delete('/resume', protect, deleteResume);

module.exports = router;
