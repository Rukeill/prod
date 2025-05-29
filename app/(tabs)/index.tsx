import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useVpnStore } from '@/store/vpnStore';
import { useThemeStore } from '@/store/themeStore';
import ProfileCard from '@/components/ProfileCard';
import EmptyState from '@/components/EmptyState';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export default function ProfilesScreen() {
  const router = useRouter();
  const { profiles, loadProfiles } = useVpnStore();
  const { colors } = useThemeStore();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const initializeProfiles = async () => {
      try {
        await loadProfiles();
      } catch (error) {
        console.error('Не удалось загрузить профили:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initializeProfiles();
  }, []);
  
  const handleAddProfile = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(console.error);
    }
    router.push('/profile/new');
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadProfiles();
    } catch (error) {
      console.error('Не удалось обновить профили:', error);
    } finally {
      setRefreshing(false);
    }
  };
  
  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={profiles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ProfileCard profile={item} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<EmptyState />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      />
      
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={handleAddProfile}
        activeOpacity={0.8}
      >
        <Plus size={24} color={colors.text.primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
    flexGrow: 1,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});