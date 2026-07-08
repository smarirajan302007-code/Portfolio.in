const SiteSettings = require('../models/SiteSettings');
const { deleteFile } = require('../middleware/upload');
const { logHistory } = require('../utils/logger');

/**
 * @desc    Get site settings
 * @route   GET /api/settings
 * @access  Public
 */
const getSettings = async (req, res, next) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create({});
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update site settings
 * @route   PUT /api/settings
 * @access  Private
 */
const updateSettings = async (req, res, next) => {
  try {
    const allowedFields = [
      'siteTitle', 'siteDescription', 'siteKeywords',
      'themeColor', 'accentColor', 'googleAnalyticsId', 'maintenanceMode',
      'footerText', 'footerLinks'
    ];

    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const settings = await SiteSettings.findOneAndUpdate({}, updateData, {
      new: true,
      upsert: true,
    });

    await logHistory('Updated site settings', 'Settings');
    res.json({ success: true, message: 'Settings updated', data: settings });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload favicon
 * @route   POST /api/settings/upload-favicon
 * @access  Private
 */
const uploadFavicon = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const settings = await SiteSettings.findOne();
    if (settings?.favicon?.publicId) {
      await deleteFile(settings.favicon.publicId);
    }

    const updated = await SiteSettings.findOneAndUpdate(
      {},
      { favicon: { url: req.file.path, publicId: req.file.filename } },
      { new: true, upsert: true }
    );

    await logHistory('Uploaded new favicon', 'Settings');
    res.json({ success: true, message: 'Favicon uploaded', data: updated });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSettings, updateSettings, uploadFavicon };
