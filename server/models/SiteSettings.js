const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema(
  {
    siteTitle: { type: String, default: 'Alex Johnson | Portfolio' },
    siteDescription: {
      type: String,
      default: 'Full Stack Developer Portfolio showcasing projects, skills and achievements.',
    },
    siteKeywords: { type: String, default: 'developer, portfolio, react, node, fullstack' },
    favicon: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    logo: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    themeColor: { type: String, default: '#4ADE80' },
    accentColor: { type: String, default: '#22c55e' },
    googleAnalyticsId: { type: String, default: '' },
    maintenanceMode: { type: Boolean, default: false },
    footerText: { type: String, default: '' },
    footerLinks: [
      {
        label: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
