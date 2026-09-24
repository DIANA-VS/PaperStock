import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useInventory } from '../../../context/InventoryContext';
import { colors, fonts, spacing } from '../../../constants/theme';
import FormField from '../../../components/FormField';
import SelectField from '../../../components/SelectField';
import PrimaryButton from '../../../components/PrimaryButton';
import StatusBadge from '../../../components/StatusBadge';
import { getStockStatus } from '../../../types';

export default function DetalleProducto() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getProduct, categories, updateProduct, deleteProduct } = useInventory();
  const product = getProduct(id);

  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [minStock, setMinStock] = useState('');
  const [supplier, setSupplier] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      setName(product.name);
      setCategoryId(product.categoryId);
      setDescription(product.description ?? '');
      setPrice(String(product.price));
      setQuantity(String(product.quantity));
      setMinStock(String(product.minStock));
      setSupplier(product.supplier ?? '');
    }
  }, [product?.id]);

  if (!product) {
    return (
      <View style={styles.screen}>
        <Text style={styles.notFound}>Este producto ya no existe.</Text>
        <PrimaryButton title="Volver" onPress={() => router.back()} style={{ margin: spacing.lg }} />
      </View>
    );
  }

  const category = categories.find((c) => c.id === product.categoryId);
  const status = getStockStatus(product);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'El nombre es obligatorio.';
    if (!categoryId) errs.categoryId = 'Selecciona una categoría.';
    if (!price.trim() || isNaN(Number(price)) || Number(price) < 0) errs.price = 'Ingresa un precio válido.';
    if (!quantity.trim() || isNaN(Number(quantity)) || Number(quantity) < 0) errs.quantity = 'Ingresa una cantidad válida.';
    if (!minStock.trim() || isNaN(Number(minStock)) || Number(minStock) < 0) errs.minStock = 'Ingresa un stock mínimo válido.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    updateProduct(product.id, {
      name: name.trim(),
      categoryId,
      description: description.trim() || undefined,
      price: Number(price),
      quantity: Number(quantity),
      minStock: Number(minStock),
      supplier: supplier.trim() || undefined,
    });
    setEditMode(false);
  };

  const handleDelete = () => {
    Alert.alert('Eliminar producto', `¿Seguro que quieres eliminar "${product.name}"? Esta acción no se puede deshacer.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => { deleteProduct(product.id); router.back(); } },
    ]);
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textDark} />
        </Pressable>
        <Text style={styles.title}>{editMode ? 'Editar producto' : 'Producto'}</Text>
        <Pressable onPress={() => (editMode ? handleSave() : setEditMode(true))} style={styles.iconBtn}>
          <Ionicons name={editMode ? 'checkmark' : 'create-outline'} size={22} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl }} keyboardShouldPersistTaps="handled">
        {!editMode ? (
          <>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Categoría</Text>
                <Text style={styles.infoValue}>{category?.name ?? 'Sin categoría'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Precio</Text>
                <Text style={styles.infoValue}>${product.price.toFixed(2)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Cantidad disponible</Text>
                <Text style={styles.infoValue}>{product.quantity} pzas.</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Stock mínimo</Text>
                <Text style={styles.infoValue}>{product.minStock} pzas.</Text>
              </View>
              {product.supplier ? (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Proveedor</Text>
                  <Text style={styles.infoValue}>{product.supplier}</Text>
                </View>
              ) : null}
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Estado</Text>
                <StatusBadge status={status} />
              </View>
              {product.description ? (
                <View style={{ marginTop: spacing.sm }}>
                  <Text style={styles.infoLabel}>Descripción</Text>
                  <Text style={styles.description}>{product.description}</Text>
                </View>
              ) : null}
            </View>

            <PrimaryButton title="Eliminar producto" variant="danger" onPress={handleDelete} style={{ marginTop: spacing.lg }} />
          </>
        ) : (
          <>
            <FormField label="Nombre del producto" required value={name} onChangeText={setName} error={errors.name} />
            <SelectField
              label="Categoría"
              required
              value={categoryId}
              options={categories.map((c) => ({ label: c.name, value: c.id }))}
              onSelect={setCategoryId}
              error={errors.categoryId}
            />
            <FormField label="Descripción" value={description} onChangeText={setDescription} multiline numberOfLines={3} style={{ height: 80, textAlignVertical: 'top' }} />
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: spacing.sm }}>
                <FormField label="Precio" required keyboardType="decimal-pad" value={price} onChangeText={setPrice} error={errors.price} />
              </View>
              <View style={{ flex: 1 }}>
                <FormField label="Stock" required keyboardType="number-pad" value={quantity} onChangeText={setQuantity} error={errors.quantity} />
              </View>
            </View>
            <FormField label="Stock mínimo" required keyboardType="number-pad" value={minStock} onChangeText={setMinStock} error={errors.minStock} />
            <FormField label="Proveedor" value={supplier} onChangeText={setSupplier} />
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.textDark },
  row: { flexDirection: 'row' },
  infoCard: { backgroundColor: colors.card, borderRadius: 16, padding: spacing.md },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },
  infoValue: { fontFamily: fonts.medium, fontSize: 13, color: colors.textDark },
  description: { fontFamily: fonts.regular, fontSize: 13, color: colors.textDark, marginTop: 4, lineHeight: 19 },
  notFound: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl },
});
