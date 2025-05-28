import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Platform, StatusBar, View } from "react-native";
import { useThemeStore } from "@/store/themeStore";
import { initializeSecureStorage } from "@/utils/secureStorage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, trpcClient } from "@/lib/trpc";
import AppIcon from "@/components/AppIcon";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ErrorBoundary } from "./error-boundary";

export const unstable_settings = {
  initialRouteName: "index",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Create a client with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });
  
  const { colors, isDarkMode } = useThemeStore();

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    // Initialize secure storage when the app starts
    const setupApp = async () => {
      await initializeSecureStorage();
      
      if (loaded) {
        SplashScreen.hideAsync().catch(console.error);
      }
    };
    
    setupApp();
  }, [loaded]);

  if (!loaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <AppIcon size={100} withGradient={true} />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            <StatusBar 
              barStyle={isDarkMode ? "light-content" : "dark-content"} 
              backgroundColor={colors.background} 
            />
            <RootLayoutNav />
          </QueryClientProvider>
        </trpc.Provider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

function RootLayoutNav() {
  const { colors } = useThemeStore();
  
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text.primary,
        headerTitleStyle: {
          fontWeight: '600',
        },
        contentStyle: {
          backgroundColor: colors.background,
        },
        headerBackTitle: "Назад",
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="profile/[id]" 
        options={{ 
          title: "Редактировать профиль",
          presentation: Platform.OS === 'ios' ? 'modal' : 'card',
        }} 
      />
      <Stack.Screen 
        name="profile/new" 
        options={{ 
          title: "Новый профиль",
          presentation: Platform.OS === 'ios' ? 'modal' : 'card',
        }} 
      />
      <Stack.Screen 
        name="help" 
        options={{ 
          title: "Помощь и поддержка",
        }} 
      />
      <Stack.Screen 
        name="about" 
        options={{ 
          title: "О приложении",
        }} 
      />
    </Stack>
  );
}