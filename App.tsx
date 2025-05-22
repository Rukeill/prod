import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import SplashScreen from 'react-native-splash-screen';
import superjson from 'superjson';

import Navigation from './src/navigation';
import { useThemeStore } from './src/store/themeStore';
import { AppRouter } from './src/backend/trpc/app-router';

// Создаем tRPC клиент
export const trpc = createTRPCReact<AppRouter>( );

const queryClient = new QueryClient();
const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/api/trpc',
      transformer: superjson,
    } ),
  ],
});

export default function App() {
  const { colors, mode } = useThemeStore();

  useEffect(() => {
    // Скрываем сплэш-скрин после загрузки приложения
    SplashScreen.hide();
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <StatusBar
            barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}
            backgroundColor={colors.background}
          />
          <Navigation />
        </SafeAreaProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
