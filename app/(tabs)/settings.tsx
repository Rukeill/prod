import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Alert, Platform, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Shield, Info, Trash2, HelpCircle, ExternalLink, Key, ChevronRight, Settings as SettingsIcon } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useVpnStore } from '@/store/vpnStore';
import { useThemeStore } from '@/store/themeStore';
import AppIcon from '@/components/AppIcon';
import { getSecureValue, saveSecureValue, SECURE_KEYS } from '@/utils/secureStorage';

export default function SettingsScreen() {
  const router = useRouter();
  const { profiles, deleteProfile, clearAllProfiles } = useVpnStore();
  const { colors, isDarkMode, toggleTheme } = useThemeStore();
  const [autoConnect, setAutoConnect] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [serverAddress, setServerAddress] = useState('');
  const [ipsecKey, setIpsecKey] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Загружаем настройки при монтировании компонента
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        const address = await getSecureValue(SECURE_KEYS.SERVER_ADDRESS);
        const key = await getSecureValue(SECURE_KEYS.IPSEC_KEY);
        
        setServerAddress(address);
        setIpsecKey(key);
      } catch (error) {
        console.error('Не удалось загрузить настройки:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, []);
  
  const handleToggleAutoConnect = () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync().catch(console.error);
    }
    setAutoConnect(!autoConnect);
  };
  
  const handleToggleDarkMode = () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync().catch(console.error);
    }
    toggleTheme();
  };
  
  const handleToggleNotifications = () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync().catch(console.error);
    }
    setNotifications(!notifications);
  };
  
  const handleChangeServerAddress = () => {
    Alert.prompt(
      'Изменить адрес сервера',
      'Введите новый адрес VPN-сервера',
      [
        {
          text: 'Отмена',
          style: 'cancel',
        },
        {
          text: 'Сохранить',
          onPress: async (value) => {
            if (value && value.trim()) {
              try {
                await saveSecureValue(SECURE_KEYS.SERVER_ADDRESS, value.trim());
                setServerAddress(value.trim());
                
                if (Platform.OS !== 'web') {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
                    .catch(console.error);
                }
              } catch (error) {
                console.error('Не удалось сохранить адрес сервера:', error);
                Alert.alert('Ошибка', 'Не удалось сохранить адрес сервера');
              }
            }
          },
        },
      ],
      'plain-text',
      serverAddress
    );
  };
  
  const handleChangeIpsecKey = () => {
    Alert.prompt(
      'Изменить ключ IPsec',
      'Введите новый предварительный ключ IPsec для L2TP/IPsec подключений',
      [
        {
          text: 'Отмена',
          style: 'cancel',
        },
        {
          text: 'Сохранить',
          onPress: async (value) => {
            if (value && value.trim()) {
              try {
                await saveSecureValue(SECURE_KEYS.IPSEC_KEY, value.trim());
                setIpsecKey(value.trim());
                
                if (Platform.OS !== 'web') {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
                    .catch(console.error);
                }
              } catch (error) {
                console.error('Не удалось сохранить ключ IPsec:', error);
                Alert.alert('Ошибка', 'Не удалось сохранить ключ IPsec');
              }
            }
          },
        },
      ],
      'plain-text',
      ipsecKey
    );
  };
  
  const handleDeleteAllProfiles = () => {
    Alert.alert(
      'Удалить все профили',
      'Вы уверены, что хотите удалить все VPN профили? Это действие нельзя отменить.',
      [
        {
          text: 'Отмена',
          style: 'cancel',
        },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllProfiles();
              
              if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
                  .catch(console.error);
              }
            } catch (error) {
              console.error('Не удалось удалить профили:', error);
              Alert.alert('Ошибка', 'Не удалось удалить профили');
            }
          },
        },
      ],
    );
  };
  
  const handleOpenHelp = () => {
    router.push('/help');
  };
  
  const handleOpenAbout = () => {
    router.push('/about');
  };
  
  const handleOpenSystemSettings = async () => {
    if (Platform.OS === 'ios') {
      try {
        await Linking.openURL('app-settings:');
      } catch (error) {
        console.error('Не удалось открыть настройки:', error);
        Alert.alert('Ошибка', 'Не удалось открыть настройки');
      }
    } else if (Platform.OS === 'android') {
      try {
        await Linking.openSettings();
      } catch (error) {
        console.error('Не удалось открыть настройки:', error);
        Alert.alert('Ошибка', 'Не удалось открыть настройки');
      }
    } else {
      Alert.alert(
        'Системные настройки',
        'Эта функция доступна только на мобильных устройствах.',
        [{ text: 'OK' }]
      );
    }
  };
  
  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <AppIcon size={60} withGradient={true} />
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>SecureVPN</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>Общие</Text>
        
        <View style={[styles.settingItem, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <Text style={[styles.settingLabel, { color: colors.text.primary }]}>Автоподключение при запуске</Text>
          <Switch
            value={autoConnect}
            onValueChange={handleToggleAutoConnect}
            trackColor={{ false: colors.border, true: `${colors.primary}80` }}
            thumbColor={autoConnect ? colors.primary : colors.text.disabled}
          />
        </View>
        
        <View style={[styles.settingItem, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <Text style={[styles.settingLabel, { color: colors.text.primary }]}>Темная тема</Text>
          <Switch
            value={isDarkMode}
            onValueChange={handleToggleDarkMode}
            trackColor={{ false: colors.border, true: `${colors.primary}80` }}
            thumbColor={isDarkMode ? colors.primary : colors.text.disabled}
          />
        </View>
        
        <View style={[styles.settingItem, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <Text style={[styles.settingLabel, { color: colors.text.primary }]}>Уведомления</Text>
          <Switch
            value={notifications}
            onValueChange={handleToggleNotifications}
            trackColor={{ false: colors.border, true: `${colors.primary}80` }}
            thumbColor={notifications ? colors.primary : colors.text.disabled}
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>Настройки сервера</Text>
        
        <TouchableOpacity 
          style={[styles.actionItem, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
          onPress={handleChangeServerAddress}
          disabled={isLoading}
        >
          <Shield size={20} color={colors.text.secondary} />
          <View style={styles.actionContent}>
            <Text style={[styles.actionLabel, { color: colors.text.primary }]}>
              Адрес сервера
            </Text>
            <Text style={[styles.actionValue, { color: colors.text.secondary }]}>
              {isLoading ? 'Загрузка...' : serverAddress}
            </Text>
          </View>
          <ChevronRight size={16} color={colors.text.secondary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionItem, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
          onPress={handleChangeIpsecKey}
          disabled={isLoading}
        >
          <Key size={20} color={colors.text.secondary} />
          <View style={styles.actionContent}>
            <Text style={[styles.actionLabel, { color: colors.text.primary }]}>
              Ключ IPsec
            </Text>
            <Text style={[styles.actionValue, { color: colors.text.secondary }]}>
              {isLoading ? 'Загрузка...' : (ipsecKey ? '••••••••' : 'Не установлен')}
            </Text>
          </View>
          <ChevronRight size={16} color={colors.text.secondary} />
        </TouchableOpacity>
        
        {Platform.OS !== 'web' && (
          <TouchableOpacity 
            style={[styles.actionItem, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
            onPress={handleOpenSystemSettings}
          >
            <SettingsIcon size={20} color={colors.text.secondary} />
            <View style={styles.actionContent}>
              <Text style={[styles.actionLabel, { color: colors.text.primary }]}>
                Системные настройки VPN
              </Text>
              <Text style={[styles.actionValue, { color: colors.text.secondary }]}>
                Управление VPN в настройках устройства
              </Text>
            </View>
            <ExternalLink size={16} color={colors.text.secondary} />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>Управление данными</Text>
        
        <TouchableOpacity 
          style={[styles.actionItem, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
          onPress={handleDeleteAllProfiles}
          disabled={profiles.length === 0}
        >
          <Trash2 size={20} color={profiles.length === 0 ? colors.text.disabled : colors.error} />
          <Text 
            style={[
              styles.actionLabel, 
              { color: profiles.length === 0 ? colors.text.disabled : colors.error }
            ]}
          >
            Удалить все профили
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>Поддержка</Text>
        
        <TouchableOpacity 
          style={[styles.actionItem, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
          onPress={handleOpenHelp}
        >
          <HelpCircle size={20} color={colors.text.secondary} />
          <View style={styles.actionContent}>
            <Text style={[styles.actionLabel, { color: colors.text.primary }]}>
              Помощь и документация
            </Text>
          </View>
          <ChevronRight size={16} color={colors.text.secondary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionItem, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
          onPress={handleOpenAbout}
        >
          <Info size={20} color={colors.text.secondary} />
          <View style={styles.actionContent}>
            <Text style={[styles.actionLabel, { color: colors.text.primary }]}>
              О приложении
            </Text>
          </View>
          <ChevronRight size={16} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.text.secondary }]}>
          SecureVPN v1.0.0
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  settingLabel: {
    fontSize: 16,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  actionContent: {
    flex: 1,
    marginLeft: 12,
  },
  actionLabel: {
    fontSize: 16,
  },
  actionValue: {
    fontSize: 14,
    marginTop: 2,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
  },
});