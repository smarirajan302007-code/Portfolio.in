const express = require('express');
const router = express.Router();
const { getSkills, createSkill, updateSkill, deleteSkill, reorderSkills } = require('../controllers/skillsController');
const { protect } = require('../middleware/auth');

router.get('/', getSkills);
router.post('/', protect, createSkill);
router.put('/reorder', protect, reorderSkills);
router.put('/:id', protect, updateSkill);
router.delete('/:id', protect, deleteSkill);

module.exports = router;
