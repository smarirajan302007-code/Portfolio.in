const mongoose = require('mongoose');
const Admin = require('../models/Admin');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    // Auto-update Admin name to replace Alex Johnson permanently
    await Admin.updateMany({}, { name: 'S. Mari Rajan' });

    // Auto-seed default admin if database is completely empty
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      await Admin.create({
        name: 'S. Mari Rajan',
        email: 'admin',
        password: 'admin1234',
      });
      console.log('✅ Default Admin auto-created for new cloud database');
    }
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
