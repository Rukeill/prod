import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Shield, Settings, ExternalLink, Trash2 } from 'lucide-react-native';
import { useVpnStore } from '@/store/vpnStore';
import { useThemeStore } from '@/store/themeStore';
import { VpnProfile } from '@/types/vpn';
import StatusIndicator from './StatusIndicator';
import ConnectionButton from './ConnectionButton';
import { decrypt } from '@/utils/secureStorage';
import * as Haptics from 'expo-haptics';

interface ProfileCardProps {
  profile: VpnProfile;
}

export default function ProfileCard({ profile }: ProfileCardProps) {
  const router = useRouter();
  const { connection, connect, disconnect, deleteProfile } = useVpnStore();
  const { colors } = useThemeStore();
  
  const isCurrentProfile = connection.profileId === profile.id;
  const status = isCurrentProfile ? connection.status : 'disconnected';
  const isOpenVPN = profile.protocol === 'openvpn';
  const isL2tp = profile.protocol === 'l2tp';
  
  // Расшифровываем имя пользователя для отображения
  const decryptedUsername = profile.username ? decrypt(profile.username) : '';
  
  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(console.error);
    }
    router.push(`/profile/${profile.id}`);
  };
  
  const handleConnectionToggle = () => {
    if (isCurrentProfile && connection.status === 'connected') {
      disconnect().catch(error => {
        console.error('Не удалось отключиться:', error);
        Alert.alert('Ошибка', 'Не удалось отключиться от VPN');
      });
    } else {
      connect(profile.id).catch(error => {
        console.error('Не удалось подключиться:', error);
        Alert.alert('Ошибка', 'Не удалось подключиться к VPN');
      });
    }
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
  
  const handleDeleteProfile = () => {
    Alert.alert(
      'Удалить профиль',
      `Вы уверены, что хотите удалить профиль "${profile.name}"?`,
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
              await deleteProfile(profile.id);
              
              if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
                  .catch(console.error);
              }
            } catch (error) {
              console.error('Не удалось удалить профиль:', error);
              Alert.alert('Ошибка', 'Не удалось удалить профиль');
            }
          },
        },
      ]
    );
  };
  
  return (
    <TouchableOpacity
      style={[styles.container, { 
        backgroundColor: colors.card, 
        borderColor: colors.border 
      }]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: '#121212' }]}>
          <Shield size={20} color={colors.primary} />
        </View>
        <Text style={[styles.name, { color: colors.text.primary }]} numberOfLines={1}>
          {profile.name}
        </Text>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={handlePress}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Settings size={16} color={colors.icon} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.details}>
        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: colors.text.secondary }]}>Протокол:</Text>
          <Text style={[styles.value, { color: colors.text.primary }]}>
            {profile.protocol === 'openvpn' ? 'OpenVPN' : 'L2TP/IPsec'}
          </Text>
        </View>
        
        {decryptedUsername && (
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: colors.text.secondary }]}>Логин:</Text>
            <Text style={[styles.value, { color: colors.text.primary }]} numberOfLines={1}>
              {decryptedUsername}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.footer}>
        <StatusIndicator status={status} />
        
        <View style={styles.actionButtons}>
          {isL2tp && Platform.OS !== 'web' && (
            <TouchableOpacity
              style={[styles.systemButton, { borderColor: colors.border }]}
              onPress={handleOpenSystemSettings}
            >
              <ExternalLink size={14} color={colors.text.secondary} />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.deleteButton, { borderColor: colors.error }]}
            onPress={handleDeleteProfile}
          >
            <Trash2 size={14} color={colors.error} />
          </TouchableOpacity>
          
          <ConnectionButton
            status={status}
            onPress={handleConnectionToggle}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  settingsButton: {
    padding: 4,
  },
  details: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    width: 80,
  },
  value: {
    fontSize: 14,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  systemButton: {
    backgroundColor: 'transparent',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: 'transparent',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});