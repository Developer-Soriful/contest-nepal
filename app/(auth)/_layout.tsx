import { Redirect, Stack } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../../src/contexts/AuthContext';

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while checking auth state
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  // Redirect to home if already authenticated
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  // Render auth screens if not authenticated
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="forget" />
      <Stack.Screen name="verify-email" />
      <Stack.Screen name="change-password" />
    </Stack>
  );
}
