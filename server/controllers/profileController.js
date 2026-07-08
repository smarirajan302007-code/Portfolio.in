const Profile = require('../models/Profile');
const { deleteFile } = require('../middleware/upload');
const { logHistory } = require('../utils/logger');

/**
 * @desc    Get profile
 * @route   GET /api/profile
 * @access  Public
 */
const getProfile = async (req, res, next) => {
  try {
    let profile = await Profile.findOne();
    if (!profile) {
      // Create default profile if none exists
      profile = await Profile.create({
        typingTexts: ['Full Stack Developer', 'React Developer', 'Node.js Developer', 'CS Student'],
        interests: ['Web Development', 'Open Source', 'Problem Solving', 'AI/ML'],
      });
    }
    res.json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update profile
 * @route   PUT /api/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      'name', 'title', 'greeting', 'bio', 'careerObjective', 'interests',
      'location', 'email', 'phone', 'yearsOfExperience',
      'projectsCompleted', 'typingTexts',
    ];

    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const profile = await Profile.findOneAndUpdate(
      {},
      updateData,
      { new: true, upsert: true, runValidators: true }
    );

    await logHistory('Updated profile information', 'Profile', `Fields: ${Object.keys(updateData).join(', ')}`);

    res.json({ success: true, message: 'Profile updated successfully', data: profile });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload profile photo
 * @route   POST /api/profile/upload-photo
 * @access  Private
 */
const uploadPhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Delete old photo
    const profile = await Profile.findOne();
    if (profile?.photo?.publicId) {
      await deleteFile(profile.photo.publicId);
    }

    const updatedProfile = await Profile.findOneAndUpdate(
      {},
      { photo: { url: req.file.path, publicId: req.file.filename } },
      { new: true, upsert: true }
    );

    await logHistory('Uploaded profile photo', 'Profile');

    res.json({ success: true, message: 'Photo uploaded successfully', data: updatedProfile });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload hero image
 * @route   POST /api/profile/upload-hero
 * @access  Private
 */
const uploadHeroImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const profile = await Profile.findOne();
    if (profile?.heroImage?.publicId) {
      await deleteFile(profile.heroImage.publicId);
    }

    const updatedProfile = await Profile.findOneAndUpdate(
      {},
      { heroImage: { url: req.file.path, publicId: req.file.filename } },
      { new: true, upsert: true }
    );

    await logHistory('Uploaded hero image', 'Profile');

    res.json({ success: true, message: 'Hero image uploaded successfully', data: updatedProfile });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload resume
 * @route   POST /api/profile/upload-resume
 * @access  Private
 */
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const profile = await Profile.findOne();
    if (profile?.resume?.publicId) {
      await deleteFile(profile.resume.publicId, true);
    }

    const updatedProfile = await Profile.findOneAndUpdate(
      {},
      { resume: { url: req.file.path, publicId: req.file.filename } },
      { new: true, upsert: true }
    );

    await logHistory('Uploaded resume PDF', 'Profile');

    res.json({ success: true, message: 'Resume uploaded successfully', data: updatedProfile });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete resume
 * @route   DELETE /api/profile/resume
 * @access  Private
 */
const deleteResume = async (req, res, next) => {
  try {
    const profile = await Profile.findOne();
    if (profile && profile.resume && profile.resume.public_id) {
      // Determine if it's raw based on url extension (only for cloudinary)
      const isRaw = profile.resume.url?.toLowerCase().endsWith('.pdf');
      await deleteFile(profile.resume.public_id, isRaw);
    }
    
    const updatedProfile = await Profile.findOneAndUpdate(
      {},
      { $unset: { resume: 1 } },
      { new: true }
    );
    
    await logHistory('Deleted resume', 'Profile');
    res.json({ success: true, message: 'Resume deleted successfully', data: updatedProfile });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile, uploadPhoto, uploadHeroImage, uploadResume, deleteResume };
