import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Keys for storing encrypted data
export const SECURE_KEYS = {
  SERVER_ADDRESS: 'secure_server_address',
  IPSEC_KEY: 'secure_ipsec_key',
  ADMIN_PASSWORD: 'secure_admin_password',
  DEFAULT_USERNAME: 'secure_default_username',
  DEFAULT_PASSWORD: 'secure_default_password',
};

// Default values for initialization
const DEFAULT_VALUES = {
  [SECURE_KEYS.SERVER_ADDRESS]: 'vpn531274254.softether.net',
  [SECURE_KEYS.IPSEC_KEY]: 'home-vpn',
  [SECURE_KEYS.ADMIN_PASSWORD]: '123test',
  [SECURE_KEYS.DEFAULT_USERNAME]: 'vpnuser',
  [SECURE_KEYS.DEFAULT_PASSWORD]: 'vpnpass',
};

// Simple encryption function for demonstration purposes
// In a real app, use more secure encryption methods
export const encrypt = (text: string): string => {
  // Simple Base64 encryption
  try {
    // Use different approaches for Base64 in web and React Native
    if (Platform.OS === 'web' && typeof btoa === 'function') {
      return btoa(encodeURIComponent(text));
    } else {
      // For React Native without btoa
      return text.split('').map(char => char.charCodeAt(0).toString(16)).join('');
    }
  } catch (error) {
    console.error('Encryption error:', error);
    return '';
  }
};

export const decrypt = (encryptedText: string): string => {
  // Base64 decryption
  try {
    // Use different approaches for Base64 in web and React Native
    if (Platform.OS === 'web' && typeof atob === 'function') {
      return decodeURIComponent(atob(encryptedText));
    } else {
      // For React Native without atob
      const hexPairs = encryptedText.match(/.{1,2}/g) || [];
      return hexPairs.map(hex => String.fromCharCode(parseInt(hex, 16))).join('');
    }
  } catch (error) {
    console.error('Decryption error:', error);
    return '';
  }
};

// Save encrypted values
export const saveSecureValue = async (key: string, value: string): Promise<void> => {
  try {
    const encryptedValue = encrypt(value);
    await AsyncStorage.setItem(key, encryptedValue);
  } catch (error) {
    console.error('Error saving encrypted value:', error);
    throw error;
  }
};

// Get decrypted values
export const getSecureValue = async (key: string): Promise<string> => {
  try {
    const encryptedValue = await AsyncStorage.getItem(key);
    if (encryptedValue) {
      return decrypt(encryptedValue);
    }
    return '';
  } catch (error) {
    console.error('Error getting encrypted value:', error);
    throw error;
  }
};

// Initialize default values
export const initializeSecureStorage = async (): Promise<void> => {
  try {
    // Check and set default values for all keys
    for (const [key, defaultValue] of Object.entries(DEFAULT_VALUES)) {
      const existingValue = await AsyncStorage.getItem(key);
      if (!existingValue) {
        await saveSecureValue(key, defaultValue);
      }
    }
  } catch (error) {
    console.error('Error initializing secure storage:', error);
    throw error;
  }
};