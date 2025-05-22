import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useVpnStore } from '@/store/vpnStore';
import { useThemeStore } from '@/store/themeStore';
import { VpnProtocol } from '@/types/vpn';
import { generateUUID } from '@/utils/uuid';
import { RootStackParamList } from '@/navigation';

type NewProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'NewProfile'>;

export default function NewProfileScreen() {
  const navigation = useNavigation<NewProfileScreenNavigationProp>();
  const { addProfile } = useVpnStore();
  const { colors } = useThemeStore();

  const [name, setName] = useState('');
  const [server, setServer] = useState('');
  const [port, setPort] = useState('');
  const [protocol, setProtocol] = useState<VpnProtocol>('openvpn');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSave = () => {
    if (!name || !server) {
      alert('Пожалуйста, заполните обязательные поля');
      return;
    }

    addProfile({
      id: generateUUID(),
      name,
      server,
      port: port ? parseInt(port, 10) : undefined,
      protocol,
      username: username || undefined,
      password: password || undefined,
      configFile: undefined,
    });

    navigation.goBack();
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.form}>
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text.primary }]}>Название профиля *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text.primary, borderColor: colors.border }]}
            value={name}
            onChangeText={setName}
            placeholder="Мой VPN"
            placeholderTextColor={colors.text.secondary}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text.primary }]}>Сервер *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text.primary, borderColor: colors.border }]}
            value={server}
            onChangeText={setServer}
            placeholder="vpn.example.com"
            placeholderTextColor={colors.text.secondary}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text.primary }]}>Порт</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text.primary, borderColor: colors.border }]}
            value={port}
            onChangeText={setPort}
            placeholder="1194"
            placeholderTextColor={colors.text.secondary}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text.primary }]}>Протокол</Text>
          <View style={styles.protocolSelector}>
            <TouchableOpacity
              style={[
                styles.protocolButton,
                {
                  backgroundColor: protocol === 'openvpn' ? colors.primary : colors.card,
                  borderColor: colors.border
                }
              ]}
              onPress={() => setProtocol('openvpn')}
            >
              <Text
                style={[
                  styles.protocolButtonText,
                  { color: protocol === 'openvpn' ? colors.text.primary : colors.text.secondary }
                ]}
              >
                OpenVPN
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.protocolButton,
                {
                  backgroundColor: protocol === 'wireguard' ? colors.primary : colors.card,
                  borderColor: colors.border
                }
              ]}
              onPress={() => setProtocol('wireguard')}
            >
              <Text
                style={[
                  styles.protocolButtonText,
                  { color: protocol === 'wireguard' ? colors.text.primary : colors.text.secondary }
                ]}
              >
                WireGuard
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text.primary }]}>Имя пользователя</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text.primary, borderColor: colors.border }]}
            value={username}
            onChangeText={setUsername}
            placeholder="username"
            placeholderTextColor={colors.text.secondary}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text.primary }]}>Пароль</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text.primary, borderColor: colors.border }]}
            value={password}
            onChangeText={setPassword}
            placeholder="password"
            placeholderTextColor={colors.text.secondary}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
          onPress={handleSave}
        >
          <Text style={[styles.saveButtonText, { color: colors.text.primary }]}>Сохранить</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  protocolSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  protocolButton: {
    flex: 0.48,
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  protocolButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
