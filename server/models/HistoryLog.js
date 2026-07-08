const mongoose = require('mongoose');

const HistoryLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  details: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('HistoryLog', HistoryLogSchema);
