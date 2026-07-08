const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    name: { type: String, default: 'Alex Johnson', trim: true },
    title: { type: String, default: 'Full Stack Developer | Final Year CS Student' },
    greeting: { type: String, default: 'Hey there! 👋 I\'m' },
    bio: {
      type: String,
      default:
        'Passionate Computer Science student with a love for building elegant, scalable web applications. I thrive on turning complex problems into intuitive solutions.',
    },
    careerObjective: {
      type: String,
      default:
        'To leverage my skills in full-stack development and contribute to impactful projects while continuing to grow as a software engineer.',
    },
    interests: [{ type: String }],
    photo: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    heroImage: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    resume: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    location: { type: String, default: 'India' },
    email: { type: String, default: 'alex@example.com' },
    phone: { type: String, default: '+91 98765 43210' },
    yearsOfExperience: { type: Number, default: 0 },
    projectsCompleted: { type: Number, default: 0 },
    typingTexts: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Profile', profileSchema);
