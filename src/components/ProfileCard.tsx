import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { VpnProfile } from '@/types/vpn';
import { useThemeStore } from '@/store/themeStore';
import { useVpnStore } from '@/store/vpnStore';
import { Shield, ShieldCheck } from 'lucide-react-native';

interface ProfileCardProps {
  profile: VpnProfile;
  onPress?: () => void;
}

export default function ProfileCard({ profile, onPress }: ProfileCardProps) {
  const { colors } = useThemeStore();
  const { connection } = useVpnStore();

  const isConnected = connection.status === 'connected' && connection.profileId === profile.id;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        {isConnected ? (
          <ShieldCheck size={24} color={colors.primary} />
        ) : (
          <Shield size={24} color={colors.text.secondary} />
        )}
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text.primary }]}>{profile.name}</Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>{profile.server}</Text>
      </View>

      {isConnected && (
        <View style={[styles.badge, { backgroundColor: colors.primary }]}>
          <Text style={[styles.badgeText, { color: colors.text.primary }]}>Подключено</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  iconContainer: {
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
