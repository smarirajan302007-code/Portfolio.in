const express = require('express');
const router = express.Router();
const { getEducation, createEducation, updateEducation, deleteEducation } = require('../controllers/educationController');
const { uploadCert, localUrlMiddleware } = require('../middleware/upload');
const { protect } = require('../middleware/auth');

router.get('/', getEducation);
router.post('/', protect, uploadCert.single('markStatement'), localUrlMiddleware, createEducation);
router.put('/:id', protect, uploadCert.single('markStatement'), localUrlMiddleware, updateEducation);
router.delete('/:id', protect, deleteEducation);

module.exports = router;
