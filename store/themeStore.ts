import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors } from '@/constants/colors';

interface ThemeState {
  isDarkMode: boolean;
  colors: typeof darkColors;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDarkMode: true,
      colors: darkColors,
      
      toggleTheme: () => {
        set((state) => {
          const newIsDarkMode = !state.isDarkMode;
          return {
            isDarkMode: newIsDarkMode,
            colors: newIsDarkMode ? darkColors : lightColors,
          };
        });
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Важно: сохраняем все состояние, включая colors
      partialize: (state) => ({
        isDarkMode: state.isDarkMode,
        // Не сохраняем colors, они будут восстановлены на основе isDarkMode
      }),
    }
  )
);