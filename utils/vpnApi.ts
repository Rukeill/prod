import { Platform, Alert, Linking } from 'react-native';
import * as Haptics from 'expo-haptics';
import { getSecureValue, SECURE_KEYS } from '@/utils/secureStorage';

// Интеграция с OpenVPN
let RNSimpleOpenvpn: any = null;

// Динамически импортируем библиотеку OpenVPN только на мобильных платформах
if (Platform.OS === 'ios' || Platform.OS === 'android') {
  try {
    RNSimpleOpenvpn = require('react-native-simple-openvpn');
  } catch (error) {
    console.warn('Библиотека OpenVPN недоступна:', error);
  }
}

// Проверяем, работаем ли мы на веб-платформе
const isWeb = Platform.OS === 'web';

// Функция для получения конфигурации OpenVPN с сервера
export const getOpenVPNConfig = async (): Promise<string> => {
  try {
    const serverAddress = await getSecureValue(SECURE_KEYS.SERVER_ADDRESS);
    const adminPassword = await getSecureValue(SECURE_KEYS.ADMIN_PASSWORD);
    
    if (!serverAddress || !adminPassword) {
      throw new Error('Не настроены параметры сервера');
    }
    
    const response = await fetch(`https://${serverAddress}/api/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VPNADMIN-PASSWORD': adminPassword,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: '1',
        method: 'MakeOpenVpnConfigFile',
        params: {}
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Ошибка сервера: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(`Ошибка API: ${data.error.message}`);
    }
    
    if (!data.result || !data.result.Buffer_bin) {
      throw new Error('Неверный формат ответа сервера');
    }
    
    // Декодируем содержимое base64
    const decodedContent = atob(data.result.Buffer_bin);
    
    // Разбиваем на строки и извлекаем строки 2091-2269 (с индексом 0: 2090-2268)
    const lines = decodedContent.split('\n');
    const configLines = lines.slice(2090, 2269);
    
    // Заменяем "proto udp" на "proto tcp"
    const configContent = configLines
      .join('\n')
      .replace(/proto udp/g, 'proto tcp');
    
    return configContent;
  } catch (error) {
    console.error('Ошибка получения конфигурации OpenVPN:', error);
    throw error;
  }
};

// Функция для запроса разрешений VPN
export const requestVpnPermissions = async (): Promise<boolean> => {
  if (isWeb) {
    Alert.alert('Не поддерживается', 'VPN не поддерживается в веб-версии.');
    return false;
  }

  if (Platform.OS === 'ios') {
    return new Promise((resolve) => {
      Alert.alert(
        'Разрешение VPN',
        'Для использования VPN, приложению требуется разрешение на создание VPN-конфигураций.',
        [
          {
            text: 'Отмена',
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: 'Разрешить',
            onPress: () => resolve(true),
          },
        ]
      );
    });
  } else if (Platform.OS === 'android') {
    return new Promise((resolve) => {
      Alert.alert(
        'Разрешение VPN',
        'Для использования VPN, приложению требуется разрешение на создание VPN-подключений.',
        [
          {
            text: 'Отмена',
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: 'Разрешить',
            onPress: () => resolve(true),
          },
        ]
      );
    });
  }
  
  return false;
};

// Функция для подключения к OpenVPN
export const connectToOpenVPN = async (
  profileName: string,
  configFile: string,
  username?: string,
  password?: string
): Promise<boolean> => {
  if (isWeb) {
    Alert.alert('Не поддерживается', 'OpenVPN не поддерживается в веб-версии.');
    return false;
  }

  if (!RNSimpleOpenvpn) {
    Alert.alert(
      'OpenVPN недоступен',
      'Библиотека OpenVPN не установлена. Убедитесь, что react-native-simple-openvpn правильно настроена.',
      [{ text: 'OK' }]
    );
    return false;
  }

  try {
    // Сначала запрашиваем разрешения
    const permissionGranted = await requestVpnPermissions();
    if (!permissionGranted) {
      return false;
    }

    // Подготавливаем конфигурацию OpenVPN
    const vpnConfig = {
      config: configFile,
      username: username || '',
      password: password || '',
      name: profileName,
    };

    // Запускаем подключение OpenVPN
    await RNSimpleOpenvpn.connect(vpnConfig);
    
    if (!isWeb) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        .catch(console.error);
    }

    return true;
  } catch (error) {
    console.error('Ошибка подключения OpenVPN:', error);
    Alert.alert(
      'Ошибка подключения OpenVPN',
      error instanceof Error ? error.message : 'Неизвестная ошибка'
    );
    return false;
  }
};

// Функция для отключения от OpenVPN
export const disconnectFromOpenVPN = async (): Promise<boolean> => {
  if (isWeb) {
    Alert.alert('Не поддерживается', 'OpenVPN не поддерживается в веб-версии.');
    return false;
  }

  if (!RNSimpleOpenvpn) {
    Alert.alert('OpenVPN недоступен', 'Библиотека OpenVPN не установлена.');
    return false;
  }

  try {
    await RNSimpleOpenvpn.disconnect();
    
    if (!isWeb) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        .catch(console.error);
    }

    return true;
  } catch (error) {
    console.error('Ошибка отключения OpenVPN:', error);
    Alert.alert(
      'Ошибка отключения OpenVPN',
      error instanceof Error ? error.message : 'Неизвестная ошибка'
    );
    return false;
  }
};

// Функция для получения статуса подключения OpenVPN
export const getOpenVPNStatus = async (): Promise<string> => {
  if (isWeb || !RNSimpleOpenvpn) {
    return 'disconnected';
  }

  try {
    const status = await RNSimpleOpenvpn.getStatus();
    return status;
  } catch (error) {
    console.error('Ошибка получения статуса OpenVPN:', error);
    return 'disconnected';
  }
};

// Функция для создания профиля L2TP/IPsec в системных настройках
export const createL2TPProfile = async (
  profileName: string,
  serverAddress: string,
  username?: string,
  password?: string,
  ipsecPreSharedKey?: string
): Promise<boolean> => {
  if (isWeb) {
    Alert.alert('Не поддерживается', 'L2TP/IPsec не поддерживается в веб-версии.');
    return false;
  }

  if (Platform.OS === 'ios') {
    Alert.alert(
      'Создание L2TP/IPsec профиля',
      `Для создания VPN-профиля "${profileName}" на iOS:

1. Откройте Настройки > VPN и управление устройством
2. Нажмите "VPN"
3. Нажмите "Добавить конфигурацию VPN"
4. Выберите "L2TP"
5. Введите данные:
   - Описание: ${profileName}
   - Сервер: ${serverAddress}
   - Учетная запись: ${username || 'не указано'}
   - Пароль: ${password ? '••••••••' : 'не указан'}
   - Общий ключ: ${ipsecPreSharedKey || 'не указан'}`,
      [
        {
          text: 'Открыть настройки VPN',
          onPress: async () => {
            try {
              await Linking.openURL('app-settings:');
            } catch (error) {
              console.error('Не удалось открыть настройки:', error);
            }
          },
        },
        {
          text: 'Отмена',
          style: 'cancel',
        }
      ]
    );
  } else if (Platform.OS === 'android') {
    Alert.alert(
      'Создание L2TP/IPsec профиля',
      `Для создания VPN-профиля "${profileName}" на Android:

1. Откройте Настройки > Сеть и интернет > VPN
2. Нажмите "+" или "Добавить VPN"
3. Введите данные:
   - Название: ${profileName}
   - Тип: L2TP/IPSec PSK
   - Адрес сервера: ${serverAddress}
   - Общий ключ IPSec: ${ipsecPreSharedKey || 'не указан'}
   - Имя пользователя: ${username || 'не указано'}
   - Пароль: ${password ? '••••••••' : 'не указан'}`,
      [
        {
          text: 'Открыть настройки VPN',
          onPress: async () => {
            try {
              await Linking.openSettings();
            } catch (error) {
              console.error('Не удалось открыть настройки:', error);
            }
          },
        },
        {
          text: 'Отмена',
          style: 'cancel',
        }
      ]
    );
  }

  return false;
};

// Функция для подключения к L2TP VPN - только показывает инструкции
export const connectToL2TP = async (
  profileName: string,
  serverAddress: string,
  username?: string,
  password?: string,
  ipsecPreSharedKey?: string
): Promise<boolean> => {
  if (isWeb) {
    Alert.alert('Не поддерживается', 'L2TP/IPsec не поддерживается в веб-версии.');
    return false;
  }

  // Показываем инструкции для ручной настройки L2TP
  await createL2TPProfile(profileName, serverAddress, username, password, ipsecPreSharedKey);
  return false;
};

// Функция для отключения от VPN - только показывает инструкции
export const disconnectFromVPN = async (): Promise<boolean> => {
  if (isWeb) {
    Alert.alert('Не поддерживается', 'VPN не поддерживается в веб-версии.');
    return false;
  }

  if (Platform.OS === 'ios') {
    Alert.alert(
      'Отключение VPN',
      `Для отключения VPN:

1. Откройте Настройки > VPN и управление устройством > VPN
2. Переключите тумблер активного подключения

Или используйте переключатель VPN в Пункте управления.`,
      [
        {
          text: 'Открыть настройки',
          onPress: async () => {
            try {
              await Linking.openURL('app-settings:');
            } catch (error) {
              console.error('Не удалось открыть настройки:', error);
            }
          },
        },
        {
          text: 'OK',
          style: 'cancel',
        }
      ]
    );
  } else if (Platform.OS === 'android') {
    Alert.alert(
      'Отключение VPN',
      `Для отключения VPN:

1. Откройте Настройки > Сеть и интернет > VPN
2. Нажмите на активное подключение
3. Нажмите "Отключить"

Или используйте уведомление VPN в панели уведомлений.`,
      [
        {
          text: 'Открыть настройки',
          onPress: async () => {
            try {
              await Linking.openSettings();
            } catch (error) {
              console.error('Не удалось открыть настройки:', error);
            }
          },
        },
        {
          text: 'OK',
          style: 'cancel',
        }
      ]
    );
  }

  return false;
};

// Функция для показа уведомления об успешном подключении
export const showConnectionSuccessNotification = (profileName: string) => {
  if (!isWeb) {
    Alert.alert(
      'Подключение установлено',
      `Профиль "${profileName}" успешно подключен.`,
      [{ text: 'OK' }]
    );
    
    // Вибрационная обратная связь
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      .catch(console.error);
  }
};