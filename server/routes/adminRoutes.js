const express = require('express');
const router = express.Router();
const { login, getMe, changePassword } = require('../controllers/adminController');
const { protect } = require('../middleware/auth');

router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);

// Safe manual cloud seed endpoint
router.get('/seed-cloud', async (req, res) => {
  try {
    const Admin = require('../models/Admin');
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      await Admin.create({
        name: 'S. Mari Rajan',
        email: 'admin',
        password: 'admin1234',
      });
      res.send(`<h1>✅ Database Seeded Successfully!</h1><p>You can now log in with admin / admin1234.</p><a href="/admin/login">Go to Login</a>`);
    } else {
      res.send(`<h1>Database is already seeded.</h1><a href="/admin/login">Go to Login</a>`);
    }
  } catch (error) {
    res.status(500).send(`<h1>❌ Error seeding database:</h1><p>${error.message}</p>`);
  }
});

module.exports = router;
