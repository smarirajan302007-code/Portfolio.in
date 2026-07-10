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
    const mongoose = require('mongoose');
    
    // Check if connected, if not try to connect
    if (mongoose.connection.readyState !== 1) {
      try {
        await mongoose.connect(process.env.MONGODB_URI, {
          serverSelectionTimeoutMS: 5000 // fail fast in 5 seconds
        });
      } catch (connError) {
        return res.status(500).send(`
          <h1 style="color:red;">❌ Database Connection Failed!</h1>
          <h3>Mongoose could not connect to your MongoDB Atlas.</h3>
          <p><strong>Error Details:</strong> ${connError.message}</p>
          <hr/>
          <p><strong>How to fix this:</strong></p>
          <ul>
            <li>Go to your Vercel Dashboard -> Settings -> Environment Variables.</li>
            <li>Edit <code>MONGODB_URI</code>.</li>
            <li>Make sure you replaced <code>&lt;password&gt;</code> completely. For example, if your password is <code>secret123</code>, it should look like <code>username:secret123@cluster...</code> (No <code>&lt;</code> or <code>&gt;</code> symbols).</li>
            <li>If your password has special characters like <code>@</code>, <code>#</code>, or <code>?</code>, you must URL-encode them. (For example, <code>@</code> becomes <code>%40</code>). Or just change your database password to only use letters and numbers.</li>
            <li>Make sure your Network Access in MongoDB Atlas has <code>0.0.0.0/0</code> Active.</li>
          </ul>
        `);
      }
    }

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
