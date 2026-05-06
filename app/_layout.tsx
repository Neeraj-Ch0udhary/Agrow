import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
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
    </Stack>
  );
}