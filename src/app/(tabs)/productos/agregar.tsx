import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useInventory } from '../../../context/InventoryContext';
import { colors, fonts, spacing } from '../../../constants/theme';
import FormField from '../../../components/FormField';
import SelectField from '../../../components/SelectField';
import PrimaryButton from '../../../components/PrimaryButton';

export default function AgregarProducto() {
  const { categories, addProduct } = useInventory();

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [minStock, setMinStock] = useState('');
  const [supplier, setSupplier] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    addProduct({
      name: name.trim(),
      categoryId,
      description: description.trim() || undefined,
      price: Number(price),
      quantity: Number(quantity),
      minStock: Number(minStock),
      supplier: supplier.trim() || undefined,
    });
    router.back();
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textDark} />
        </Pressable>
        <Text style={styles.title}>Agregar producto</Text>
        <Pressable onPress={handleSave} style={styles.iconBtn}>
          <Ionicons name="checkmark" size={24} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl }} keyboardShouldPersistTaps="handled">
        <FormField label="Nombre del producto" required placeholder="Ej. Cuaderno profesional" value={name} onChangeText={setName} error={errors.name} />

        <SelectField
          label="Categoría"
          required
          placeholder="Selecciona una categoría"
          value={categoryId}
          options={categories.map((c) => ({ label: c.name, value: c.id }))}
          onSelect={setCategoryId}
          error={errors.categoryId}
        />

        <FormField
          label="Descripción"
          placeholder="Ingresa una descripción"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          style={{ height: 80, textAlignVertical: 'top' }}
        />

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: spacing.sm }}>
            <FormField label="Precio" required placeholder="$ 0.00" keyboardType="decimal-pad" value={price} onChangeText={setPrice} error={errors.price} />
          </View>
          <View style={{ flex: 1 }}>
            <FormField label="Stock" required placeholder="0" keyboardType="number-pad" value={quantity} onChangeText={setQuantity} error={errors.quantity} />
          </View>
        </View>

        <FormField label="Stock mínimo" required placeholder="0" keyboardType="number-pad" value={minStock} onChangeText={setMinStock} error={errors.minStock} />

        <FormField label="Proveedor" placeholder="Nombre del proveedor" value={supplier} onChangeText={setSupplier} />

        <PrimaryButton title="Guardar" onPress={handleSave} style={{ marginTop: spacing.sm }} />
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
});
