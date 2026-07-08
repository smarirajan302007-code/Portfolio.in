const Skill = require('../models/Skill');
const { logHistory } = require('../utils/logger');

/**
 * @desc    Get all skills
 * @route   GET /api/skills
 * @access  Public
 */
const getSkills = async (req, res, next) => {
  try {
    const skills = await Skill.find().sort({ category: 1, order: 1, name: 1 });
    res.json({ success: true, count: skills.length, data: skills });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a skill
 * @route   POST /api/skills
 * @access  Private
 */
const createSkill = async (req, res, next) => {
  try {
    const { name, category, level, icon, color, order } = req.body;

    if (!name || !category) {
      return res.status(400).json({ success: false, message: 'Name and category are required' });
    }

    const skill = await Skill.create({ name, category, level, icon, color, order });
    await logHistory(`Created skill: "${skill.name}"`, 'Skills');
    res.status(201).json({ success: true, message: 'Skill created', data: skill });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a skill
 * @route   PUT /api/skills/:id
 * @access  Private
 */
const updateSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!skill) {
      return res.status(404).json({ success: false, message: 'Skill not found' });
    }

    await logHistory(`Updated skill: "${skill.name}"`, 'Skills');
    res.json({ success: true, message: 'Skill updated', data: skill });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a skill
 * @route   DELETE /api/skills/:id
 * @access  Private
 */
const deleteSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findByIdAndDelete(req.params.id);

    if (!skill) {
      return res.status(404).json({ success: false, message: 'Skill not found' });
    }

    await logHistory(`Deleted skill: "${skill.name}"`, 'Skills');
    res.json({ success: true, message: 'Skill deleted' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reorder skills
 * @route   PUT /api/skills/reorder
 * @access  Private
 */
const reorderSkills = async (req, res, next) => {
  try {
    const { skills } = req.body; // [{ id, order }]

    if (!skills || !Array.isArray(skills)) {
      return res.status(400).json({ success: false, message: 'Skills array is required' });
    }

    const updates = skills.map(({ id, order }) =>
      Skill.findByIdAndUpdate(id, { order }, { new: true })
    );

    await Promise.all(updates);
    await logHistory('Reordered skills list', 'Skills');
    res.json({ success: true, message: 'Skills reordered' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSkills, createSkill, updateSkill, deleteSkill, reorderSkills };
