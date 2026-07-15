const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY_RAW = process.env.ENCRYPTION_KEY || 'portfolio-default-secure-key-123';
// Generate a strict 32-byte key from the env variable
const ENCRYPTION_KEY = crypto.scryptSync(ENCRYPTION_KEY_RAW, 'salt', 32);

/**
 * Encrypts a string
 * @param {string} text - The plaintext to encrypt
 * @returns {string} - The encrypted string (IV:Ciphertext)
 */
const encrypt = (text) => {
  if (!text) return text;
  
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    // Return iv and encrypted data separated by colon
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error.message);
    return text; // Fallback to plaintext if error
  }
};

/**
 * Decrypts a string
 * @param {string} text - The encrypted string (IV:Ciphertext)
 * @returns {string} - The decrypted plaintext
 */
const decrypt = (text) => {
  if (!text) return text;
  
  // If it doesn't look like an encrypted string (no IV separator), assume it's legacy plaintext
  if (!text.includes(':')) return text;

  try {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error.message);
    // If decryption fails (e.g. wrong key), return a placeholder or the raw text
    return '[Encrypted Message - Decryption Failed]';
  }
};

module.exports = { encrypt, decrypt };
