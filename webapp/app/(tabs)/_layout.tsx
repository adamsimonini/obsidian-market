import { View } from 'react-native';
import { Tabs } from 'expo-router';
import React from 'react';

import { Header } from '@/components/Header';
import { WalletProvider } from '@/contexts/WalletContext';
import { HapticTab } from '@/components/haptic-tab';
import { Icon } from '@/components/nativewindui/Icon';
import { useColorScheme } from '@/lib/useColorScheme';

export default function TabLayout() {
  const { colorScheme, colors } = useColorScheme();

  return (
    <WalletProvider>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Header />
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.mutedForeground,
            tabBarStyle: {
              backgroundColor: colors.card,
              borderTopColor: colors.border,
            },
            headerShown: false,
            tabBarButton: HapticTab,
          }}>
          <Tabs.Screen
            name="index"
            options={{
              title: 'Home',
              tabBarIcon: ({ color }) => (
                <Icon name="house.fill" size={28} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="account"
            options={{
              title: 'My Account',
              tabBarIcon: ({ color }) => (
                <Icon name="person.crop.circle.fill" size={28} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              title: 'Settings',
              tabBarIcon: ({ color }) => (
                <Icon name="gearshape.fill" size={28} color={color} />
              ),
            }}
          />
        </Tabs>
      </View>
    </WalletProvider>
  );
}
