import forge from 'node-forge';

// Public key for encrypting messages before sending them to the backend
const PUBLIC_KEY_PEM = import.meta.env.VITE_E2E_PUBLIC_KEY;

// Private key for decrypting messages in the admin dashboard
// This should NOT be committed or exposed to the public client build.
// Only the admin should have access to this (e.g. through a prompt or a secure admin-only env var).
const PRIVATE_KEY_PEM = import.meta.env.VITE_E2E_PRIVATE_KEY;

/**
 * Encrypts a plaintext string using the RSA Public Key.
 * @param {string} text - The plaintext to encrypt.
 * @returns {string} - The base64 encoded encrypted string, or original text if encryption fails.
 */
export const encryptMessage = (text) => {
  if (!PUBLIC_KEY_PEM || !text) return text;
  
  try {
    const publicKey = forge.pki.publicKeyFromPem(PUBLIC_KEY_PEM);
    const encrypted = publicKey.encrypt(forge.util.encodeUtf8(text), 'RSA-OAEP');
    return forge.util.encode64(encrypted);
  } catch (error) {
    console.error('Encryption failed:', error);
    return text; // Fallback to plain text on error
  }
};

/**
 * Decrypts a base64 encoded string using the RSA Private Key.
 * @param {string} encryptedText - The base64 encoded encrypted string.
 * @param {string} privateKeyPemOverride - Optional private key PEM string (if not using env var).
 * @returns {string} - The decrypted plaintext, or original text if decryption fails.
 */
export const decryptMessage = (encryptedText, privateKeyPemOverride = null) => {
  const pem = privateKeyPemOverride || PRIVATE_KEY_PEM;
  if (!pem || !encryptedText) return encryptedText;

  try {
    const privateKey = forge.pki.privateKeyFromPem(pem);
    const decoded = forge.util.decode64(encryptedText);
    const decrypted = privateKey.decrypt(decoded, 'RSA-OAEP');
    return forge.util.decodeUtf8(decrypted);
  } catch (error) {
    // If it's not valid base64 or not encrypted with this key, return as is (could be legacy unencrypted message)
    return encryptedText;
  }
};

/**
 * Utility to generate a new RSA Key Pair.
 * Useful for the admin to generate keys once.
 */
export const generateKeyPair = () => {
  const keypair = forge.pki.rsa.generateKeyPair({ bits: 2048, e: 0x10001 });
  return {
    publicKey: forge.pki.publicKeyToPem(keypair.publicKey),
    privateKey: forge.pki.privateKeyToPem(keypair.privateKey)
  };
};
