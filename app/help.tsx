import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import { useThemeStore } from '@/store/themeStore';
import { HelpCircle, Mail, Globe, ChevronRight } from 'lucide-react-native';

export default function HelpScreen() {
  const { colors } = useThemeStore();
  
  const handleOpenEmail = async () => {
    try {
      await Linking.openURL('mailto:support@example.com?subject=SecureVPN Support Request');
    } catch (error) {
      console.error('Could not open email client:', error);
    }
  };
  
  const handleOpenWebsite = async () => {
    try {
      await Linking.openURL('https://example.com/securevpn/support');
    } catch (error) {
      console.error('Could not open website:', error);
    }
  };
  
  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <HelpCircle size={40} color={colors.primary} />
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          Помощь и поддержка
        </Text>
      </View>
      
      <View style={[styles.infoBox, { backgroundColor: `${colors.warning}20`, borderColor: colors.warning }]}>
        <Text style={[styles.infoText, { color: colors.text.primary }]}>
          Это демонстрационная версия приложения. Функции VPN-подключения требуют нативной реализации с использованием специфичных для платформы API.
        </Text>
      </View>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>
          Часто задаваемые вопросы
        </Text>
        
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.question, { color: colors.text.primary }]}>
            Что такое VPN?
          </Text>
          <Text style={[styles.answer, { color: colors.text.secondary }]}>
            VPN (Virtual Private Network) - это технология, которая создает защищенное соединение между вашим устройством и интернетом. Она шифрует ваш трафик и скрывает ваш IP-адрес, обеспечивая конфиденциальность и безопасность в сети.
          </Text>
        </View>
        
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.question, { color: colors.text.primary }]}>
            Какой протокол VPN лучше использовать?
          </Text>
          <Text style={[styles.answer, { color: colors.text.secondary }]}>
            OpenVPN обычно считается наиболее безопасным и надежным протоколом. L2TP/IPsec также обеспечивает хороший уровень безопасности и часто встроен в операционные системы. Выбор зависит от ваших потребностей в скорости и безопасности.
          </Text>
        </View>
        
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.question, { color: colors.text.primary }]}>
            Почему не работает подключение?
          </Text>
          <Text style={[styles.answer, { color: colors.text.secondary }]}>
            В демонстрационной версии приложения функции VPN-подключения не реализованы полностью. Для работы VPN требуется нативная реализация с использованием специфичных для платформы API, таких как NetworkExtension на iOS и VpnService на Android.
          </Text>
        </View>
        
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.question, { color: colors.text.primary }]}>
            Как настроить L2TP/IPsec подключение?
          </Text>
          <Text style={[styles.answer, { color: colors.text.secondary }]}>
            Для L2TP/IPsec необходимо создать профиль с адресом сервера, учетными данными и предварительным ключом IPsec. В полной версии приложения, после создания профиля, вы сможете управлять подключением через системные настройки вашего устройства.
          </Text>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>
          Связаться с поддержкой
        </Text>
        
        <TouchableOpacity 
          style={[styles.contactItem, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={handleOpenEmail}
        >
          <Mail size={24} color={colors.primary} />
          <View style={styles.contactContent}>
            <Text style={[styles.contactTitle, { color: colors.text.primary }]}>
              Электронная почта
            </Text>
            <Text style={[styles.contactDetails, { color: colors.text.secondary }]}>
              support@example.com
            </Text>
          </View>
          <ChevronRight size={20} color={colors.text.secondary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.contactItem, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={handleOpenWebsite}
        >
          <Globe size={24} color={colors.primary} />
          <View style={styles.contactContent}>
            <Text style={[styles.contactTitle, { color: colors.text.primary }]}>
              Веб-сайт
            </Text>
            <Text style={[styles.contactDetails, { color: colors.text.secondary }]}>
              example.com/securevpn/support
            </Text>
          </View>
          <ChevronRight size={20} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>
          Руководство пользователя
        </Text>
        
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.guideTitle, { color: colors.text.primary }]}>
            Создание нового профиля
          </Text>
          <Text style={[styles.guideText, { color: colors.text.secondary }]}>
            1. Нажмите кнопку "+" на главном экране{"\n"}
            2. Введите имя профиля{"\n"}
            3. Выберите протокол (OpenVPN или L2TP/IPsec){"\n"}
            4. Введите учетные данные (если необходимо){"\n"}
            5. Нажмите "Сохранить профиль"
          </Text>
        </View>
        
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.guideTitle, { color: colors.text.primary }]}>
            Подключение к VPN
          </Text>
          <Text style={[styles.guideText, { color: colors.text.secondary }]}>
            1. На главном экране выберите профиль{"\n"}
            2. Нажмите кнопку "Подключить"{"\n"}
            3. В демо-версии будет показано сообщение о необходимости нативной реализации{"\n"}
            4. В полной версии статус изменится на "Подключено" при успешном подключении
          </Text>
        </View>
        
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.guideTitle, { color: colors.text.primary }]}>
            Настройка сервера
          </Text>
          <Text style={[styles.guideText, { color: colors.text.secondary }]}>
            1. Перейдите в раздел "Настройки"{"\n"}
            2. В разделе "Настройки сервера" выберите "Адрес сервера"{"\n"}
            3. Введите новый адрес сервера{"\n"}
            4. Для L2TP/IPsec также настройте "Ключ IPsec"
          </Text>
        </View>
      </View>
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
    marginTop: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginTop: 12,
  },
  infoBox: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  answer: {
    fontSize: 14,
    lineHeight: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  contactContent: {
    flex: 1,
    marginLeft: 12,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  contactDetails: {
    fontSize: 14,
    marginTop: 4,
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  guideText: {
    fontSize: 14,
    lineHeight: 22,
  },
});