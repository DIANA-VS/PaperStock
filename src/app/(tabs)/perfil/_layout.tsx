import { Stack } from 'expo-router';

export default function PerfilLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="editar-perfil" />
      <Stack.Screen name="cambiar-contrasena" />
      <Stack.Screen name="ayuda" />
    </Stack>
  );
}
