import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Shield } from 'lucide-react-native';
import { useThemeStore } from '@/store/themeStore';
import { LinearGradient } from 'expo-linear-gradient';

interface AppIconProps {
  size?: number;
  withGradient?: boolean;
  style?: ViewStyle;
}

export default function AppIcon({ size = 40, withGradient = false, style }: AppIconProps) {
  const { colors } = useThemeStore();
  
  const iconBackground = withGradient ? (
    <LinearGradient
      colors={['#121212', '#1A1A1A']}
      style={[
        styles.container,
        { 
          width: size, 
          height: size, 
          borderRadius: size / 2 
        },
        style
      ]}
    >
      <Shield size={size * 0.6} color={colors.primary} />
    </LinearGradient>
  ) : (
    <View style={[
      styles.container, 
      { 
        backgroundColor: '#121212', 
        width: size, 
        height: size, 
        borderRadius: size / 2 
      },
      style
    ]}>
      <Shield size={size * 0.6} color={colors.primary} />
    </View>
  );
  
  return iconBackground;
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});