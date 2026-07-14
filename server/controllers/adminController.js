const Admin = require('../models/Admin');
const generateToken = require('../utils/generateToken');

/**
 * @desc    Admin login
 * @route   POST /api/admin/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Find admin and include password (normalize email)
    const normalizedEmail = email.toLowerCase().trim();
    const admin = await Admin.findOne({ email: normalizedEmail }).select('+password');
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Username or password are incorrect' });
    }

    // Check password
    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Username or password are incorrect' });
    }

    const token = generateToken(admin._id);

    res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current admin info
 * @route   GET /api/admin/me
 * @access  Private
 */
const getMe = async (req, res) => {
  res.json({ success: true, admin: req.admin });
};

/**
 * @desc    Change admin password
 * @route   PUT /api/admin/change-password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const admin = await Admin.findById(req.admin._id).select('+password');
    const isMatch = await admin.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ success: false, message: 'New password cannot be the same as current password' });
    }

    admin.password = newPassword;
    await admin.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { login, getMe, changePassword };
