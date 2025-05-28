import React from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useVpnStore } from '@/store/vpnStore';
import { useThemeStore } from '@/store/themeStore';
import ProfileForm from '@/components/ProfileForm';
import { Trash2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export default function EditProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profiles, updateProfile, deleteProfile } = useVpnStore();
  const { colors } = useThemeStore();
  const router = useRouter();
  
  const profile = profiles.find(p => p.id === id);
  
  if (!profile) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.formContainer}>
          <ProfileForm onSave={updateProfile} />
        </View>
      </View>
    );
  }
  
  const handleSave = (updatedProfile: typeof profile) => {
    updateProfile(updatedProfile);
  };
  
  const handleDelete = () => {
    Alert.alert(
      'Удалить профиль',
      `Вы уверены, что хотите удалить профиль "${profile.name}"?`,
      [
        {
          text: 'Отмена',
          style: 'cancel',
        },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProfile(profile.id);
              
              if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
                  .catch(console.error);
              }
              
              router.back();
            } catch (error) {
              console.error('Failed to delete profile:', error);
              Alert.alert('Ошибка', 'Не удалось удалить профиль');
            }
          },
        },
      ]
    );
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.formContainer}>
        <ProfileForm 
          initialProfile={profile} 
          onSave={handleSave} 
        />
        
        <TouchableOpacity
          style={[styles.deleteButton, { backgroundColor: colors.error + '20', borderColor: colors.error }]}
          onPress={handleDelete}
        >
          <Trash2 size={20} color={colors.error} />
          <Text style={[styles.deleteButtonText, { color: colors.error }]}>
            Удалить профиль
          </Text>
        </TouchableOpacity>
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
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  deleteButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
});