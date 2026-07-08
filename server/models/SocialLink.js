const mongoose = require('mongoose');

const socialLinkSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      required: true,
      enum: [
        'GitHub',
        'LinkedIn',
        'Twitter',
        'Instagram',
        'YouTube',
        'LeetCode',
        'HackerRank',
        'CodeChef',
        'Codeforces',
        'GeeksforGeeks',
        'Portfolio',
        'Other',
      ],
    },
    url: { type: String, required: true },
    username: { type: String, default: '' },
    icon: { type: String, default: '' },
    isCodingProfile: { type: Boolean, default: false },
    isVisible: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SocialLink', socialLinkSchema);
