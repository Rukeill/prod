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
  Alert
} from 'react-native';
import { useNavigation } from 'react-navigation';
import { Shield, Key } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { VpnProfile, VpnProtocol } from '@/types/vpn';
import { useThemeStore } from '@/store/themeStore';
import { decrypt } from '@/utils/encryption';
import { getDecryptedValue, STORAGE_KEYS } from '@/utils/encryption';

interface ProfileFormProps {
  initialProfile?: VpnProfile;
  onSave: (profile: VpnProfile) => void;
}

export default function ProfileForm({ initialProfile, onSave }: ProfileFormProps) {
  const router = useNavigation();
  const { colors } = useThemeStore();
  const isEditing = !!initialProfile;
  
  const [name, setName] = useState(initialProfile?.name || '');
  const [protocol, setProtocol] = useState<VpnProtocol>(initialProfile?.protocol || 'openvpn');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  
  // Расшифровываем данные при редактировании
  useEffect(() => {
    if (initialProfile) {
      if (initialProfile.username) {
        setUsername(decrypt(initialProfile.username));
      }
      if (initialProfile.password) {
        setPassword(decrypt(initialProfile.password));
      }
    }
  }, [initialProfile]);
  
  const handleProtocolChange = (newProtocol: VpnProtocol) => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    setProtocol(newProtocol);
  };
  
  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, введите имя профиля');
      return false;
    }
    
    return true;
  };
  
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    
    // Получаем предустановленный ключ IPsec
    const ipsecPreSharedKey = await getDecryptedValue(STORAGE_KEYS.IPSEC_KEY);
    
    const profile: VpnProfile = {
      id: initialProfile?.id || Date.now().toString(),
      name,
      protocol,
      username: username || undefined,
      password: password || undefined,
      ipsecPreSharedKey: protocol === 'l2tp' ? ipsecPreSharedKey : undefined,
    };
    
    onSave(profile);
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
      
      {protocol === 'l2tp' && (
        <>
          <View style={[styles.infoBox, { backgroundColor: `${colors.primary}10` }]}>
            <Key size={16} color={colors.text.secondary} />
            <Text style={[styles.infoText, { color: colors.text.secondary }]}>
              Подключения L2TP/IPsec управляются системными настройками вашего устройства. 
              Это приложение сохраняет вашу конфигурацию для удобного доступа.
            </Text>
          </View>
          <Text style={[styles.serverInfo, { color: colors.text.secondary }]}>
            Сервер: vpn531274254.softether.net
          </Text>
        </>
      )}
      
      {protocol === 'openvpn' && (
        <Text style={[styles.serverInfo, { color: colors.text.secondary }]}>
          Сервер: vpn531274254.softether.net
        </Text>
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