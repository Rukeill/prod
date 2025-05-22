import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ConnectionStatus } from '@/types/vpn';
import { useThemeStore } from '@/store/themeStore';

interface StatusIndicatorProps {
  status: ConnectionStatus;
  compact?: boolean;
}

export default function StatusIndicator({ status, compact = false }: StatusIndicatorProps) {
  const { colors } = useThemeStore();
  
  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return colors.success;
      case 'connecting':
        return colors.warning;
      case 'error':
        return colors.error;
      case 'disconnected':
      default:
        return colors.text.disabled;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Подключено';
      case 'connecting':
        return 'Подключение...';
      case 'error':
        return 'Ошибка';
      case 'disconnected':
      default:
        return 'Отключено';
    }
  };

  if (compact) {
    return (
      <View style={[styles.dot, { backgroundColor: getStatusColor() }]} />
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.dot, { backgroundColor: getStatusColor() }]} />
      <Text style={[styles.text, { color: getStatusColor() }]}>
        {getStatusText()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
  },
});