import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Shield } from 'lucide-react-native';
import { useThemeStore } from '@/store/themeStore';

interface EmptyStateProps {
  message?: string;
}

export default function EmptyState({ 
  message = "Нет VPN профилей. Создайте свой первый профиль, чтобы начать работу."
}: EmptyStateProps) {
  const { colors } = useThemeStore();
  
  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]}>
        <Shield size={40} color={colors.primary} />
      </View>
      <Text style={[styles.message, { color: colors.text.secondary }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    maxWidth: 280,
  },
});