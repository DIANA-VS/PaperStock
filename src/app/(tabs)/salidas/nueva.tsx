import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useInventory } from '../../../context/InventoryContext';
import { colors, fonts, radius, spacing } from '../../../constants/theme';
import FormField from '../../../components/FormField';
import SelectField from '../../../components/SelectField';
import PrimaryButton from '../../../components/PrimaryButton';

export default function NuevaSalida() {
  const { products, registerSalida, getProduct } = useInventory();

  const [tipo, setTipo] = useState<'venta' | 'uso_interno'>('venta');
  const [client, setClient] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');

  const selectedProduct = productId ? getProduct(productId) : undefined;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!client.trim()) errs.client = tipo === 'venta' ? 'Ingresa el nombre del cliente.' : 'Describe el motivo del uso interno.';
    if (!productId) errs.productId = 'Selecciona un producto.';
    if (!quantity.trim() || isNaN(Number(quantity)) || Number(quantity) <= 0) errs.quantity = 'Ingresa una cantidad válida.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    setGeneralError('');
    if (!validate()) return;
    const result = registerSalida(productId, Number(quantity), client.trim(), tipo);
    if (!result.ok) {
      setGeneralError(result.error ?? 'No se pudo registrar la salida.');
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
        <Text style={styles.title}>Nueva salida</Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl }} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>
          Tipo de salida <Text style={{ color: colors.danger }}>*</Text>
        </Text>
        <View style={styles.tabsRow}>
          <Pressable style={[styles.tab, tipo === 'venta' && styles.tabActive]} onPress={() => setTipo('venta')}>
            <Text style={[styles.tabText, tipo === 'venta' && styles.tabTextActive]}>Venta</Text>
          </Pressable>
          <Pressable style={[styles.tab, tipo === 'uso_interno' && styles.tabActive]} onPress={() => setTipo('uso_interno')}>
            <Text style={[styles.tabText, tipo === 'uso_interno' && styles.tabTextActive]}>Uso interno</Text>
          </Pressable>
        </View>

        <FormField
          label={tipo === 'venta' ? 'Cliente' : 'Motivo'}
          required
          placeholder={tipo === 'venta' ? 'Nombre del cliente' : 'Ej. Consumo interno de oficina'}
          value={client}
          onChangeText={setClient}
          error={errors.client}
        />

        <SelectField
          label="Producto"
          required
          placeholder="Selecciona un producto"
          value={productId}
          options={products.map((p) => ({ label: `${p.name} (${p.quantity} disp.)`, value: p.id }))}
          onSelect={setProductId}
          error={errors.productId}
        />

        <FormField
          label="Cantidad"
          required
          placeholder="0"
          keyboardType="number-pad"
          value={quantity}
          onChangeText={setQuantity}
          error={errors.quantity}
        />
        {selectedProduct ? (
          <Text style={styles.helperText}>Disponible: {selectedProduct.quantity} pzas.</Text>
        ) : null}

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
  label: { fontFamily: fonts.medium, fontSize: 13, color: colors.textDark, marginBottom: 8 },
  tabsRow: { flexDirection: 'row', marginBottom: spacing.md },
  tab: {
    flex: 1, paddingVertical: 10, alignItems: 'center', backgroundColor: colors.gray,
    borderRadius: radius.sm, marginRight: 8,
  },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontFamily: fonts.medium, fontSize: 13, color: colors.textDark },
  tabTextActive: { color: '#fff' },
  helperText: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, marginTop: -8, marginBottom: spacing.md },
  generalError: {
    fontFamily: fonts.regular, fontSize: 13, color: colors.danger,
    backgroundColor: colors.dangerBg, padding: spacing.sm, borderRadius: 10, marginBottom: spacing.sm,
  },
});
