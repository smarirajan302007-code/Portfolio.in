const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema(
  {
    degree: { type: String, required: true, trim: true },
    institution: { type: String, required: true, trim: true },
    location: { type: String, default: '' },
    startYear: { type: String, required: true },
    endYear: { type: String, default: 'Present' },
    cgpa: { type: String, default: '' },
    percentage: { type: String, default: '' },
    description: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Education', educationSchema);
