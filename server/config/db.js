const mongoose = require('mongoose');
const Admin = require('../models/Admin');

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    mongoose.set('strictQuery', false);

    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts).then(async (mongoose) => {
      console.log(`✅ MongoDB Connected`);
      try {
        // Auto-update Admin name
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
      } catch (err) {
        console.error(`Seed error`, err);
      }
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error(`❌ MongoDB connection error: ${error.message}`);
    throw error;
  }

  return cached.conn;
};

module.exports = connectDB;
