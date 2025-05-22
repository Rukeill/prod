import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ConnectionState, VpnProfile } from '../types/vpn';
import { encrypt, decrypt } from '../utils/encryption';
import { connectToVpn, disconnectFromVpn, fetchOpenVpnConfig } from '../utils/vpnApi';

// Остальной код остается без изменений


interface VpnState {
  profiles: VpnProfile[];
  connection: ConnectionState;
  
  // Actions
  addProfile: (profile: VpnProfile) => void;
  updateProfile: (profile: VpnProfile) => void;
  deleteProfile: (id: string) => void;
  setConnectionStatus: (status: ConnectionState) => void;
  connect: (profileId: string) => Promise<void>;
  disconnect: () => Promise<void>;
}

export const useVpnStore = create<VpnState>()(
  persist(
    (set, get) => ({
      profiles: [],
      connection: {
        status: 'disconnected',
        profileId: null,
      },
      
      addProfile: (profile) => {
        // Шифруем чувствительные данные перед сохранением
        const secureProfile = {
          ...profile,
          username: profile.username ? encrypt(profile.username) : undefined,
          password: profile.password ? encrypt(profile.password) : undefined,
        };
        
        set((state) => ({
          profiles: [...state.profiles, secureProfile],
        }));
      },
      
      updateProfile: (profile) => {
        // Шифруем чувствительные данные перед сохранением
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
      },
      
      deleteProfile: (id) => {
        set((state) => ({
          profiles: state.profiles.filter((p) => p.id !== id),
        }));
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
        
        // Устанавливаем статус "подключение"
        set({
          connection: {
            status: 'connecting',
            profileId,
          },
        });
        
        try {
          let configFile = profile.configFile;
          
          // Если это OpenVPN и конфигурационный файл отсутствует, получаем его
          if (profile.protocol === 'openvpn' && !configFile) {
            configFile = await fetchOpenVpnConfig();
          }
          
          // Расшифровываем учетные данные
          const username = profile.username ? decrypt(profile.username) : undefined;
          const password = profile.password ? decrypt(profile.password) : undefined;
          
          // Подключаемся к VPN
          const success = await connectToVpn(profileId, configFile);
          
          if (success) {
            // Если получили новый конфигурационный файл, сохраняем его
            if (configFile && configFile !== profile.configFile) {
              const updatedProfile = { ...profile, configFile };
              get().updateProfile(updatedProfile);
            }
            
            set({
              connection: {
                status: 'connected',
                profileId,
              },
            });
          } else {
            throw new Error('Не удалось подключиться');
          }
        } catch (error) {
          set({
            connection: {
              status: 'error',
              profileId: null,
              errorMessage: error instanceof Error ? error.message : 'Неизвестная ошибка',
            },
          });
        }
      },
      
      disconnect: async () => {
        const { connection } = get();
        
        if (connection.status !== 'connected') {
          return;
        }
        
        try {
          const success = await disconnectFromVpn();
          
          if (success) {
            set({
              connection: {
                status: 'disconnected',
                profileId: null,
              },
            });
          } else {
            throw new Error('Не удалось отключиться');
          }
        } catch (error) {
          set({
            connection: {
              status: 'error',
              profileId: connection.profileId,
              errorMessage: error instanceof Error ? error.message : 'Неизвестная ошибка',
            },
          });
        }
      },
    }),
    {
      name: 'vpn-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        profiles: state.profiles,
        // Не сохраняем состояние подключения
      }),
    }
  )
);