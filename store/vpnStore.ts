import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ConnectionState, VpnProfile } from '@/types/vpn';
import { encrypt, decrypt } from '@/utils/secureStorage';
import { 
  connectToL2TP, 
  disconnectFromVPN, 
  showConnectionSuccessNotification,
  connectToOpenVPN,
  disconnectFromOpenVPN,
  getOpenVPNStatus,
  getOpenVPNConfig
} from '@/utils/vpnApi';
import { getSecureValue, SECURE_KEYS } from '@/utils/secureStorage';
import { Platform, Alert } from 'react-native';

interface VpnState {
  profiles: VpnProfile[];
  connection: ConnectionState;
  
  // Действия
  addProfile: (profile: VpnProfile) => Promise<void>;
  updateProfile: (profile: VpnProfile) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  clearAllProfiles: () => Promise<void>;
  setConnectionStatus: (status: ConnectionState) => void;
  connect: (profileId: string) => Promise<void>;
  disconnect: () => Promise<void>;
  loadProfiles: () => Promise<void>;
  checkConnectionStatus: () => Promise<void>;
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
        // Эта функция в основном для обновления профилей
        // Фактическая загрузка обрабатывается middleware persist
        return Promise.resolve();
      },
      
      checkConnectionStatus: async () => {
        if (Platform.OS === 'web') return;
        
        try {
          const status = await getOpenVPNStatus();
          const { connection } = get();
          
          if (connection.profileId && status !== connection.status) {
            set({
              connection: {
                ...connection,
                status: status as any,
              },
            });
          }
        } catch (error) {
          console.error('Не удалось проверить статус подключения:', error);
        }
      },
      
      addProfile: async (profile) => {
        try {
          // Для профилей OpenVPN убеждаемся, что у нас есть файл конфигурации
          let finalProfile = { ...profile };
          
          if (profile.protocol === 'openvpn' && !profile.configFile) {
            try {
              const config = await getOpenVPNConfig();
              finalProfile.configFile = config;
            } catch (error) {
              console.error('Не удалось получить конфигурацию OpenVPN:', error);
              Alert.alert('Ошибка', 'Не удалось получить конфигурацию OpenVPN с сервера');
              throw error;
            }
          }
          
          // Шифруем чувствительные данные перед сохранением
          const secureProfile = {
            ...finalProfile,
            username: finalProfile.username ? encrypt(finalProfile.username) : undefined,
            password: finalProfile.password ? encrypt(finalProfile.password) : undefined,
            configFile: finalProfile.configFile ? encrypt(finalProfile.configFile) : undefined,
          };
          
          set((state) => ({
            profiles: [...state.profiles, secureProfile],
          }));
        } catch (error) {
          console.error('Не удалось добавить профиль:', error);
          Alert.alert('Ошибка', 'Не удалось добавить профиль');
          throw error;
        }
      },
      
      updateProfile: async (profile) => {
        try {
          // Шифруем чувствительные данные перед сохранением
          const secureProfile = {
            ...profile,
            username: profile.username ? encrypt(profile.username) : undefined,
            password: profile.password ? encrypt(profile.password) : undefined,
            configFile: profile.configFile ? encrypt(profile.configFile) : undefined,
          };
          
          set((state) => ({
            profiles: state.profiles.map((p) => 
              p.id === profile.id ? secureProfile : p
            ),
          }));
        } catch (error) {
          console.error('Не удалось обновить профиль:', error);
          Alert.alert('Ошибка', 'Не удалось обновить профиль');
          throw error;
        }
      },
      
      deleteProfile: async (id) => {
        try {
          const { connection } = get();
          
          // Если удаляемый профиль в данный момент подключен, отключаем его
          if (connection.profileId === id && connection.status === 'connected') {
            await get().disconnect();
          }
          
          set((state) => ({
            profiles: state.profiles.filter((p) => p.id !== id),
            connection: state.connection.profileId === id 
              ? { status: 'disconnected', profileId: null }
              : state.connection
          }));
        } catch (error) {
          console.error('Не удалось удалить профиль:', error);
          Alert.alert('Ошибка', 'Не удалось удалить профиль');
          throw error;
        }
      },
      
      clearAllProfiles: async () => {
        try {
          // Отключаемся, если подключены
          const { connection } = get();
          if (connection.status === 'connected') {
            await get().disconnect();
          }
          
          set({
            profiles: [],
            connection: {
              status: 'disconnected',
              profileId: null,
            },
          });
        } catch (error) {
          console.error('Не удалось очистить профили:', error);
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
        
        // Устанавливаем статус "подключение"
        set({
          connection: {
            status: 'connecting',
            profileId,
          },
        });
        
        try {
          // Расшифровываем учетные данные
          const username = profile.username ? decrypt(profile.username) : undefined;
          const password = profile.password ? decrypt(profile.password) : undefined;
          const configFile = profile.configFile ? decrypt(profile.configFile) : undefined;
          
          let success = false;
          
          if (profile.protocol === 'openvpn') {
            if (!configFile) {
              throw new Error('Файл конфигурации OpenVPN не найден');
            }
            
            success = await connectToOpenVPN(
              profile.name,
              configFile,
              username,
              password
            );
          } else if (profile.protocol === 'l2tp') {
            // Получаем адрес сервера и ключ IPsec из безопасного хранилища
            const serverAddress = await getSecureValue(SECURE_KEYS.SERVER_ADDRESS);
            const ipsecKey = await getSecureValue(SECURE_KEYS.IPSEC_KEY);
            
            // Для L2TP мы только показываем инструкции, поэтому success всегда false
            await connectToL2TP(
              profile.name,
              serverAddress,
              username,
              password,
              ipsecKey
            );
            success = false; // L2TP требует ручной настройки
          }
          
          if (success) {
            set({
              connection: {
                status: 'connected',
                profileId,
              },
            });
            
            showConnectionSuccessNotification(profile.name);
          } else {
            set({
              connection: {
                status: 'disconnected',
                profileId: null,
              },
            });
          }
        } catch (error) {
          console.error('Ошибка подключения:', error);
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
        const { connection } = get();
        
        try {
          if (connection.profileId) {
            const { profiles } = get();
            const profile = profiles.find(p => p.id === connection.profileId);
            
            if (profile?.protocol === 'openvpn') {
              await disconnectFromOpenVPN();
            } else {
              await disconnectFromVPN();
            }
          }
          
          set({
            connection: {
              status: 'disconnected',
              profileId: null,
            },
          });
        } catch (error) {
          console.error('Ошибка отключения:', error);
          Alert.alert('Ошибка отключения', error instanceof Error ? error.message : 'Неизвестная ошибка');
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