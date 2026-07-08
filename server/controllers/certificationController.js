const Certification = require('../models/Certification');
const { deleteFile } = require('../middleware/upload');
const { logHistory } = require('../utils/logger');

/**
 * @desc    Get all certifications
 * @route   GET /api/certifications
 * @access  Public
 */
const getCertifications = async (req, res, next) => {
  try {
    const certifications = await Certification.find().sort({ order: 1, issueDate: -1 });
    res.json({ success: true, count: certifications.length, data: certifications });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create certification
 * @route   POST /api/certifications
 * @access  Private
 */
const createCertification = async (req, res, next) => {
  try {
    const { title, issuer } = req.body;
    if (!title || !issuer) {
      return res.status(400).json({ success: false, message: 'Title and issuer are required' });
    }

    const certData = { ...req.body };
    if (certData.skills && typeof certData.skills === 'string') {
      certData.skills = JSON.parse(certData.skills);
    }

    if (req.file) {
      certData.image = { url: req.file.path, publicId: req.file.filename };
    }

    const certification = await Certification.create(certData);
    await logHistory(`Created certification: "${certification.title}"`, 'Certifications');
    res.status(201).json({ success: true, message: 'Certification created', data: certification });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update certification
 * @route   PUT /api/certifications/:id
 * @access  Private
 */
const updateCertification = async (req, res, next) => {
  try {
    const cert = await Certification.findById(req.params.id);
    if (!cert) {
      return res.status(404).json({ success: false, message: 'Certification not found' });
    }

    const updateData = { ...req.body };
    if (updateData.skills && typeof updateData.skills === 'string') {
      updateData.skills = JSON.parse(updateData.skills);
    }

    if (req.file) {
      if (cert.image?.publicId) {
        await deleteFile(cert.image.publicId);
      }
      updateData.image = { url: req.file.path, publicId: req.file.filename };
    }

    const updated = await Certification.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    await logHistory(`Updated certification: "${updated.title}"`, 'Certifications');
    res.json({ success: true, message: 'Certification updated', data: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete certification
 * @route   DELETE /api/certifications/:id
 * @access  Private
 */
const deleteCertification = async (req, res, next) => {
  try {
    const cert = await Certification.findById(req.params.id);
    if (!cert) {
      return res.status(404).json({ success: false, message: 'Certification not found' });
    }

    if (cert.image?.publicId) {
      await deleteFile(cert.image.publicId);
    }

    await cert.deleteOne();
    await logHistory(`Deleted certification: "${cert.title}"`, 'Certifications');
    res.json({ success: true, message: 'Certification deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCertifications, createCertification, updateCertification, deleteCertification };
