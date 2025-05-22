import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ColorSchemeName } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeColors {
primary: string;
background: string;
card: string;
border: string;
danger: string;
text: {
primary: string;
secondary: string;
};
}

interface ThemeState {
mode: ThemeMode;
systemColorScheme: ColorSchemeName;
colors: ThemeColors;

setMode: (mode: ThemeMode) => void;
  setSystemColorScheme: (colorScheme: ColorSchemeName) => void;
}

const getLightColors = (): ThemeColors => ({
  primary: '#2563EB',
  background: '#F9FAFB',
  card: '#FFFFFF',
  border: '#E5E7EB',
  danger: '#EF4444',
  text: {
    primary: '#111827',
    secondary: '#6B7280',
  },
});

const getDarkColors = (): ThemeColors => ({
  primary: '#3B82F6',
  background: '#111827',
  card: '#1F2937',
  border: '#374151',
  danger: '#EF4444',
  text: {
    primary: '#F9FAFB',
    secondary: '#9CA3AF',
  },
});

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'system',
      systemColorScheme: 'light',
      colors: getLightColors(),

      setMode: (mode) => {
        set({ mode });

        // Обновляем цвета в зависимости от режима
        if (mode === 'light') {
          set({ colors: getLightColors() });
        } else if (mode === 'dark') {
          set({ colors: getDarkColors() });
        } else {
          // Для режима 'system' используем системную цветовую схему
          const { systemColorScheme } = get();
          set({
            colors: systemColorScheme === 'dark' ? getDarkColors() : getLightColors()
          });
        }
      },

      setSystemColorScheme: (colorScheme) => {
        set({ systemColorScheme: colorScheme });

        // Если установлен режим 'system', обновляем цвета
        const { mode } = get();
        if (mode === 'system') {
          set({
            colors: colorScheme === 'dark' ? getDarkColors() : getLightColors()
          });
        }
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        mode: state.mode,
      }),
    }
)
);
