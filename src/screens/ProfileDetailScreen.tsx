import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useVpnStore } from '@/store/vpnStore';
import { useThemeStore } from '@/store/themeStore';
import { VpnProfile } from '@/types/vpn';
import { Power, Edit, Trash } from 'lucide-react-native';
import { RootStackParamList } from '@/navigation';

type ProfileDetailScreenRouteProp = RouteProp<RootStackParamList, 'ProfileDetail'>;
type ProfileDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ProfileDetail'>;

export default function ProfileDetailScreen() {
  const route = useRoute<ProfileDetailScreenRouteProp>();
  const navigation = useNavigation<ProfileDetailScreenNavigationProp>();
  const { id } = route.params;
  const { profiles, connection, connect, disconnect, deleteProfile } = useVpnStore();
  const { colors } = useThemeStore();
  const [profile, setProfile] = useState<VpnProfile | null>(null);

  useEffect(() => {
    const foundProfile = profiles.find(p => p.id === id);
    if (foundProfile) {
      setProfile(foundProfile);
    } else {
      Alert.alert('Ошибка', 'Профиль не найден');
      navigation.goBack();
    }
  }, [id, profiles]);

  const handleConnect = async () => {
    if (!profile) return;

    if (connection.status === 'connected' && connection.profileId === profile.id) {
      await disconnect();
    } else {
      await connect(profile.id);
    }
  };

  const handleEdit = () => {
    if (!profile) return;
    navigation.navigate('EditProfile', { id: profile.id });
  };

  const handleDelete = () => {
    if (!profile) return;

    Alert.alert(
      'Удаление профиля',
      'Вы уверены, что хотите удалить этот профиль?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: () => {
            deleteProfile(profile.id);
            navigation.goBack();
          }
        }
      ]
    );
  };

  if (!profile) {
    return null;
  }

  const isConnected = connection.status === 'connected' && connection.profileId === profile.id;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text.primary }]}>{profile.name}</Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>{profile.server}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: isConnected ? colors.danger : colors.primary }]}
          onPress={handleConnect}
        >
          <Power size={24} color={colors.text.primary} />
          <Text style={[styles.actionText, { color: colors.text.primary }]}>
            {isConnected ? 'Отключить' : 'Подключить'}
          </Text>
        </TouchableOpacity>

        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.secondaryButton, { backgroundColor: colors.card }]}
            onPress={handleEdit}
          >
            <Edit size={20} color={colors.text.primary} />
            <Text style={[styles.secondaryButtonText, { color: colors.text.primary }]}>Изменить</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { backgroundColor: colors.card }]}
            onPress={handleDelete}
          >
            <Trash size={20} color={colors.danger} />
            <Text style={[styles.secondaryButtonText, { color: colors.danger }]}>Удалить</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.details, { backgroundColor: colors.card }]}>
        <Text style={[styles.detailsTitle, { color: colors.text.primary }]}>Детали подключения</Text>

        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.text.secondary }]}>Протокол:</Text>
          <Text style={[styles.detailValue, { color: colors.text.primary }]}>{profile.protocol.toUpperCase()}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.text.secondary }]}>Сервер:</Text>
          <Text style={[styles.detailValue, { color: colors.text.primary }]}>{profile.server}</Text>
        </View>

        {profile.port && (
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.text.secondary }]}>Порт:</Text>
            <Text style={[styles.detailValue, { color: colors.text.primary }]}>{profile.port}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  actions: {
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  actionText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    flex: 0.48,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  details: {
    padding: 16,
    borderRadius: 12,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
});
