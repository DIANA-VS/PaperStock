import { Stack } from 'expo-router';

export default function ProductosLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="agregar" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
