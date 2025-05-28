import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useVpnStore } from '@/store/vpnStore';
import { useThemeStore } from '@/store/themeStore';
import ProfileForm from '@/components/ProfileForm';

export default function NewProfileScreen() {
  const { addProfile } = useVpnStore();
  const { colors } = useThemeStore();
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.formContainer}>
        <ProfileForm onSave={addProfile} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    flex: 1,
  },
});