const express = require('express');
const router = express.Router();
const { getCertifications, createCertification, updateCertification, deleteCertification } = require('../controllers/certificationController');
const { protect } = require('../middleware/auth');
const { uploadCert, localUrlMiddleware } = require('../middleware/upload');

router.get('/', getCertifications);
router.post('/', protect, uploadCert.single('image'), localUrlMiddleware, createCertification);
router.put('/:id', protect, uploadCert.single('image'), localUrlMiddleware, updateCertification);
router.delete('/:id', protect, deleteCertification);

module.exports = router;
