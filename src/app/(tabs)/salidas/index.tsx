import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useInventory } from '../../../context/InventoryContext';
import { colors, fonts, radius, shadow, spacing } from '../../../constants/theme';
import SearchBar from '../../../components/SearchBar';
import FilterChip from '../../../components/FilterChip';
import EmptyState from '../../../components/EmptyState';

const FILTERS = [
  { key: 'todas', label: 'Todas' },
  { key: 'hoy', label: 'Hoy' },
  { key: 'semana', label: 'Esta semana' },
];

export default function SalidasScreen() {
  const { movements, getProduct } = useInventory();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('todas');

  const salidas = useMemo(() => movements.filter((m) => m.type === 'salida'), [movements]);

  const filtered = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);

    return salidas.filter((m) => {
      const product = getProduct(m.productId);
      const matchesSearch = (product?.name ?? '').toLowerCase().includes(search.toLowerCase()) || (m.client ?? '').toLowerCase().includes(search.toLowerCase());
      if (!matchesSearch) return false;
      const date = new Date(m.date);
      if (filter === 'hoy') return date.toDateString() === now.toDateString();
      if (filter === 'semana') return date >= weekAgo;
      return true;
    });
  }, [salidas, search, filter]);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Salidas</Text>
        <Pressable style={styles.addButton} onPress={() => router.push('/(tabs)/salidas/nueva')}>
          <Ionicons name="add" size={22} color="#fff" />
        </Pressable>
      </View>

      <View style={{ paddingHorizontal: spacing.lg }}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Buscar salida..." />
      </View>

      <View style={{ paddingLeft: spacing.lg, marginTop: spacing.sm, marginBottom: spacing.sm, flexDirection: 'row' }}>
        {FILTERS.map((f) => (
          <FilterChip key={f.key} label={f.label} active={filter === f.key} onPress={() => setFilter(f.key)} />
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xl }}
        renderItem={({ item }) => {
          const product = getProduct(item.productId);
          return (
            <View style={styles.card}>
              <View style={styles.iconWrap}>
                <Ionicons name="cube-outline" size={20} color={colors.danger} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{product?.name ?? 'Producto'}</Text>
                <Text style={styles.sub}>{item.client ?? 'Sin cliente'}</Text>
                <Text style={styles.date}>
                  {new Date(item.date).toLocaleDateString('es-MX')} · {item.quantity} pzas.
                </Text>
              </View>
              <Text style={styles.qty}>-{item.quantity}</Text>
            </View>
          );
        }}
        ListEmptyComponent={<EmptyState icon="arrow-up-circle-outline" title="Sin salidas registradas" subtitle="Registra una nueva salida de mercancía." />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, paddingTop: spacing.lg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, marginBottom: spacing.md,
  },
  title: { fontFamily: fonts.bold, fontSize: 20, color: colors.textDark },
  addButton: {
    width: 40, height: 40, borderRadius: radius.sm, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card,
    borderRadius: radius.md, padding: spacing.sm + 4, marginBottom: spacing.sm, ...shadow.card,
  },
  iconWrap: {
    width: 40, height: 40, borderRadius: radius.sm, backgroundColor: colors.dangerBg,
    alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm + 2,
  },
  name: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.textDark },
  sub: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  date: { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted, marginTop: 2 },
  qty: { fontFamily: fonts.bold, fontSize: 14, color: colors.danger },
});
