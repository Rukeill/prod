import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Linking } from 'react-native';
import { Plus, Settings } from 'lucide-react-native';

// Импорт экранов
import ProfilesScreen from '../screens/ProfilesScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ProfileDetailScreen from '../screens/ProfileDetailScreen';
import NewProfileScreen from '../screens/NewProfileScreen';
import { useThemeStore } from '../store/themeStore';

// Типы для навигации
export type RootStackParamList = {
  Main: undefined;
  ProfileDetail: { id: string };
  NewProfile: undefined;
};

export type TabParamList = {
  Profiles: undefined;
  Settings: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Конфигурация для глубоких ссылок
const linking = {
  prefixes: ['bossvpn://'],
  config: {
    screens: {
      Main: {
        screens: {
          Profiles: 'profiles',
          Settings: 'settings',
        },
      },
      ProfileDetail: 'profile/:id',
      NewProfile: 'profile/new',
    },
  },
};

// Компонент для вкладок
function TabNavigator() {
  const { colors } = useThemeStore();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarStyle: { backgroundColor: colors.background },
      }}
    >
      <Tab.Screen
        name="Profiles"
        component={ProfilesScreen}
        options={{
          title: 'Профили',
          tabBarIcon: ({ color, size }) => <Plus size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Настройки',
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

// Основной навигационный контейнер
export default function Navigation() {
  const { colors } = useThemeStore();
  
  return (
    <NavigationContainer
      linking={linking}
      theme={{
        dark: colors.mode === 'dark',
        colors: {
          primary: colors.primary,
          background: colors.background,
          card: colors.background,
          text: colors.text.primary,
          border: colors.border,
          notification: colors.primary,
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text.primary,
        }}
      >
        <Stack.Screen 
          name="Main" 
          component={TabNavigator} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="ProfileDetail" 
          component={ProfileDetailScreen}
          options={{ title: 'Детали профиля' }}
        />
        <Stack.Screen 
          name="NewProfile" 
          component={NewProfileScreen}
          options={{ title: 'Новый профиль' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
