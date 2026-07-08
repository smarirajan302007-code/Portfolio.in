const express = require('express');
const router = express.Router();
const { getProjects, getProject, createProject, updateProject, deleteProject } = require('../controllers/projectsController');
const { protect } = require('../middleware/auth');
const { uploadProject, localUrlMiddleware } = require('../middleware/upload');

router.get('/', getProjects);
router.get('/:id', getProject);
router.post('/', protect, uploadProject.single('coverImage'), localUrlMiddleware, createProject);
router.put('/:id', protect, uploadProject.single('coverImage'), localUrlMiddleware, updateProject);
router.delete('/:id', protect, deleteProject);

module.exports = router;
