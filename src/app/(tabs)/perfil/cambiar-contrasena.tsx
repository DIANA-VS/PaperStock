import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../constants/supabaseConfig';
import { colors, fonts, spacing } from '../../../constants/theme';
import FormField from '../../../components/FormField';
import PrimaryButton from '../../../components/PrimaryButton';

export default function CambiarContrasena() {
  const [current, setCurrent] = useState('');
  const [nueva, setNueva] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!current.trim()) errs.current = 'Ingresa tu contraseña actual.';
    if (!nueva.trim() || nueva.length < 6) errs.nueva = 'La nueva contraseña debe tener al menos 6 caracteres.';
    if (nueva !== confirmar) errs.confirmar = 'Las contraseñas no coinciden.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      const { data: userData } = await supabase.auth.getUser();
      const email = userData.user?.email;
      if (!email) {
        Alert.alert('Error', 'No se encontró tu sesión activa.');
        return;
      }

      // Confirma la contraseña actual volviendo a iniciar sesión con ella
      const { error: reauthError } = await supabase.auth.signInWithPassword({ email, password: current });
      if (reauthError) {
        setErrors({ current: 'Tu contraseña actual no es correcta.' });
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({ password: nueva });
      if (updateError) {
        Alert.alert('Error', 'No se pudo actualizar la contraseña. Intenta de nuevo.');
        return;
      }

      Alert.alert('Listo', 'Tu contraseña se actualizó correctamente.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert('Error', 'No se pudo actualizar la contraseña. Intenta de nuevo.');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textDark} />
        </Pressable>
        <Text style={styles.title}>Cambiar contraseña</Text>
        <Pressable onPress={handleSave} style={styles.iconBtn}>
          <Ionicons name="checkmark" size={24} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl }} keyboardShouldPersistTaps="handled">
        <FormField label="Contraseña actual" required secureTextEntry value={current} onChangeText={setCurrent} error={errors.current} />
        <FormField label="Nueva contraseña" required secureTextEntry value={nueva} onChangeText={setNueva} error={errors.nueva} />
        <FormField label="Confirmar nueva contraseña" required secureTextEntry value={confirmar} onChangeText={setConfirmar} error={errors.confirmar} />
        <PrimaryButton title="Actualizar contraseña" onPress={handleSave} style={{ marginTop: spacing.sm }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingTop: spacing.lg, paddingBottom: spacing.sm,
  },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.textDark },
});
