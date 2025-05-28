import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, TouchableOpacity, Platform } from 'react-native';
import { useThemeStore } from '@/store/themeStore';
import AppIcon from '@/components/AppIcon';
import { Shield, Globe, Mail, Github } from 'lucide-react-native';

export default function AboutScreen() {
  const { colors } = useThemeStore();
  
  const handleOpenWebsite = async () => {
    try {
      await Linking.openURL('https://example.com/securevpn');
    } catch (error) {
      console.error('Could not open website:', error);
    }
  };
  
  const handleOpenPrivacyPolicy = async () => {
    try {
      await Linking.openURL('https://example.com/securevpn/privacy');
    } catch (error) {
      console.error('Could not open privacy policy:', error);
    }
  };
  
  const handleOpenTerms = async () => {
    try {
      await Linking.openURL('https://example.com/securevpn/terms');
    } catch (error) {
      console.error('Could not open terms:', error);
    }
  };
  
  const handleOpenEmail = async () => {
    try {
      await Linking.openURL('mailto:info@example.com');
    } catch (error) {
      console.error('Could not open email client:', error);
    }
  };
  
  const handleOpenGithub = async () => {
    try {
      await Linking.openURL('https://github.com/example/securevpn');
    } catch (error) {
      console.error('Could not open GitHub:', error);
    }
  };
  
  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <AppIcon size={80} withGradient={true} />
        <Text style={[styles.appName, { color: colors.text.primary }]}>SecureVPN</Text>
        <Text style={[styles.version, { color: colors.text.secondary }]}>Версия 1.0.0</Text>
      </View>
      
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>О приложении</Text>
        <Text style={[styles.description, { color: colors.text.secondary }]}>
          SecureVPN - это безопасный и простой в использовании VPN клиент для подключений OpenVPN и L2TP/IPsec. 
          Приложение обеспечивает защищенное соединение, шифрование трафика и конфиденциальность в сети.
        </Text>
        
        <Text style={[styles.demoNotice, { color: colors.warning }]}>
          Это демонстрационная версия приложения. Для полноценной работы VPN требуется нативная реализация с использованием специфичных для платформы API.
        </Text>
      </View>
      
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Возможности</Text>
        <View style={styles.featureItem}>
          <Shield size={20} color={colors.primary} style={styles.featureIcon} />
          <Text style={[styles.featureText, { color: colors.text.secondary }]}>
            Поддержка протоколов OpenVPN и L2TP/IPsec
          </Text>
        </View>
        <View style={styles.featureItem}>
          <Shield size={20} color={colors.primary} style={styles.featureIcon} />
          <Text style={[styles.featureText, { color: colors.text.secondary }]}>
            Шифрование трафика и защита данных
          </Text>
        </View>
        <View style={styles.featureItem}>
          <Shield size={20} color={colors.primary} style={styles.featureIcon} />
          <Text style={[styles.featureText, { color: colors.text.secondary }]}>
            Управление несколькими VPN профилями
          </Text>
        </View>
        <View style={styles.featureItem}>
          <Shield size={20} color={colors.primary} style={styles.featureIcon} />
          <Text style={[styles.featureText, { color: colors.text.secondary }]}>
            Интеграция с системными настройками VPN
          </Text>
        </View>
      </View>
      
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Правовая информация</Text>
        
        <TouchableOpacity style={styles.linkItem} onPress={handleOpenPrivacyPolicy}>
          <Text style={[styles.linkText, { color: colors.primary }]}>Политика конфиденциальности</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.linkItem} onPress={handleOpenTerms}>
          <Text style={[styles.linkText, { color: colors.primary }]}>Условия использования</Text>
        </TouchableOpacity>
      </View>
      
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Контакты</Text>
        
        <TouchableOpacity style={styles.contactItem} onPress={handleOpenWebsite}>
          <Globe size={20} color={colors.primary} style={styles.contactIcon} />
          <Text style={[styles.contactText, { color: colors.text.secondary }]}>
            example.com/securevpn
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.contactItem} onPress={handleOpenEmail}>
          <Mail size={20} color={colors.primary} style={styles.contactIcon} />
          <Text style={[styles.contactText, { color: colors.text.secondary }]}>
            info@example.com
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.contactItem} onPress={handleOpenGithub}>
          <Github size={20} color={colors.primary} style={styles.contactIcon} />
          <Text style={[styles.contactText, { color: colors.text.secondary }]}>
            github.com/example/securevpn
          </Text>
        </TouchableOpacity>
      </View>
      
      <Text style={[styles.copyright, { color: colors.text.disabled }]}>
        © 2025 SecureVPN. Все права защищены.
      </Text>
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
    alignItems: 'center',
    marginBottom: 24,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
  },
  version: {
    fontSize: 14,
    marginTop: 4,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  demoNotice: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    marginTop: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureIcon: {
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
  },
  linkItem: {
    paddingVertical: 8,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '500',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactIcon: {
    marginRight: 12,
  },
  contactText: {
    fontSize: 14,
  },
  copyright: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 16,
  },
});