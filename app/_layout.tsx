import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { initI18n } from '../lib/i18n';
import { LanguageProvider } from '../lib/LanguageContext';

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initI18n().then(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a6b3c' }}>
        <ActivityIndicator color="#fff" size="large" />
      </View>
    );
  }

  return (
    <LanguageProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="splash" />
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="land" />
        <Stack.Screen name="learn" />
        <Stack.Screen name="grow" />
        <Stack.Screen name="sell" />
        <Stack.Screen name="mandi" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="calculator" />
        <Stack.Screen name="chat" />
        <Stack.Screen name="disease" />
        <Stack.Screen name="plan" />
        <Stack.Screen name="post-listing" />
      </Stack>
    </LanguageProvider>
  );
}