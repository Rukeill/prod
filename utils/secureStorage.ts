import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Ключи для хранения зашифрованных данных
export const SECURE_KEYS = {
  SERVER_ADDRESS: 'secure_server_address',
  IPSEC_KEY: 'secure_ipsec_key',
  ADMIN_PASSWORD: 'secure_admin_password',
  DEFAULT_USERNAME: 'secure_default_username',
  DEFAULT_PASSWORD: 'secure_default_password',
};

// Значения по умолчанию для инициализации
const DEFAULT_VALUES = {
  [SECURE_KEYS.SERVER_ADDRESS]: 'vpn531274254.softether.net',
  [SECURE_KEYS.IPSEC_KEY]: 'home-vpn',
  [SECURE_KEYS.ADMIN_PASSWORD]: '123test',
  [SECURE_KEYS.DEFAULT_USERNAME]: 'vpnuser',
  [SECURE_KEYS.DEFAULT_PASSWORD]: 'vpnpass',
};

// Простая функция шифрования для демонстрационных целей
// В реальном приложении используйте более безопасные методы шифрования
export const encrypt = (text: string): string => {
  // Простое шифрование Base64
  try {
    // Используем разные подходы для Base64 в веб и React Native
    if (Platform.OS === 'web' && typeof btoa === 'function') {
      return btoa(encodeURIComponent(text));
    } else {
      // Для React Native без btoa
      return text.split('').map(char => char.charCodeAt(0).toString(16)).join('');
    }
  } catch (error) {
    console.error('Ошибка шифрования:', error);
    return '';
  }
};

export const decrypt = (encryptedText: string): string => {
  // Расшифровка Base64
  try {
    // Используем разные подходы для Base64 в веб и React Native
    if (Platform.OS === 'web' && typeof atob === 'function') {
      return decodeURIComponent(atob(encryptedText));
    } else {
      // Для React Native без atob
      const hexPairs = encryptedText.match(/.{1,2}/g) || [];
      return hexPairs.map(hex => String.fromCharCode(parseInt(hex, 16))).join('');
    }
  } catch (error) {
    console.error('Ошибка расшифровки:', error);
    return '';
  }
};

// Сохранение зашифрованных значений
export const saveSecureValue = async (key: string, value: string): Promise<void> => {
  try {
    const encryptedValue = encrypt(value);
    await AsyncStorage.setItem(key, encryptedValue);
  } catch (error) {
    console.error('Ошибка сохранения зашифрованного значения:', error);
    throw error;
  }
};

// Получение расшифрованных значений
export const getSecureValue = async (key: string): Promise<string> => {
  try {
    const encryptedValue = await AsyncStorage.getItem(key);
    if (encryptedValue) {
      return decrypt(encryptedValue);
    }
    return '';
  } catch (error) {
    console.error('Ошибка получения зашифрованного значения:', error);
    throw error;
  }
};

// Инициализация значений по умолчанию
export const initializeSecureStorage = async (): Promise<void> => {
  try {
    // Проверяем и устанавливаем значения по умолчанию для всех ключей
    for (const [key, defaultValue] of Object.entries(DEFAULT_VALUES)) {
      const existingValue = await AsyncStorage.getItem(key);
      if (!existingValue) {
        await saveSecureValue(key, defaultValue);
      }
    }
  } catch (error) {
    console.error('Ошибка инициализации безопасного хранилища:', error);
    throw error;
  }
};