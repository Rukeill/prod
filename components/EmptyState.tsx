import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '@/store/themeStore';
import AppIcon from './AppIcon';

interface EmptyStateProps {
  message?: string;
}

export default function EmptyState({ 
  message = "Нет VPN профилей. Создайте свой первый профиль, чтобы начать работу."
}: EmptyStateProps) {
  const { colors } = useThemeStore();
  
  return (
    <View style={styles.container}>
      <AppIcon size={80} withGradient={true} />
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
  message: {
    fontSize: 16,
    textAlign: 'center',
    maxWidth: 280,
    marginTop: 24,
  },
});