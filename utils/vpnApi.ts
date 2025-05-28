import { Platform, Alert, Linking } from 'react-native';
import * as Haptics from 'expo-haptics';

// Function to request VPN permissions
export const requestVpnPermissions = async (): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    // On iOS, we need to request permission for VPN configuration
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
            text: 'Открыть настройки',
            onPress: async () => {
              try {
                await Linking.openURL('app-settings:');
                resolve(true);
              } catch (error) {
                console.error('Failed to open settings:', error);
                resolve(false);
              }
            },
          },
        ]
      );
    });
  } else if (Platform.OS === 'android') {
    // On Android, we need to prepare VPN service
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
            text: 'Открыть настройки',
            onPress: async () => {
              try {
                await Linking.openSettings();
                resolve(true);
              } catch (error) {
                console.error('Failed to open settings:', error);
                resolve(false);
              }
            },
          },
        ]
      );
    });
  } else if (Platform.OS === 'web') {
    Alert.alert(
      'Не поддерживается',
      'VPN не поддерживается в веб-версии приложения.',
      [{ text: 'OK' }]
    );
    return false;
  }
  
  return false;
};

// Function to create L2TP/IPsec VPN profile in system settings
export const createL2TPProfile = async (
  profileName: string,
  serverAddress: string,
  username?: string,
  password?: string,
  ipsecPreSharedKey?: string
): Promise<boolean> => {
  if (Platform.OS === 'web') {
    Alert.alert('Не поддерживается', 'VPN не поддерживается в веб-версии.');
    return false;
  }

  // Request permissions first
  const permissionGranted = await requestVpnPermissions();
  if (!permissionGranted) {
    return false;
  }

  if (Platform.OS === 'ios') {
    Alert.alert(
      'Создание L2TP/IPsec профиля',
      `Для создания VPN-профиля "${profileName}" на iOS:\n\n1. Откройте Настройки > VPN\n2. Нажмите "Добавить конфигурацию VPN"\n3. Выберите "L2TP"\n4. Введите данные:\n   - Описание: ${profileName}\n   - Сервер: ${serverAddress}\n   - Учетная запись: ${username || 'не указано'}\n   - Пароль: ${password ? '••••••••' : 'не указан'}\n   - Общий ключ: ${ipsecPreSharedKey || 'не указан'}`,
      [
        {
          text: 'Открыть настройки VPN',
          onPress: async () => {
            try {
              await Linking.openURL('app-settings:');
            } catch (error) {
              console.error('Could not open settings:', error);
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
      `Для создания VPN-профиля "${profileName}" на Android:\n\n1. Откройте Настройки > Сеть и интернет > VPN\n2. Нажмите "+" или "Добавить VPN"\n3. Введите данные:\n   - Название: ${profileName}\n   - Тип: L2TP/IPSec PSK\n   - Адрес сервера: ${serverAddress}\n   - Общий ключ IPSec: ${ipsecPreSharedKey || 'не указан'}\n   - Имя пользователя: ${username || 'не указано'}\n   - Пароль: ${password ? '••••••••' : 'не указан'}`,
      [
        {
          text: 'Открыть настройки VPN',
          onPress: async () => {
            try {
              await Linking.openSettings();
            } catch (error) {
              console.error('Could not open settings:', error);
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

// Function to connect to L2TP VPN
export const connectToL2TP = async (
  profileName: string,
  serverAddress: string,
  username?: string,
  password?: string,
  ipsecPreSharedKey?: string
): Promise<boolean> => {
  if (Platform.OS === 'web') {
    Alert.alert('Не поддерживается', 'VPN не поддерживается в веб-версии.');
    return false;
  }

  // First, try to create the profile
  await createL2TPProfile(profileName, serverAddress, username, password, ipsecPreSharedKey);

  // Show instructions for manual connection
  if (Platform.OS === 'ios') {
    Alert.alert(
      'Подключение к L2TP/IPsec',
      `После создания профиля "${profileName}" в настройках:\n\n1. Откройте Настройки > VPN\n2. Найдите профиль "${profileName}"\n3. Переключите тумблер для подключения\n4. При необходимости введите учетные данные`,
      [{ text: 'Понятно' }]
    );
  } else if (Platform.OS === 'android') {
    Alert.alert(
      'Подключение к L2TP/IPsec',
      `После создания профиля "${profileName}" в настройках:\n\n1. Откройте Настройки > Сеть и интернет > VPN\n2. Найдите профиль "${profileName}"\n3. Нажмите на профиль для подключения\n4. При необходимости введите учетные данные`,
      [{ text: 'Понятно' }]
    );
  }

  return false;
};

// Function to disconnect from VPN
export const disconnectFromVPN = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    Alert.alert('Не поддерживается', 'VPN не поддерживается в веб-версии.');
    return false;
  }

  if (Platform.OS === 'ios') {
    Alert.alert(
      'Отключение VPN',
      'Для отключения VPN:\n\n1. Откройте Настройки > VPN\n2. Переключите тумблер активного подключения\n\nИли используйте переключатель VPN в Пункте управления.',
      [
        {
          text: 'Открыть настройки',
          onPress: async () => {
            try {
              await Linking.openURL('app-settings:');
            } catch (error) {
              console.error('Could not open settings:', error);
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
      'Для отключения VPN:\n\n1. Откройте Настройки > Сеть и интернет > VPN\n2. Нажмите на активное подключение\n3. Нажмите "Отключить"\n\nИли используйте уведомление VPN в панели уведомлений.',
      [
        {
          text: 'Открыть настройки',
          onPress: async () => {
            try {
              await Linking.openSettings();
            } catch (error) {
              console.error('Could not open settings:', error);
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

// Function to show connection success notification
export const showConnectionSuccessNotification = (profileName: string) => {
  if (Platform.OS !== 'web') {
    Alert.alert(
      'Инструкции по подключению',
      `Профиль "${profileName}" готов к использованию. Подключитесь через системные настройки VPN вашего устройства.`,
      [{ text: 'OK' }]
    );
    
    // Vibration feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      .catch(console.error);
  }
};