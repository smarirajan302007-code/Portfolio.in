require('dotenv').config();
const mongoose = require('mongoose');
const Profile = require('./models/Profile');

async function checkProfile() {
  await mongoose.connect(process.env.MONGODB_URI);
  const profile = await Profile.findOne();
  console.log("Profile Name in DB:", profile?.name || "NULL (No Profile found)");
  process.exit(0);
}
checkProfile();
