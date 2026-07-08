const Education = require('../models/Education');
const { logHistory } = require('../utils/logger');

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
    const education = await Education.create(req.body);
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
    const education = await Education.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!education) {
      return res.status(404).json({ success: false, message: 'Education record not found' });
    }
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
    await logHistory(`Deleted education: "${education.degree} at ${education.institution}"`, 'Education');
    res.json({ success: true, message: 'Education record deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getEducation, createEducation, updateEducation, deleteEducation };
