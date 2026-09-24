import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useInventory } from '../../../context/InventoryContext';
import { colors, fonts, spacing } from '../../../constants/theme';
import FormField from '../../../components/FormField';
import SelectField from '../../../components/SelectField';
import PrimaryButton from '../../../components/PrimaryButton';

export default function NuevaEntrada() {
  const { products, registerEntrada } = useInventory();

  const [supplier, setSupplier] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!supplier.trim()) errs.supplier = 'Selecciona o escribe un proveedor.';
    if (!productId) errs.productId = 'Selecciona un producto.';
    if (!quantity.trim() || isNaN(Number(quantity)) || Number(quantity) <= 0) errs.quantity = 'Ingresa una cantidad válida.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    setGeneralError('');
    if (!validate()) return;
    const result = registerEntrada(productId, Number(quantity), supplier.trim(), note.trim() || undefined);
    if (!result.ok) {
      setGeneralError(result.error ?? 'No se pudo registrar la entrada.');
      return;
    }
    router.back();
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textDark} />
        </Pressable>
        <Text style={styles.title}>Nueva entrada</Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl }} keyboardShouldPersistTaps="handled">
        <FormField label="Proveedor" required placeholder="Selecciona un proveedor" value={supplier} onChangeText={setSupplier} error={errors.supplier} />

        <SelectField
          label="Producto"
          required
          placeholder="Selecciona un producto"
          value={productId}
          options={products.map((p) => ({ label: p.name, value: p.id }))}
          onSelect={setProductId}
          error={errors.productId}
        />

        <FormField label="Cantidad" required placeholder="0" keyboardType="number-pad" value={quantity} onChangeText={setQuantity} error={errors.quantity} />

        <FormField label="Observación (opcional)" placeholder="Ej. Compra #0004" value={note} onChangeText={setNote} />

        {generalError ? <Text style={styles.generalError}>{generalError}</Text> : null}

        <PrimaryButton title="Guardar" onPress={handleSave} style={{ marginTop: spacing.sm }} />
      </ScrollView>
    </KeyboardAvoidingView>
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
  generalError: {
    fontFamily: fonts.regular, fontSize: 13, color: colors.danger,
    backgroundColor: colors.dangerBg, padding: spacing.sm, borderRadius: 10, marginBottom: spacing.sm,
  },
});
