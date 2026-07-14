const Education = require('../models/Education');
const { logHistory } = require('../utils/logger');
const { deleteFile } = require('../middleware/upload');

/**
 * @desc    Get all education records
 * @route   GET /api/education
 * @access  Public
 */
const getEducation = async (req, res, next) => {
  try {
    const education = await Education.find().sort({ order: 1, startYear: -1 });
    res.json({ success: true, count: education.length, data: education });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create education record
 * @route   POST /api/education
 * @access  Private
 */
const createEducation = async (req, res, next) => {
  try {
    const { degree, institution, startYear } = req.body;
    if (!degree || !institution || !startYear) {
      return res.status(400).json({ success: false, message: 'Degree, institution, and startYear are required' });
    }

    const educationData = { ...req.body };

    if (req.file) {
      educationData.markStatement = {
        url: req.file.path,
        publicId: req.file.filename,
      };
    }

    const education = await Education.create(educationData);
    await logHistory(`Added education: "${education.degree} at ${education.institution}"`, 'Education');
    res.status(201).json({ success: true, message: 'Education record created', data: education });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update education record
 * @route   PUT /api/education/:id
 * @access  Private
 */
const updateEducation = async (req, res, next) => {
  try {
    let education = await Education.findById(req.params.id);
    if (!education) {
      return res.status(404).json({ success: false, message: 'Education record not found' });
    }

    const updateData = { ...req.body };

    if (req.file) {
      // Delete old file if exists
      if (education.markStatement?.publicId) {
        // For PDF or Raw files, resource_type is raw in cloudinary. If image it's image. 
        // We handle this internally in deleteFile for safety, or we just pass it. 
        const isRaw = education.markStatement.publicId.endsWith('.pdf');
        await deleteFile(education.markStatement.publicId, isRaw);
      }
      updateData.markStatement = {
        url: req.file.path,
        publicId: req.file.filename,
      };
    }

    education = await Education.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    await logHistory(`Updated education: "${education.degree} at ${education.institution}"`, 'Education');
    res.json({ success: true, message: 'Education record updated', data: education });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete education record
 * @route   DELETE /api/education/:id
 * @access  Private
 */
const deleteEducation = async (req, res, next) => {
  try {
    const education = await Education.findByIdAndDelete(req.params.id);
    if (!education) {
      return res.status(404).json({ success: false, message: 'Education record not found' });
    }

    if (education.markStatement?.publicId) {
      const isRaw = education.markStatement.publicId.endsWith('.pdf');
      await deleteFile(education.markStatement.publicId, isRaw);
    }

    await logHistory(`Deleted education: "${education.degree} at ${education.institution}"`, 'Education');
    res.json({ success: true, message: 'Education record deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getEducation, createEducation, updateEducation, deleteEducation };
