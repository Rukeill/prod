import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Shield } from 'lucide-react-native';
import { useThemeStore } from '@/store/themeStore';
import { LinearGradient } from 'expo-linear-gradient';

export default function WelcomeScreen() {
  const router = useRouter();
  const { colors } = useThemeStore();
  
  const handleGetStarted = () => {
    router.replace('/(tabs)');
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <LinearGradient
            colors={['#121212', '#1A1A1A']}
            style={styles.logoBackground}
          >
            <Shield size={60} color={colors.primary} />
          </LinearGradient>
        </View>
        
        <Text style={[styles.title, { color: colors.text.primary }]}>
          SecureVPN
        </Text>
        
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
          Безопасное и надежное VPN-подключение
        </Text>
        
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: `${colors.primary}20` }]}>
              <Shield size={24} color={colors.primary} />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={[styles.featureTitle, { color: colors.text.primary }]}>
                Защита данных
              </Text>
              <Text style={[styles.featureDescription, { color: colors.text.secondary }]}>
                Шифрование трафика и защита от слежки
              </Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: `${colors.primary}20` }]}>
              <Shield size={24} color={colors.primary} />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={[styles.featureTitle, { color: colors.text.primary }]}>
                Поддержка протоколов
              </Text>
              <Text style={[styles.featureDescription, { color: colors.text.secondary }]}>
                OpenVPN и L2TP/IPsec для разных устройств
              </Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: `${colors.primary}20` }]}>
              <Shield size={24} color={colors.primary} />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={[styles.featureTitle, { color: colors.text.primary }]}>
                Простое управление
              </Text>
              <Text style={[styles.featureDescription, { color: colors.text.secondary }]}>
                Удобный интерфейс для настройки и подключения
              </Text>
            </View>
          </View>
        </View>
      </View>
      
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleGetStarted}
        >
          <Text style={[styles.buttonText, { color: colors.text.primary }]}>
            Начать работу
          </Text>
        </TouchableOpacity>
        
        <Text style={[styles.disclaimer, { color: colors.text.disabled }]}>
          Это демонстрационное приложение. Для полноценной работы VPN требуется нативная реализация.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 48,
    maxWidth: 300,
  },
  featuresContainer: {
    width: '100%',
    maxWidth: 400,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  button: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
});