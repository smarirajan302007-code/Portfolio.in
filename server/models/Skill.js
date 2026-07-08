const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ['Languages', 'Frontend', 'Backend', 'Database', 'Tools', 'Frameworks', 'Other'],
    },
    level: { type: Number, required: true, min: 0, max: 100, default: 80 },
    icon: { type: String, default: '' }, // React Icons name or emoji
    color: { type: String, default: '#4ADE80' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Skill', skillSchema);
