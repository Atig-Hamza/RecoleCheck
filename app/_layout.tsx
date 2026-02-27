import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

import { AppColors } from '@/constants/colors';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

function RootNavigator() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={AppColors.primary} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerTintColor: AppColors.primary,
        headerStyle: { backgroundColor: AppColors.white },
        headerTitleStyle: { fontWeight: '600', fontSize: 17, color: AppColors.text },
        headerShadowVisible: false,
        headerBackTitle: 'Back',
        contentStyle: { backgroundColor: AppColors.background },
      }}
    >
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="parcelle/[id]" options={{ headerShown: true, title: 'Plot Details' }} />
      <Stack.Screen name="parcelle/form" options={{ headerShown: true, title: 'New Plot' }} />
      <Stack.Screen name="zone/[id]" options={{ headerShown: true, title: 'Zone Details' }} />
      <Stack.Screen name="zone/form" options={{ headerShown: true, title: 'New Zone' }} />
      <Stack.Screen name="recolte/form" options={{ headerShown: true, title: 'New Harvest' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
      <StatusBar style="dark" />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.background,
  },
});
