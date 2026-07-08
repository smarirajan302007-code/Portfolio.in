const HistoryLog = require('../models/HistoryLog');

const logHistory = async (action, category, details = '') => {
  try {
    await HistoryLog.create({ action, category, details });
  } catch (error) {
    console.error('Failed to write history log:', error);
  }
};

module.exports = { logHistory };
