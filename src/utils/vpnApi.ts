import { Platform } from 'react-native';
import { getDecryptedValue, STORAGE_KEYS } from './encryption';

// Функция для получения конфигурационного файла OpenVPN
export const fetchOpenVpnConfig = async (): Promise<string> => {
  try {
    // Получаем расшифрованный адрес сервера и пароль администратора
    const serverAddress = await getDecryptedValue(STORAGE_KEYS.SERVER_ADDRESS);
    const adminPassword = await getDecryptedValue(STORAGE_KEYS.ADMIN_PASSWORD);
    
    // Формируем URL для запроса
    const apiUrl = `https://${serverAddress}/api/`;
    
    console.log('Отправка запроса к:', apiUrl);
    
    // Отправляем запрос к API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Добавляем заголовки аутентификации
        'X-VPNADMIN-HUBNAME': '', // Пустая строка для режима администратора всего сервера
        'X-VPNADMIN-PASSWORD': adminPassword,
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "rpc_call_id",
        method: "MakeOpenVpnConfigFile",
        params: {}
      }),
    });
    
    // Проверяем ответ
    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }
    
    // Парсим JSON ответ
    const data = await response.json();
    
    // Проверяем наличие ошибок в ответе JSON-RPC
    if (data.error) {
      throw new Error(`Ошибка JSON-RPC: ${data.error.message}`);
    }
    
    // Проверяем наличие результата и буфера конфигурации
    if (data.result && data.result.Buffer_bin) {
      return data.result.Buffer_bin; // Возвращаем Base64-закодированный конфиг
    } else {
      throw new Error('Не удалось получить конфигурационный файл');
    }
  } catch (error) {
    console.error('Ошибка при получении конфигурации OpenVPN:', error);
    throw error;
  }
};

// Функция для подключения к VPN
export const connectToVpn = async (profileId: string, configFile: string | undefined = undefined): Promise<boolean> => {
  try {
    // Если конфигурационный файл не предоставлен и это OpenVPN, получаем его
    if (!configFile) {
      configFile = await fetchOpenVpnConfig();
    }
    
    // Здесь должен быть код для подключения к VPN с использованием нативных API
    // В демонстрационных целях просто имитируем задержку
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Возвращаем успешный результат
    return true;
  } catch (error) {
    console.error('Ошибка при подключении к VPN:', error);
    throw error;
  }
};

// Функция для отключения от VPN
export const disconnectFromVpn = async (): Promise<boolean> => {
  try {
    // Здесь должен быть код для отключения от VPN с использованием нативных API
    // В демонстрационных целях просто имитируем задержку
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Возвращаем успешный результат
    return true;
  } catch (error) {
    console.error('Ошибка при отключении от VPN:', error);
    throw error;
  }
};