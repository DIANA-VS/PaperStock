import { Stack } from 'expo-router';

export default function EntradasLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="nueva" />
    </Stack>
  );
}
