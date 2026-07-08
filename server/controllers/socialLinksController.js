const SocialLink = require('../models/SocialLink');
const { logHistory } = require('../utils/logger');

/**
 * @desc    Get all social/coding profile links
 * @route   GET /api/social-links
 * @access  Public
 */
const getSocialLinks = async (req, res, next) => {
  try {
    const filter = { isVisible: true };
    if (req.query.type === 'coding') filter.isCodingProfile = true;
    if (req.query.type === 'social') filter.isCodingProfile = false;

    const links = await SocialLink.find(filter).sort({ order: 1 });
    res.json({ success: true, count: links.length, data: links });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all links (including hidden) — admin
 * @route   GET /api/social-links/all
 * @access  Private
 */
const getAllSocialLinks = async (req, res, next) => {
  try {
    const links = await SocialLink.find().sort({ order: 1 });
    res.json({ success: true, count: links.length, data: links });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create social link
 * @route   POST /api/social-links
 * @access  Private
 */
const createSocialLink = async (req, res, next) => {
  try {
    const { platform, url } = req.body;
    if (!platform || !url) {
      return res.status(400).json({ success: false, message: 'Platform and URL are required' });
    }
    const link = await SocialLink.create(req.body);
    await logHistory(`Added social link: "${link.platform}"`, 'Social Links');
    res.status(201).json({ success: true, message: 'Social link created', data: link });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update social link
 * @route   PUT /api/social-links/:id
 * @access  Private
 */
const updateSocialLink = async (req, res, next) => {
  try {
    const link = await SocialLink.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!link) {
      return res.status(404).json({ success: false, message: 'Social link not found' });
    }
    await logHistory(`Updated social link: "${link.platform}"`, 'Social Links');
    res.json({ success: true, message: 'Social link updated', data: link });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete social link
 * @route   DELETE /api/social-links/:id
 * @access  Private
 */
const deleteSocialLink = async (req, res, next) => {
  try {
    const link = await SocialLink.findByIdAndDelete(req.params.id);
    if (!link) {
      return res.status(404).json({ success: false, message: 'Social link not found' });
    }
    await logHistory(`Deleted social link: "${link.platform}"`, 'Social Links');
    res.json({ success: true, message: 'Social link deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSocialLinks, getAllSocialLinks, createSocialLink, updateSocialLink, deleteSocialLink };
