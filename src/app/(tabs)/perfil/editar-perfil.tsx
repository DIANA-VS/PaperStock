import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../context/AuthContext';
import { colors, fonts, spacing } from '../../../constants/theme';
import FormField from '../../../components/FormField';
import PrimaryButton from '../../../components/PrimaryButton';

export default function EditarPerfil() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSave = async () => {
    if (!name.trim()) {
      setErrors({ name: 'El nombre es obligatorio.' });
      return;
    }
    await updateProfile(name.trim(), user?.email ?? '');
    Alert.alert('Listo', 'Tu perfil se actualizó correctamente.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textDark} />
        </Pressable>
        <Text style={styles.title}>Editar perfil</Text>
        <Pressable onPress={handleSave} style={styles.iconBtn}>
          <Ionicons name="checkmark" size={24} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl }} keyboardShouldPersistTaps="handled">
        <FormField label="Nombre" required placeholder="Tu nombre" value={name} onChangeText={setName} error={errors.name} />
        <FormField
          label="Correo"
          value={email}
          editable={false}
          style={{ opacity: 0.6 }}
        />
        <Text style={styles.hint}>El correo no se puede cambiar por seguridad de la cuenta.</Text>
        <PrimaryButton title="Guardar cambios" onPress={handleSave} style={{ marginTop: spacing.sm }} />
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
  hint: { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted, marginTop: -8, marginBottom: spacing.md },
});
