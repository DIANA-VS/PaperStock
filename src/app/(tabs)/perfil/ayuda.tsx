import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, shadow, spacing } from '../../../constants/theme';

const FAQS = [
  {
    q: '¿Cómo registro una entrada de mercancía?',
    a: 'Ve al módulo Entradas desde la barra inferior, toca el botón + y llena el formulario con el proveedor, el producto y la cantidad recibida.',
  },
  {
    q: '¿Cómo sé qué productos necesitan reabastecerse?',
    a: 'En el Dashboard o en el módulo Alertas de stock puedes ver los productos con stock bajo o sin existencia.',
  },
  {
    q: '¿Por qué no me deja registrar una salida?',
    a: 'La app no permite registrar una salida mayor a la cantidad disponible en el inventario, para evitar inconsistencias en el stock.',
  },
  {
    q: '¿Dónde se guarda la información?',
    a: 'Todos los datos se guardan localmente en tu dispositivo. Si desinstalas la app o borras sus datos, la información se perderá.',
  },
  {
    q: '¿Cómo agrego una nueva categoría?',
    a: 'Desde el Dashboard, en Accesos rápidos, entra a Categorías y toca el ícono + en la esquina superior derecha.',
  },
];

export default function AyudaScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textDark} />
        </Pressable>
        <Text style={styles.title}>Ayuda</Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl }}>
        <Text style={styles.sectionTitle}>Preguntas frecuentes</Text>
        {FAQS.map((item) => (
          <View key={item.q} style={styles.card}>
            <View style={styles.qRow}>
              <Ionicons name="help-circle-outline" size={18} color={colors.primary} />
              <Text style={styles.question}>{item.q}</Text>
            </View>
            <Text style={styles.answer}>{item.a}</Text>
          </View>
        ))}

        <View style={styles.contactCard}>
          <Ionicons name="mail-outline" size={20} color={colors.textDark} />
          <Text style={styles.contactText}>
            ¿Necesitas más ayuda? Contacta al administrador del sistema para soporte adicional.
          </Text>
        </View>
      </ScrollView>
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
  sectionTitle: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.textDark, marginBottom: spacing.sm },
  card: {
    backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.sm + 4,
    marginBottom: spacing.sm, ...shadow.card,
  },
  qRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  question: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.textDark, marginLeft: 8, flex: 1 },
  answer: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, lineHeight: 18, marginLeft: 26 },
  contactCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.lavender,
    borderRadius: radius.md, padding: spacing.md, marginTop: spacing.sm,
  },
  contactText: { fontFamily: fonts.regular, fontSize: 12, color: colors.textDark, marginLeft: spacing.sm, flex: 1, lineHeight: 18 },
});
