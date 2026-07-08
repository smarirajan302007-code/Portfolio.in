const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    longDescription: { type: String, default: '' },
    features: [{ type: String }],
    techStack: [{ type: String }],
    coverImage: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    images: [
      {
        url: { type: String },
        publicId: { type: String },
      },
    ],
    githubUrl: { type: String, default: '' },
    liveUrl: { type: String, default: '' },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    category: { type: String, default: 'Web Development' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);
