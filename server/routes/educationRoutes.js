const express = require('express');
const router = express.Router();
const { getEducation, createEducation, updateEducation, deleteEducation } = require('../controllers/educationController');
const { protect } = require('../middleware/auth');

router.get('/', getEducation);
router.post('/', protect, createEducation);
router.put('/:id', protect, updateEducation);
router.delete('/:id', protect, deleteEducation);

module.exports = router;
