import React from 'react';
import { View, Text, StyleSheet, Switch, ScrollView } from 'react-native';
import { useThemeStore } from '@/store/themeStore';
import { SettingsSection, SettingsItem } from '@/components/SettingsComponents';

export default function SettingsScreen() {
  const { colors, mode, setMode } = useThemeStore();

  const toggleTheme = () => {
    setMode(mode === 'dark' ? 'light' : 'dark');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <SettingsSection title="Внешний вид">
        <SettingsItem
          title="Темная тема"
          rightElement={
            <Switch
              value={mode === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.text.primary}
            />
          }
        />
      </SettingsSection>

      <SettingsSection title="О приложении">
        <SettingsItem
          title="Версия"
          subtitle="1.0.0"
        />
      </SettingsSection>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
