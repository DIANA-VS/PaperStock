import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useInventory } from '../../../context/InventoryContext';
import { colors, fonts, radius, spacing } from '../../../constants/theme';
import SearchBar from '../../../components/SearchBar';
import FilterChip from '../../../components/FilterChip';
import ProductRow from '../../../components/ProductRow';
import EmptyState from '../../../components/EmptyState';

export default function ProductosScreen() {
  const { products, categories } = useInventory();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('todos');

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'todos' || p.categoryId === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, categoryFilter]);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Productos</Text>
        <Pressable style={styles.addButton} onPress={() => router.push('/(tabs)/productos/agregar')}>
          <Ionicons name="add" size={22} color="#fff" />
        </Pressable>
      </View>

      <View style={{ paddingHorizontal: spacing.lg }}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Buscar producto..." />
      </View>

      <View style={{ paddingLeft: spacing.lg, marginTop: spacing.sm, marginBottom: spacing.sm }}>
        <FlatList
          data={[{ id: 'todos', name: 'Todos' }, ...categories]}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingRight: spacing.lg }}
          renderItem={({ item }) => (
            <FilterChip label={item.name} active={categoryFilter === item.id} onPress={() => setCategoryFilter(item.id)} />
          )}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xl }}
        renderItem={({ item }) => (
          <ProductRow
            product={item}
            category={categories.find((c) => c.id === item.categoryId)}
            onPress={() => router.push(`/(tabs)/productos/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <EmptyState icon="cube-outline" title="No se encontraron productos" subtitle="Intenta con otra búsqueda o agrega un nuevo producto." />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, paddingTop: spacing.lg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  title: { fontFamily: fonts.bold, fontSize: 20, color: colors.textDark },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
