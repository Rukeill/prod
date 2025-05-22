import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { ConnectionStatus } from '@/types/vpn';
import { useThemeStore } from '@/store/themeStore';

interface ConnectionButtonProps {
  status: ConnectionStatus;
  onPress: () => void;
  disabled?: boolean;
}

export default function ConnectionButton({ 
  status, 
  onPress, 
  disabled = false 
}: ConnectionButtonProps) {
  const { colors } = useThemeStore();
  const isConnecting = status === 'connecting';
  const isConnected = status === 'connected';
  
  const getButtonStyle = () => {
    if (disabled) {
      return [styles.button, styles.buttonDisabled, { backgroundColor: colors.text.disabled }];
    }
    
    if (isConnected) {
      return [styles.button, styles.buttonDisconnect, { backgroundColor: colors.error }];
    }
    
    return [styles.button, styles.buttonConnect, { backgroundColor: colors.primary }];
  };
  
  const getButtonText = () => {
    if (isConnecting) return 'Подключение...';
    if (isConnected) return 'Отключить';
    return 'Подключить';
  };
  
  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || isConnecting}
      activeOpacity={0.8}
    >
      {isConnecting ? (
        <ActivityIndicator size="small" color={colors.text.primary} />
      ) : (
        <Text style={[styles.buttonText, { color: colors.text.primary }]}>{getButtonText()}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
  },
  buttonConnect: {},
  buttonDisconnect: {},
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 14,
  },
});