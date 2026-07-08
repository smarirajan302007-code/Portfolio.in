const Project = require('../models/Project');
const { deleteFile } = require('../middleware/upload');
const { logHistory } = require('../utils/logger');

/**
 * @desc    Get all projects
 * @route   GET /api/projects
 * @access  Public
 */
const getProjects = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.featured === 'true') filter.featured = true;
    if (req.query.category) filter.category = req.query.category;

    const projects = await Project.find(filter).sort({ featured: -1, order: 1, createdAt: -1 });
    res.json({ success: true, count: projects.length, data: projects });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single project
 * @route   GET /api/projects/:id
 * @access  Public
 */
const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create project
 * @route   POST /api/projects
 * @access  Private
 */
const createProject = async (req, res, next) => {
  try {
    const { title, description, longDescription, features, techStack, githubUrl, liveUrl, featured, order, category } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required' });
    }

    const parseList = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      // Try JSON first (array), then fall back to comma-split
      try { return JSON.parse(val); } catch { return val.split(',').map((s) => s.trim()).filter(Boolean); }
    };

    const projectData = {
      title,
      description,
      longDescription,
      features: parseList(features),
      techStack: parseList(techStack),
      githubUrl,
      liveUrl,
      featured: featured === 'true' || featured === true,
      order: order || 0,
      category,
    };

    // Handle cover image upload
    if (req.file) {
      projectData.coverImage = { url: req.file.path, publicId: req.file.filename };
    }

    const project = await Project.create(projectData);
    await logHistory(`Created project: "${project.title}"`, 'Projects');
    res.status(201).json({ success: true, message: 'Project created', data: project });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update project
 * @route   PUT /api/projects/:id
 * @access  Private
 */
const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const updateData = { ...req.body };

    // Parse JSON/CSV strings if sent from FormData
    const parseList = (val) => {
      if (!val) return undefined;
      if (Array.isArray(val)) return val;
      try { return JSON.parse(val); } catch { return val.split(',').map((s) => s.trim()).filter(Boolean); }
    };
    if (updateData.features !== undefined) updateData.features = parseList(updateData.features);
    if (updateData.techStack !== undefined) updateData.techStack = parseList(updateData.techStack);
    if (updateData.featured !== undefined) {
      updateData.featured = updateData.featured === 'true' || updateData.featured === true;
    }

    // Handle new cover image
    if (req.file) {
      // Delete old image
      if (project.coverImage?.publicId) {
        await deleteFile(project.coverImage.publicId);
      }
      updateData.coverImage = { url: req.file.path, publicId: req.file.filename };
    }

    const updatedProject = await Project.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    await logHistory(`Updated project: "${updatedProject.title}"`, 'Projects');
    res.json({ success: true, message: 'Project updated', data: updatedProject });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete project
 * @route   DELETE /api/projects/:id
 * @access  Private
 */
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Delete image
    if (project.coverImage?.publicId) {
      await deleteFile(project.coverImage.publicId);
    }

    await project.deleteOne();
    await logHistory(`Deleted project: "${project.title}"`, 'Projects');
    res.json({ success: true, message: 'Project deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProjects, getProject, createProject, updateProject, deleteProject };
