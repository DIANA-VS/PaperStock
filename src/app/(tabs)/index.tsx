import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useInventory } from '../../context/InventoryContext';
import { colors, fonts, radius, shadow, spacing } from '../../constants/theme';
import StatCard from '../../components/StatCard';
import { getStockStatus } from '../../types';

export default function Dashboard() {
  const { user } = useAuth();
  const { products, movements, notifications, getProduct } = useInventory();

  const total = products.length;
  const normal = products.filter((p) => getStockStatus(p) === 'normal').length;
  const bajo = products.filter((p) => getStockStatus(p) === 'bajo').length;
  const sinStock = products.filter((p) => getStockStatus(p) === 'sin_stock').length;

  const today = new Date().toDateString();
  const entradasHoy = movements.filter((m) => m.type === 'entrada' && new Date(m.date).toDateString() === today).length;
  const salidasHoy = movements.filter((m) => m.type === 'salida' && new Date(m.date).toDateString() === today).length;

  const unreadCount = notifications.filter((n) => !n.read).length;
  const recientes = movements.slice(0, 3);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl }}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola, {user?.name ?? 'Diana'} 👋</Text>
          <Text style={styles.subGreeting}>Aquí tienes un resumen de tu papelería</Text>
        </View>
        <Pressable style={styles.bellWrap} onPress={() => router.push('/(tabs)/notificaciones')}>
          <Ionicons name="notifications-outline" size={22} color={colors.textDark} />
          {unreadCount > 0 && <View style={styles.dot} />}
        </Pressable>
      </View>

      <View style={styles.statsGrid}>
        <StatCard icon="cube-outline" label="Total de productos" value={total} bgColor={colors.bluePastel} />
        <StatCard icon="alert-circle-outline" label="Stock bajo" value={bajo} bgColor={colors.yellowPastel} />
        <StatCard icon="arrow-down-circle-outline" label="Entradas (hoy)" value={entradasHoy} bgColor={colors.greenPastel} />
        <StatCard icon="arrow-up-circle-outline" label="Salidas (hoy)" value={salidasHoy} bgColor={colors.pinkPastel} />
      </View>

      <View style={styles.summaryRow}>
        <View style={[styles.summaryPill, { backgroundColor: colors.successBg }]}>
          <Text style={[styles.summaryValue, { color: colors.success }]}>{normal}</Text>
          <Text style={styles.summaryLabel}>Stock normal</Text>
        </View>
        <View style={[styles.summaryPill, { backgroundColor: colors.warningBg }]}>
          <Text style={[styles.summaryValue, { color: colors.warning }]}>{bajo}</Text>
          <Text style={styles.summaryLabel}>Stock bajo</Text>
        </View>
        <View style={[styles.summaryPill, { backgroundColor: colors.dangerBg }]}>
          <Text style={[styles.summaryValue, { color: colors.danger }]}>{sinStock}</Text>
          <Text style={styles.summaryLabel}>Sin stock</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Movimientos recientes</Text>
        <Pressable onPress={() => router.push('/(tabs)/entradas')}>
          <Text style={styles.link}>Ver todos ›</Text>
        </Pressable>
      </View>

      {recientes.length === 0 ? (
        <Text style={styles.emptyText}>Aún no hay movimientos registrados.</Text>
      ) : (
        recientes.map((m) => {
          const product = getProduct(m.productId);
          const isEntrada = m.type === 'entrada';
          return (
            <View key={m.id} style={styles.movementRow}>
              <View style={[styles.movementIcon, { backgroundColor: isEntrada ? colors.successBg : colors.dangerBg }]}>
                <Ionicons
                  name={isEntrada ? 'arrow-down' : 'arrow-up'}
                  size={16}
                  color={isEntrada ? colors.success : colors.danger}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.movementTitle}>
                  {isEntrada ? 'Entrada' : 'Salida'} · {product?.name ?? 'Producto'}
                </Text>
                <Text style={styles.movementSub}>{m.quantity} pzas.</Text>
              </View>
              <Text style={styles.movementDate}>
                {new Date(m.date).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </Text>
            </View>
          );
        })
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Accesos rápidos</Text>
      </View>
      <View style={styles.quickGrid}>
        <QuickAccess icon="cube-outline" label="Productos" color={colors.bluePastel} onPress={() => router.push('/(tabs)/productos')} />
        <QuickAccess icon="layers-outline" label="Inventario" color={colors.greenPastel} onPress={() => router.push('/(tabs)/inventario')} />
        <QuickAccess icon="arrow-down-circle-outline" label="Entradas" color={colors.pinkPastel} onPress={() => router.push('/(tabs)/entradas')} />
        <QuickAccess icon="arrow-up-circle-outline" label="Salidas" color={colors.yellowPastel} onPress={() => router.push('/(tabs)/salidas')} />
        <QuickAccess icon="pricetags-outline" label="Categorías" color={colors.lavender} onPress={() => router.push('/(tabs)/categorias')} />
        <QuickAccess icon="warning-outline" label="Alertas" color={colors.gray} onPress={() => router.push('/(tabs)/alertas')} />
      </View>
    </ScrollView>
  );
}

function QuickAccess({ icon, label, color, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; color: string; onPress: () => void }) {
  return (
    <Pressable style={styles.quickItem} onPress={onPress}>
      <View style={[styles.quickIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={20} color={colors.textDark} />
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  greeting: { fontFamily: fonts.bold, fontSize: 20, color: colors.textDark },
  subGreeting: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, marginTop: 2 },
  bellWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  dot: {
    position: 'absolute',
    top: 8,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    marginTop: spacing.xs,
  },
  summaryPill: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
  },
  summaryValue: { fontFamily: fonts.bold, fontSize: 18 },
  summaryLabel: { fontFamily: fonts.regular, fontSize: 11, color: colors.textDark, marginTop: 2 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  sectionTitle: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.textDark },
  link: { fontFamily: fonts.medium, fontSize: 12, color: colors.primary },
  emptyText: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, marginBottom: spacing.md },
  movementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.sm + 4,
    marginBottom: spacing.sm,
    ...shadow.card,
  },
  movementIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm + 2,
  },
  movementTitle: { fontFamily: fonts.medium, fontSize: 13, color: colors.textDark },
  movementSub: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  movementDate: { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickItem: {
    width: '31%',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  quickIcon: {
    width: 54,
    height: 54,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickLabel: { fontFamily: fonts.regular, fontSize: 11, color: colors.textDark, textAlign: 'center' },
});
