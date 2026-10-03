import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../constants/supabaseConfig';
import { colors, fonts, radius, shadow, spacing } from '../../constants/theme';

interface CategorySummary {
  category_name: string;
  total_products: number;
  total_units: number;
  total_value: number;
}

interface ProductWithCategory {
  id: string;
  name: string;
  price: number;
  quantity: number;
  categories: { name: string } | null;
}

interface LowStockProduct {
  id: string;
  name: string;
  quantity: number;
  min_stock: number;
}

const QUERY_1_SQL = `SELECT p.name, p.price, p.quantity, c.name AS category
FROM products p
JOIN categories c ON c.id = p.category_id
ORDER BY p.price DESC
LIMIT 5;`;

const QUERY_2_SQL = `SELECT name, quantity, min_stock
FROM products
WHERE quantity <= min_stock
ORDER BY quantity ASC;`;

const QUERY_3_SQL = `SELECT c.name AS category_name,
       COUNT(p.id) AS total_products,
       SUM(p.quantity) AS total_units,
       SUM(p.price * p.quantity) AS total_value
FROM categories c
LEFT JOIN products p ON p.category_id = c.id
GROUP BY c.name
ORDER BY total_value DESC;`;

export default function ConsultasSQLScreen() {
  const [loading, setLoading] = useState(true);
  const [topPriced, setTopPriced] = useState<ProductWithCategory[]>([]);
  const [lowStock, setLowStock] = useState<LowStockProduct[]>([]);
  const [byCategory, setByCategory] = useState<CategorySummary[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);

      // Consulta 1: JOIN entre products y categories, ordenada por precio
      const q1 = await supabase
        .from('products')
        .select('id, name, price, quantity, categories(name)')
        .order('price', { ascending: false })
        .limit(5);
      if (q1.data) setTopPriced(q1.data as any);

      // Consulta 2: filtro (WHERE) + ordenamiento (ORDER BY)
      const q2 = await supabase
        .from('products')
        .select('id, name, quantity, min_stock')
        .order('quantity', { ascending: true });
      if (q2.data) setLowStock((q2.data as any).filter((p: any) => p.quantity <= p.min_stock));

      // Consulta 3: vista con JOIN + GROUP BY + funciones de agregación (COUNT, SUM)
      const q3 = await supabase.from('inventory_value_by_category').select('*');
      if (q3.data) setByCategory(q3.data as any);

      setLoading(false);
    })();
  }, []);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textDark} />
        </Pressable>
        <Text style={styles.title}>Consultas SQL</Text>
        <View style={styles.iconBtn} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl }}>
          <QueryBlock title="1. Productos más caros (JOIN + ORDER BY)" sql={QUERY_1_SQL}>
            {topPriced.map((p) => (
              <View key={p.id} style={styles.row}>
                <Text style={styles.rowText}>{p.name}</Text>
                <Text style={styles.rowSub}>{p.categories?.name ?? '—'}</Text>
                <Text style={styles.rowValue}>${p.price.toFixed(2)}</Text>
              </View>
            ))}
          </QueryBlock>

          <QueryBlock title="2. Productos con stock bajo (WHERE + ORDER BY)" sql={QUERY_2_SQL}>
            {lowStock.length === 0 ? (
              <Text style={styles.empty}>No hay productos con stock bajo.</Text>
            ) : (
              lowStock.map((p) => (
                <View key={p.id} style={styles.row}>
                  <Text style={styles.rowText}>{p.name}</Text>
                  <Text style={styles.rowValue}>{p.quantity} / mín. {p.min_stock}</Text>
                </View>
              ))
            )}
          </QueryBlock>

          <QueryBlock title="3. Valor de inventario por categoría (JOIN + GROUP BY + SUM/COUNT)" sql={QUERY_3_SQL}>
            {byCategory.map((c) => (
              <View key={c.category_name} style={styles.row}>
                <Text style={styles.rowText}>{c.category_name}</Text>
                <Text style={styles.rowSub}>{c.total_products} productos · {c.total_units} pzas.</Text>
                <Text style={styles.rowValue}>${Number(c.total_value).toFixed(2)}</Text>
              </View>
            ))}
          </QueryBlock>
        </ScrollView>
      )}
    </View>
  );
}

function QueryBlock({ title, sql, children }: { title: string; sql: string; children: React.ReactNode }) {
  return (
    <View style={styles.block}>
      <Text style={styles.blockTitle}>{title}</Text>
      <View style={styles.sqlBox}>
        <Text style={styles.sqlText}>{sql}</Text>
      </View>
      <View style={styles.resultsBox}>{children}</View>
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
  block: { marginBottom: spacing.lg },
  blockTitle: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.textDark, marginBottom: spacing.sm },
  sqlBox: {
    backgroundColor: '#2B2B36', borderRadius: radius.sm, padding: spacing.sm + 2, marginBottom: spacing.sm,
  },
  sqlText: { fontFamily: 'Courier', fontSize: 11, color: '#9CDCFE', lineHeight: 16 },
  resultsBox: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.sm + 4, ...shadow.card },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  rowText: { fontFamily: fonts.medium, fontSize: 13, color: colors.textDark, flex: 1 },
  rowSub: { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted, marginRight: spacing.sm },
  rowValue: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.textDark },
  empty: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.sm },
});
