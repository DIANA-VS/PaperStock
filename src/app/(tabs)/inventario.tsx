import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useInventory } from '../../context/InventoryContext';
import { colors, fonts, spacing } from '../../constants/theme';
import SearchBar from '../../components/SearchBar';
import FilterChip from '../../components/FilterChip';
import ProductRow from '../../components/ProductRow';
import EmptyState from '../../components/EmptyState';
import { StockStatus, getStockStatus } from '../../types';

const FILTERS: { key: 'todos' | StockStatus; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'normal', label: 'Stock normal' },
  { key: 'bajo', label: 'Stock bajo' },
  { key: 'sin_stock', label: 'Sin stock' },
];

export default function InventarioScreen() {
  const { products, categories } = useInventory();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'todos' | StockStatus>('todos');

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'todos' || getStockStatus(p) === filter;
      return matchesSearch && matchesFilter;
    });
  }, [products, search, filter]);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Inventario</Text>
      </View>

      <View style={{ paddingHorizontal: spacing.lg }}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Buscar producto..." />
      </View>

      <View style={{ paddingLeft: spacing.lg, marginTop: spacing.sm, marginBottom: spacing.sm }}>
        <FlatList
          data={FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.key}
          contentContainerStyle={{ paddingRight: spacing.lg }}
          renderItem={({ item }) => (
            <FilterChip label={item.label} active={filter === item.key} onPress={() => setFilter(item.key)} />
          )}
        />
      </View>

      <View style={styles.tableHeader}>
        <Text style={[styles.th, { flex: 1 }]}>Producto</Text>
        <Text style={styles.th}>Cantidad</Text>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xl }}
        renderItem={({ item }) => (
          <ProductRow product={item} category={categories.find((c) => c.id === item.categoryId)} showPrice={false} />
        )}
        ListEmptyComponent={
          <EmptyState icon="layers-outline" title="No hay productos con este filtro" subtitle="Prueba con otro estado de stock." />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, paddingTop: spacing.lg },
  header: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  title: { fontFamily: fonts.bold, fontSize: 20, color: colors.textDark },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg + 4,
    marginBottom: 6,
  },
  th: { fontFamily: fonts.medium, fontSize: 11, color: colors.textMuted, textTransform: 'uppercase' },
});
