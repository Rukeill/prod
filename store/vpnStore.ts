import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ConnectionState, VpnProfile } from '@/types/vpn';
import { encrypt, decrypt } from '@/utils/secureStorage';
import { 
  connectToL2TP, 
  disconnectFromVPN, 
  showConnectionSuccessNotification,
  createL2TPProfile
} from '@/utils/vpnApi';
import { getSecureValue, SECURE_KEYS } from '@/utils/secureStorage';
import { Platform, Alert } from 'react-native';

interface VpnState {
  profiles: VpnProfile[];
  connection: ConnectionState;
  
  // Actions
  addProfile: (profile: VpnProfile) => Promise<void>;
  updateProfile: (profile: VpnProfile) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  clearAllProfiles: () => Promise<void>;
  setConnectionStatus: (status: ConnectionState) => void;
  connect: (profileId: string) => Promise<void>;
  disconnect: () => Promise<void>;
  loadProfiles: () => Promise<void>;
}

export const useVpnStore = create<VpnState>()(
  persist(
    (set, get) => ({
      profiles: [],
      connection: {
        status: 'disconnected',
        profileId: null,
      },
      
      loadProfiles: async () => {
        // This function is mainly for refreshing profiles
        // The actual loading is handled by the persist middleware
        return Promise.resolve();
      },
      
      addProfile: async (profile) => {
        try {
          // Encrypt sensitive data before saving
          const secureProfile = {
            ...profile,
            username: profile.username ? encrypt(profile.username) : undefined,
            password: profile.password ? encrypt(profile.password) : undefined,
          };
          
          set((state) => ({
            profiles: [...state.profiles, secureProfile],
          }));
        } catch (error) {
          console.error('Failed to add profile:', error);
          Alert.alert('Ошибка', 'Не удалось добавить профиль');
          throw error;
        }
      },
      
      updateProfile: async (profile) => {
        try {
          // Encrypt sensitive data before saving
          const secureProfile = {
            ...profile,
            username: profile.username ? encrypt(profile.username) : undefined,
            password: profile.password ? encrypt(profile.password) : undefined,
          };
          
          set((state) => ({
            profiles: state.profiles.map((p) => 
              p.id === profile.id ? secureProfile : p
            ),
          }));
        } catch (error) {
          console.error('Failed to update profile:', error);
          Alert.alert('Ошибка', 'Не удалось обновить профиль');
          throw error;
        }
      },
      
      deleteProfile: async (id) => {
        try {
          set((state) => ({
            profiles: state.profiles.filter((p) => p.id !== id),
            // If the deleted profile is currently connected, disconnect it
            connection: state.connection.profileId === id 
              ? { status: 'disconnected', profileId: null }
              : state.connection
          }));
        } catch (error) {
          console.error('Failed to delete profile:', error);
          Alert.alert('Ошибка', 'Не удалось удалить профиль');
          throw error;
        }
      },
      
      clearAllProfiles: async () => {
        try {
          set({
            profiles: [],
            connection: {
              status: 'disconnected',
              profileId: null,
            },
          });
        } catch (error) {
          console.error('Failed to clear profiles:', error);
          Alert.alert('Ошибка', 'Не удалось очистить профили');
          throw error;
        }
      },
      
      setConnectionStatus: (connectionState) => {
        set({ connection: connectionState });
      },
      
      connect: async (profileId) => {
        const { profiles } = get();
        const profile = profiles.find(p => p.id === profileId);
        
        if (!profile) {
          set({
            connection: {
              status: 'error',
              profileId: null,
              errorMessage: 'Профиль не найден',
            },
          });
          return;
        }
        
        // Set status to "connecting"
        set({
          connection: {
            status: 'connecting',
            profileId,
          },
        });
        
        try {
          // Get server address from secure storage
          const serverAddress = await getSecureValue(SECURE_KEYS.SERVER_ADDRESS);
          
          // Decrypt credentials
          const username = profile.username ? decrypt(profile.username) : undefined;
          const password = profile.password ? decrypt(profile.password) : undefined;
          
          if (profile.protocol === 'l2tp') {
            // Get IPsec key for L2TP
            const ipsecKey = await getSecureValue(SECURE_KEYS.IPSEC_KEY);
            
            // Create L2TP profile and show instructions
            await connectToL2TP(
              profile.name,
              serverAddress,
              username,
              password,
              ipsecKey
            );
            
            // Show success notification with instructions
            showConnectionSuccessNotification(profile.name);
            
            // Set status back to disconnected since we're not actually connecting programmatically
            set({
              connection: {
                status: 'disconnected',
                profileId: null,
              },
            });
          } else if (profile.protocol === 'openvpn') {
            Alert.alert(
              'OpenVPN не поддерживается',
              'В текущей версии приложения поддерживается только L2TP/IPsec протокол. OpenVPN требует дополнительной нативной реализации.',
              [{ text: 'OK' }]
            );
            
            set({
              connection: {
                status: 'disconnected',
                profileId: null,
              },
            });
          }
        } catch (error) {
          console.error('Connection error:', error);
          set({
            connection: {
              status: 'error',
              profileId: null,
              errorMessage: error instanceof Error ? error.message : 'Неизвестная ошибка',
            },
          });
          
          Alert.alert('Ошибка подключения', error instanceof Error ? error.message : 'Неизвестная ошибка');
        }
      },
      
      disconnect: async () => {
        try {
          // Show instructions for disconnection
          await disconnectFromVPN();
          
          set({
            connection: {
              status: 'disconnected',
              profileId: null,
            },
          });
        } catch (error) {
          console.error('Disconnection error:', error);
          Alert.alert('Ошибка отключения', error instanceof Error ? error.message : 'Неизвестная ошибка');
        }
      },
    }),
    {
      name: 'vpn-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        profiles: state.profiles,
        // Don't persist connection state
      }),
    }
  )
);