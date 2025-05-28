import AsyncStorage from '@react-native-async-storage/async-storage';

// Простая функция шифрования для демонстрационных целей
// В реальном приложении следует использовать более надежные методы шифрования
export const encrypt = (text: string): string => {
  // Простое шифрование с использованием Base64
  try {
    // Для веб и React Native используем разные подходы к Base64
    if (typeof btoa === 'function') {
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
  // Расшифровка из Base64
  try {
    // Для веб и React Native используем разные подходы к Base64
    if (typeof atob === 'function') {
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

// Ключи для хранения зашифрованных данных
export const STORAGE_KEYS = {
  SERVER_ADDRESS: 'encrypted_server_address',
  IPSEC_KEY: 'encrypted_ipsec_key',
  ADMIN_PASSWORD: 'encrypted_admin_password', // Ключ для пароля администратора
};

// Сохранение зашифрованных значений
export const saveEncryptedValue = async (key: string, value: string): Promise<void> => {
  try {
    const encryptedValue = encrypt(value);
    await AsyncStorage.setItem(key, encryptedValue);
  } catch (error) {
    console.error('Ошибка сохранения зашифрованного значения:', error);
  }
};

// Получение расшифрованных значений
export const getDecryptedValue = async (key: string): Promise<string> => {
  try {
    const encryptedValue = await AsyncStorage.getItem(key);
    if (encryptedValue) {
      return decrypt(encryptedValue);
    }
    return '';
  } catch (error) {
    console.error('Ошибка получения расшифрованного значения:', error);
    return '';
  }
};

// Инициализация значений по умолчанию
export const initializeDefaultValues = async (): Promise<void> => {
  try {
    // Проверяем, существуют ли уже значения
    const serverAddress = await AsyncStorage.getItem(STORAGE_KEYS.SERVER_ADDRESS);
    const ipsecKey = await AsyncStorage.getItem(STORAGE_KEYS.IPSEC_KEY);
    const adminPassword = await AsyncStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORD);
    
    // Если нет, устанавливаем значения по умолчанию
    if (!serverAddress) {
      await saveEncryptedValue(STORAGE_KEYS.SERVER_ADDRESS, 'vpn531274254.softether.net');
    }
    
    if (!ipsecKey) {
      await saveEncryptedValue(STORAGE_KEYS.IPSEC_KEY, 'home-vpn');
    }
    
    // Устанавливаем пароль администратора по умолчанию
    // В реальном приложении этот пароль должен быть установлен пользователем
    if (!adminPassword) {
      await saveEncryptedValue(STORAGE_KEYS.ADMIN_PASSWORD, 'vpn-admin-password');
    }
  } catch (error) {
    console.error('Ошибка инициализации значений по умолчанию:', error);
  }
};