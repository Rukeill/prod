import React from "react";
import { Tabs } from "expo-router";
import { Shield, Settings } from "lucide-react-native";
import { useThemeStore } from "@/store/themeStore";
import AppIcon from "@/components/AppIcon";
import { Platform } from "react-native";

export default function TabLayout() {
  const { colors, isDarkMode } = useThemeStore();
  
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          elevation: 0,
          shadowOpacity: 0.1,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.secondary,
        headerStyle: {
          backgroundColor: colors.background,
          elevation: 0,
          shadowOpacity: 0.1,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerTintColor: colors.text.primary,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "VPN Профили",
          tabBarLabel: "Профили",
          tabBarIcon: ({ color, size }) => <Shield size={size} color={color} />,
          headerLeft: () => (
            <AppIcon 
              size={32} 
              withGradient={true} 
              style={{ marginLeft: 16 }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Настройки",
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
          headerShown: Platform.OS === 'ios',
        }}
      />
    </Tabs>
  );
}