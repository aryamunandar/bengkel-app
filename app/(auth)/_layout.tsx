import { Stack } from 'expo-router';
import React from 'react';
import { GarageTheme } from '@/constants/garage-theme';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: GarageTheme.bg,
        },
        headerTintColor: GarageTheme.goldBright,
        headerTitleStyle: {
          fontWeight: '800',
        },
        headerTitleAlign: 'center',
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: GarageTheme.bg,
        },
      }}
    >
      <Stack.Screen name="login" options={{ title: 'Johan Garage' }} />
      <Stack.Screen name="register" options={{ title: 'Johan Garage' }} />
    </Stack>
  );
}
