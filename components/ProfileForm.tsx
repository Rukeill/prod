import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Switch,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Shield, Key, Info } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { VpnProfile, VpnProtocol } from '@/types/vpn';
import { useThemeStore } from '@/store/themeStore';
import { decrypt } from '@/utils/secureStorage';
import { getSecureValue, SECURE_KEYS } from '@/utils/secureStorage';
import { getOpenVPNConfig } from '@/utils/vpnApi';

interface ProfileFormProps {
  initialProfile?: VpnProfile;
  onSave: (profile: VpnProfile) => void;
}

export default function ProfileForm({ initialProfile, onSave }: ProfileFormProps) {
  const router = useRouter();
  const { colors } = useThemeStore();
  const isEditing = !!initialProfile;
  
  const [name, setName] = useState(initialProfile?.name || '');
  const [protocol, setProtocol] = useState<VpnProtocol>(initialProfile?.protocol || 'openvpn');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [serverAddress, setServerAddress] = useState('');
  const [configFile, setConfigFile] = useState('');
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  
  // Проверяем, работаем ли мы на мобильной платформе
  const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';
  
  // Загружаем адрес сервера при монтировании компонента
  useEffect(() => {
    const loadServerAddress = async () => {
      const address = await getSecureValue(SECURE_KEYS.SERVER_ADDRESS);
      setServerAddress(address);
    };
    
    loadServerAddress();
  }, []);
  
  // Расшифровываем данные при редактировании
  useEffect(() => {
    if (initialProfile) {
      if (initialProfile.username) {
        setUsername(decrypt(initialProfile.username));
      }
      if (initialProfile.password) {
        setPassword(decrypt(initialProfile.password));
      }
      if (initialProfile.configFile) {
        setConfigFile(decrypt(initialProfile.configFile));
      }
    }
  }, [initialProfile]);
  
  // Загружаем конфигурацию OpenVPN при смене протокола на OpenVPN
  useEffect(() => {
    if (protocol === 'openvpn' && !configFile && !isEditing) {
      loadOpenVPNConfig();
    }
  }, [protocol]);
  
  const loadOpenVPNConfig = async () => {
    // Проверяем, что мы на мобильной платформе
    if (!isMobile) {
      Alert.alert('Не поддерживается', 'Загрузка конфигурации OpenVPN не поддерживается в веб-версии.');
      return;
    }
    
    setIsLoadingConfig(true);
    try {
      const config = await getOpenVPNConfig();
      setConfigFile(config);
      
      if (isMobile) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
          .catch(console.error);
      }
    } catch (error) {
      console.error('Не удалось загрузить конфигурацию OpenVPN:', error);
      Alert.alert(
        'Ошибка загрузки конфигурации',
        error instanceof Error ? error.message : 'Не удалось загрузить конфигурацию OpenVPN с сервера'
      );
    } finally {
      setIsLoadingConfig(false);
    }
  };
  
  const handleProtocolChange = (newProtocol: VpnProtocol) => {
    if (isMobile) {
      Haptics.selectionAsync().catch(console.error);
    }
    setProtocol(newProtocol);
  };
  
  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, введите имя профиля');
      return false;
    }
    
    if (protocol === 'openvpn' && !configFile) {
      Alert.alert('Ошибка', 'Конфигурация OpenVPN не загружена. Попробуйте еще раз.');
      return false;
    }
    
    return true;
  };
  
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    
    // Получаем предварительно настроенный ключ IPsec для L2TP
    const ipsecPreSharedKey = protocol === 'l2tp' ? await getSecureValue(SECURE_KEYS.IPSEC_KEY) : undefined;
    
    const profile: VpnProfile = {
      id: initialProfile?.id || Date.now().toString(),
      name,
      protocol,
      username: username || undefined,
      password: password || undefined,
      configFile: protocol === 'openvpn' ? configFile : undefined,
      ipsecPreSharedKey: protocol === 'l2tp' ? ipsecPreSharedKey : undefined,
    };
    
    onSave(profile);
    
    if (isMobile) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(console.error);
    }
    
    router.back();
  };
  
  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]}>
          <Shield size={24} color={colors.primary} />
        </View>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          {isEditing ? 'Редактировать VPN профиль' : 'Новый VPN профиль'}
        </Text>
      </View>
      
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.text.secondary }]}>Имя профиля</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.card, 
            borderColor: colors.border,
            color: colors.text.primary
          }]}
          value={name}
          onChangeText={setName}
          placeholder="Мой VPN профиль"
          placeholderTextColor={colors.text.disabled}
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.text.secondary }]}>Протокол</Text>
        <View style={[styles.protocolSelector, { 
          backgroundColor: colors.card,
          borderColor: colors.border
        }]}>
          <TouchableOpacity
            style={[
              styles.protocolButton,
              protocol === 'openvpn' && [styles.protocolButtonActive, { backgroundColor: colors.primary }],
            ]}
            onPress={() => handleProtocolChange('openvpn')}
          >
            <Text
              style={[
                styles.protocolButtonText,
                { color: colors.text.secondary },
                protocol === 'openvpn' && [styles.protocolButtonTextActive, { color: colors.text.primary }],
              ]}
            >
              OpenVPN
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.protocolButton,
              protocol === 'l2tp' && [styles.protocolButtonActive, { backgroundColor: colors.primary }],
            ]}
            onPress={() => handleProtocolChange('l2tp')}
          >
            <Text
              style={[
                styles.protocolButtonText,
                { color: colors.text.secondary },
                protocol === 'l2tp' && [styles.protocolButtonTextActive, { color: colors.text.primary }],
              ]}
            >
              L2TP/IPsec
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {protocol === 'openvpn' && (
        <>
          <View style={[styles.infoBox, { backgroundColor: `${colors.primary}10` }]}>
            <Info size={16} color={colors.text.secondary} />
            <Text style={[styles.infoText, { color: colors.text.secondary }]}>
              OpenVPN подключения управляются напрямую через приложение. 
              Конфигурация автоматически загружается с сервера.
            </Text>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text.secondary }]}>Статус конфигурации</Text>
            <View style={[styles.configStatus, { 
              backgroundColor: colors.card, 
              borderColor: colors.border 
            }]}>
              {isLoadingConfig ? (
                <>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={[styles.configStatusText, { color: colors.text.secondary }]}>
                    Загрузка конфигурации...
                  </Text>
                </>
              ) : configFile ? (
                <>
                  <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
                  <Text style={[styles.configStatusText, { color: colors.text.primary }]}>
                    Конфигурация загружена
                  </Text>
                </>
              ) : (
                <>
                  <View style={[styles.statusDot, { backgroundColor: colors.error }]} />
                  <Text style={[styles.configStatusText, { color: colors.text.primary }]}>
                    Конфигурация не загружена
                  </Text>
                  <TouchableOpacity
                    style={[styles.retryButton, { backgroundColor: colors.primary }]}
                    onPress={loadOpenVPNConfig}
                  >
                    <Text style={[styles.retryButtonText, { color: colors.text.primary }]}>
                      Повторить
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </>
      )}
      
      {protocol === 'l2tp' && (
        <>
          <View style={[styles.infoBox, { backgroundColor: `${colors.primary}10` }]}>
            <Info size={16} color={colors.text.secondary} />
            <Text style={[styles.infoText, { color: colors.text.secondary }]}>
              L2TP/IPsec подключения управляются через системные настройки VPN вашего устройства. 
              Приложение поможет создать профиль и предоставит инструкции по подключению.
            </Text>
          </View>
          
          <Text style={[styles.serverInfo, { color: colors.text.secondary }]}>
            Сервер: {serverAddress}
          </Text>
        </>
      )}
      
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.text.secondary }]}>Логин (опционально)</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.card, 
            borderColor: colors.border,
            color: colors.text.primary
          }]}
          value={username}
          onChangeText={setUsername}
          placeholder="Логин"
          placeholderTextColor={colors.text.disabled}
          autoCapitalize="none"
        />
      </View>
      
      <View style={styles.formGroup}>
        <View style={styles.passwordHeader}>
          <Text style={[styles.label, { color: colors.text.secondary }]}>Пароль (опционально)</Text>
          <View style={styles.showPasswordContainer}>
            <Text style={[styles.showPasswordText, { color: colors.text.secondary }]}>Показать</Text>
            <Switch
              value={showPassword}
              onValueChange={setShowPassword}
              trackColor={{ false: colors.border, true: `${colors.primary}80` }}
              thumbColor={showPassword ? colors.primary : colors.text.disabled}
            />
          </View>
        </View>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.card, 
            borderColor: colors.border,
            color: colors.text.primary
          }]}
          value={password}
          onChangeText={setPassword}
          placeholder="Пароль"
          placeholderTextColor={colors.text.disabled}
          secureTextEntry={!showPassword}
        />
      </View>
      
      <TouchableOpacity
        style={[styles.saveButton, { backgroundColor: colors.primary }]}
        onPress={handleSave}
        disabled={isLoadingConfig}
      >
        <Text style={[styles.saveButtonText, { color: colors.text.primary }]}>Сохранить профиль</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  protocolSelector: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  protocolButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  protocolButtonActive: {},
  protocolButtonText: {
    fontWeight: '500',
  },
  protocolButtonTextActive: {},
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  showPasswordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  showPasswordText: {
    fontSize: 14,
  },
  infoBox: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    gap: 8,
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 14,
    flex: 1,
  },
  configStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  configStatusText: {
    fontSize: 14,
    flex: 1,
  },
  retryButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  retryButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  saveButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  serverInfo: {
    fontSize: 14,
    marginTop: 8,
    marginBottom: 20,
    fontStyle: 'italic',
  },
});