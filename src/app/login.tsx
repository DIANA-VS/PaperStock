import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors, fonts, radius, spacing } from '../constants/theme';
import FormField from '../components/FormField';
import PrimaryButton from '../components/PrimaryButton';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? 'No se pudo iniciar sesión.');
      return;
    }
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.logoWrap}>
          <View style={styles.logoCircle}>
            <Ionicons name="book" size={34} color={colors.primary} />
          </View>
          <Text style={styles.appName}>PaperStock</Text>
          <Text style={styles.tagline}>Tu papelería, siempre en orden</Text>
        </View>

        <Text style={styles.title}>Iniciar sesión</Text>

        <FormField
          label="Correo o usuario"
          placeholder="tucorreo@ejemplo.com"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <View>
          <FormField
            label="Contraseña"
            placeholder="••••••••"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <Pressable style={styles.eyeButton} onPress={() => setShowPassword((v) => !v)}>
            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
          </Pressable>
        </View>

        {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

        <PrimaryButton title="Iniciar sesión" onPress={handleLogin} loading={loading} style={{ marginTop: spacing.sm }} />

        <Text style={styles.helper}>¿Olvidaste tu contraseña?</Text>
        <Text style={styles.helperMuted}>
          ¿No tienes una cuenta? <Text style={styles.link}>Contacta al administrador</Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.lavender,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  appName: {
    fontFamily: fonts.bold,
    fontSize: 24,
    color: colors.textDark,
  },
  tagline: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.textDark,
    marginBottom: spacing.md,
  },
  eyeButton: {
    position: 'absolute',
    right: 14,
    top: 38,
  },
  errorBanner: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.danger,
    backgroundColor: colors.dangerBg,
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginBottom: spacing.sm,
  },
  helper: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.primary,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  helperMuted: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  link: {
    color: colors.primary,
    fontFamily: fonts.medium,
  },
});
