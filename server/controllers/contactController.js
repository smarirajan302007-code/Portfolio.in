const ContactMessage = require('../models/ContactMessage');
const { sendContactNotification, sendContactAutoReply } = require('../services/emailService');
const { encrypt, decrypt } = require('../utils/encryption');

/**
 * @desc    Send contact message (public)
 * @route   POST /api/contact
 * @access  Public
 */
const sendMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email address' });
    }

    // Save message to DB (Encrypted)
    const contactMessage = await ContactMessage.create({
      name: encrypt(name),
      email: encrypt(email),
      subject: encrypt(subject),
      message: encrypt(message),
      ipAddress: req.ip,
    });

    // Send emails (non-blocking — don't fail if email fails)
    try {
      await sendContactNotification({ name, email, subject, message });
      await sendContactAutoReply({ name, email });
    } catch (emailError) {
      console.error('Email sending failed:', emailError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully! I will get back to you soon.',
      data: { id: contactMessage._id },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all contact messages (admin)
 * @route   GET /api/contact
 * @access  Private
 */
const getMessages = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.isRead === 'false') filter.isRead = false;
    if (req.query.isRead === 'true') filter.isRead = true;

    const messages = await ContactMessage.find(filter).sort({ createdAt: -1 });
    const unreadCount = await ContactMessage.countDocuments({ isRead: false });

    const decryptedMessages = messages.map(msg => {
      const obj = msg.toObject();
      return {
        ...obj,
        name: decrypt(obj.name),
        email: decrypt(obj.email),
        subject: decrypt(obj.subject),
        message: decrypt(obj.message),
      };
    });

    res.json({
      success: true,
      count: decryptedMessages.length,
      unreadCount,
      data: decryptedMessages,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark message as read
 * @route   PUT /api/contact/:id/read
 * @access  Private
 */
const markAsRead = async (req, res, next) => {
  try {
    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    res.json({ success: true, message: 'Marked as read', data: message });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete contact message
 * @route   DELETE /api/contact/:id
 * @access  Private
 */
const deleteMessage = async (req, res, next) => {
  try {
    const message = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get dashboard stats
 * @route   GET /api/contact/stats
 * @access  Private
 */
const getStats = async (req, res, next) => {
  try {
    const Project = require('../models/Project');
    const Skill = require('../models/Skill');
    const Certification = require('../models/Certification');

    const [projects, skills, certifications, totalMessages, unreadMessages] = await Promise.all([
      Project.countDocuments(),
      Skill.countDocuments(),
      Certification.countDocuments(),
      ContactMessage.countDocuments(),
      ContactMessage.countDocuments({ isRead: false }),
    ]);

    res.json({
      success: true,
      data: { projects, skills, certifications, totalMessages, unreadMessages },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { sendMessage, getMessages, markAsRead, deleteMessage, getStats };
