import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useInventory } from '../../context/InventoryContext';
import { colors, fonts, radius, shadow, spacing } from '../../constants/theme';
import EmptyState from '../../components/EmptyState';
import { AppNotification } from '../../types';

const ICONS: Record<AppNotification['type'], { icon: keyof typeof Ionicons.glyphMap; bg: string; fg: string }> = {
  stock_bajo: { icon: 'alert-circle', bg: colors.warningBg, fg: colors.warning },
  sin_stock: { icon: 'close-circle', bg: colors.dangerBg, fg: colors.danger },
  entrada: { icon: 'arrow-down-circle', bg: colors.successBg, fg: colors.success },
  salida: { icon: 'arrow-up-circle', bg: colors.dangerBg, fg: colors.danger },
};

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return 'Hace un momento';
  if (hours < 24) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
  const days = Math.floor(hours / 24);
  return `Hace ${days} día${days > 1 ? 's' : ''}`;
}

export default function NotificacionesScreen() {
  const { notifications, markNotificationRead } = useInventory();

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textDark} />
        </Pressable>
        <Text style={styles.title}>Notificaciones</Text>
        <View style={styles.iconBtn} />
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.lg }}
        renderItem={({ item }) => {
          const cfg = ICONS[item.type];
          return (
            <Pressable style={[styles.card, !item.read && styles.cardUnread]} onPress={() => markNotificationRead(item.id)}>
              <View style={[styles.iconWrap, { backgroundColor: cfg.bg }]}>
                <Ionicons name={cfg.icon} size={20} color={cfg.fg} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title2}>{item.title}</Text>
                <Text style={styles.message}>{item.message}</Text>
                <Text style={styles.time}>{timeAgo(item.date)}</Text>
              </View>
              {!item.read && <View style={styles.dot} />}
            </Pressable>
          );
        }}
        ListEmptyComponent={<EmptyState icon="notifications-outline" title="Sin notificaciones" subtitle="Aquí verás avisos sobre tu inventario." />}
      />
    </View>
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
  card: {
    flexDirection: 'row', alignItems: 'flex-start', backgroundColor: colors.card,
    borderRadius: radius.md, padding: spacing.sm + 4, marginBottom: spacing.sm, ...shadow.card,
  },
  cardUnread: { borderWidth: 1, borderColor: colors.lavender },
  iconWrap: {
    width: 40, height: 40, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm + 2,
  },
  title2: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.textDark },
  message: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, marginTop: 2, lineHeight: 17 },
  time: { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted, marginTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginTop: 4 },
});
