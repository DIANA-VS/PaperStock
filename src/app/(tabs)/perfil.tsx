import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { colors, fonts, radius, shadow, spacing } from '../../constants/theme';

const MENU_ITEMS: { icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { icon: 'person-outline', label: 'Editar perfil' },
  { icon: 'lock-closed-outline', label: 'Cambiar contraseña' },
  { icon: 'notifications-outline', label: 'Notificaciones' },
  { icon: 'help-circle-outline', label: 'Ayuda' },
];

export default function PerfilScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Seguro que quieres cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Mi perfil</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(user?.name ?? 'DV').slice(0, 2).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{user?.name ?? 'Usuario'}</Text>
        <Text style={styles.role}>{user?.role ?? 'Administrador'}</Text>
        {user?.email ? <Text style={styles.email}>{user.email}</Text> : null}
      </View>

      <View style={styles.menu}>
        {MENU_ITEMS.map((item) => (
          <Pressable key={item.label} style={styles.menuItem}>
            <View style={styles.menuIconWrap}>
              <Ionicons name={item.icon} size={18} color={colors.textDark} />
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </Pressable>
        ))}

        <Pressable style={styles.menuItem} onPress={handleLogout}>
          <View style={[styles.menuIconWrap, { backgroundColor: colors.dangerBg }]}>
            <Ionicons name="log-out-outline" size={18} color={colors.danger} />
          </View>
          <Text style={[styles.menuLabel, { color: colors.danger }]}>Cerrar sesión</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  header: { marginBottom: spacing.lg },
  title: { fontFamily: fonts.bold, fontSize: 20, color: colors.textDark },
  profileCard: {
    alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.lg,
    paddingVertical: spacing.lg, marginBottom: spacing.lg, ...shadow.card,
  },
  avatar: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: colors.lavender,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm,
  },
  avatarText: { fontFamily: fonts.bold, fontSize: 22, color: colors.primaryDark },
  name: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.textDark },
  role: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  email: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  menu: { backgroundColor: colors.card, borderRadius: radius.lg, ...shadow.card },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  menuIconWrap: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: colors.gray,
    alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm + 2,
  },
  menuLabel: { flex: 1, fontFamily: fonts.medium, fontSize: 14, color: colors.textDark },
});
