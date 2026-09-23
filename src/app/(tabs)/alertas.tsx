import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useInventory } from '../../context/InventoryContext';
import { colors, fonts, radius, shadow, spacing } from '../../constants/theme';
import FilterChip from '../../components/FilterChip';
import EmptyState from '../../components/EmptyState';
import { getStockStatus } from '../../types';

export default function AlertasScreen() {
  const { products } = useInventory();
  const [filter, setFilter] = useState<'bajo' | 'sin_stock'>('bajo');

  const alertProducts = useMemo(
    () => products.filter((p) => getStockStatus(p) === filter),
    [products, filter]
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textDark} />
        </Pressable>
        <Text style={styles.title}>Alertas de stock</Text>
        <View style={styles.iconBtn} />
      </View>

      <View style={{ paddingHorizontal: spacing.lg, flexDirection: 'row', marginBottom: spacing.sm }}>
        <FilterChip label="Stock bajo" active={filter === 'bajo'} onPress={() => setFilter('bajo')} />
        <FilterChip label="Sin stock" active={filter === 'sin_stock'} onPress={() => setFilter('sin_stock')} />
      </View>

      <FlatList
        data={alertProducts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.sm }}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => router.push(`/(tabs)/productos/${item.id}`)}>
            <View style={[styles.iconWrap, { backgroundColor: filter === 'sin_stock' ? colors.dangerBg : colors.warningBg }]}>
              <Ionicons name="alert-circle" size={20} color={filter === 'sin_stock' ? colors.danger : colors.warning} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.sub}>{item.quantity} pzas. disponibles</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        )}
        ListEmptyComponent={<EmptyState icon="checkmark-circle-outline" title="Todo en orden" subtitle="No hay productos en este estado por ahora." />}
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
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card,
    borderRadius: radius.md, padding: spacing.sm + 4, marginBottom: spacing.sm, ...shadow.card,
  },
  iconWrap: {
    width: 40, height: 40, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm + 2,
  },
  name: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.textDark },
  sub: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, marginTop: 2 },
});
