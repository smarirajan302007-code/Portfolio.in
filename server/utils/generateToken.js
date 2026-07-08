const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT token for an admin ID
 * @param {string} id - Admin document _id
 * @returns {string} signed JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

module.exports = generateToken;
