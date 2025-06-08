/**
 * Secure Storage Utility
 * 
 * Provides methods for securely storing sensitive data like API keys
 * in browser localStorage with encryption.
 */

// Simple encryption key based on a combination of browser info
// This isn't military-grade security but adds a layer of obfuscation
const getEncryptionKey = (): string => {
  const browserInfo = navigator.userAgent + navigator.language;
  let hash = 0;
  
  for (let i = 0; i < browserInfo.length; i++) {
    const char = browserInfo.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Create a string from the hash
  return 'marketplace-' + Math.abs(hash).toString(16);
};

/**
 * Simple XOR encryption/decryption
 * Not suitable for truly sensitive data but adequate for client-side obfuscation
 */
const encrypt = (text: string, key: string): string => {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return btoa(result); // Base64 encode
};

/**
 * Decrypt text that was encrypted with the encrypt function
 */
const decrypt = (encryptedText: string, key: string): string => {
  try {
    const text = atob(encryptedText); // Base64 decode
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
  } catch (error) {
    console.error('Error decrypting data:', error);
    return '';
  }
};

/**
 * Securely store a value in localStorage
 */
export const secureStore = (key: string, value: string): void => {
  try {
    if (!value) {
      localStorage.removeItem(`secure_${key}`);
      return;
    }
    
    const encryptionKey = getEncryptionKey();
    const encryptedValue = encrypt(value, encryptionKey);
    localStorage.setItem(`secure_${key}`, encryptedValue);
  } catch (error) {
    console.error('Error securely storing data:', error);
  }
};

/**
 * Retrieve and decrypt a value from localStorage
 */
export const secureRetrieve = (key: string): string => {
  try {
    const encryptedValue = localStorage.getItem(`secure_${key}`);
    if (!encryptedValue) return '';
    
    const encryptionKey = getEncryptionKey();
    return decrypt(encryptedValue, encryptionKey);
  } catch (error) {
    console.error('Error retrieving secure data:', error);
    return '';
  }
};

/**
 * Remove a securely stored value from localStorage
 */
export const secureRemove = (key: string): void => {
  localStorage.removeItem(`secure_${key}`);
}; 