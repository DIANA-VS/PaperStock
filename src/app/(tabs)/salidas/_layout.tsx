import { Stack } from 'expo-router';

export default function SalidasLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="nueva" />
    </Stack>
  );
}
