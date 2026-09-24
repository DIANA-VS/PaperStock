import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Modal } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useInventory } from '../../context/InventoryContext';
import { colors, fonts, radius, shadow, spacing } from '../../constants/theme';
import FormField from '../../components/FormField';
import PrimaryButton from '../../components/PrimaryButton';

const ICON_OPTIONS = ['book-outline', 'pencil-outline', 'color-palette-outline', 'school-outline', 'triangle-outline', 'document-outline', 'briefcase-outline', 'print-outline', 'cube-outline'];
const COLOR_OPTIONS = [colors.bluePastel, colors.greenPastel, colors.pinkPastel, colors.yellowPastel, colors.lavender];

export default function CategoriasScreen() {
  const { categories, products, addCategory } = useInventory();
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(ICON_OPTIONS[0]);
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [error, setError] = useState('');

  const countFor = (categoryId: string) => products.filter((p) => p.categoryId === categoryId).length;

  const handleSave = () => {
    if (!name.trim()) {
      setError('El nombre de la categoría es obligatorio.');
      return;
    }
    addCategory(name.trim(), icon, color);
    setName('');
    setIcon(ICON_OPTIONS[0]);
    setColor(COLOR_OPTIONS[0]);
    setError('');
    setModalVisible(false);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textDark} />
        </Pressable>
        <Text style={styles.title}>Categorías</Text>
        <Pressable onPress={() => setModalVisible(true)} style={styles.iconBtn}>
          <Ionicons name="add-circle" size={26} color={colors.primary} />
        </Pressable>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ padding: spacing.lg }}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: item.color }]}>
            <Ionicons name={item.icon as any} size={24} color={colors.textDark} />
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardCount}>{countFor(item.id)} productos</Text>
          </View>
        )}
      />

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Nueva categoría</Text>
            <FormField label="Nombre" required placeholder="Ej. Geometría" value={name} onChangeText={setName} error={error} />

            <Text style={styles.label}>Icono</Text>
            <View style={styles.optionsRow}>
              {ICON_OPTIONS.map((ic) => (
                <Pressable
                  key={ic}
                  style={[styles.iconOption, icon === ic && styles.iconOptionActive]}
                  onPress={() => setIcon(ic)}
                >
                  <Ionicons name={ic as any} size={18} color={colors.textDark} />
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>Color</Text>
            <View style={styles.optionsRow}>
              {COLOR_OPTIONS.map((c) => (
                <Pressable
                  key={c}
                  style={[styles.colorOption, { backgroundColor: c }, color === c && styles.colorOptionActive]}
                  onPress={() => setColor(c)}
                />
              ))}
            </View>

            <View style={styles.modalButtons}>
              <PrimaryButton title="Cancelar" variant="outline" onPress={() => setModalVisible(false)} style={{ flex: 1, marginRight: spacing.sm }} />
              <PrimaryButton title="Guardar" onPress={handleSave} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
  card: {
    width: '48%',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow.card,
  },
  cardTitle: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.textDark, marginTop: spacing.sm },
  cardCount: { fontFamily: fonts.regular, fontSize: 11, color: colors.textDark, opacity: 0.7, marginTop: 2 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.card, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, padding: spacing.lg },
  sheetTitle: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.textDark, marginBottom: spacing.md },
  label: { fontFamily: fonts.medium, fontSize: 13, color: colors.textDark, marginBottom: 8 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.md },
  iconOption: {
    width: 38, height: 38, borderRadius: radius.sm, backgroundColor: colors.gray,
    alignItems: 'center', justifyContent: 'center', marginRight: 8, marginBottom: 8,
  },
  iconOptionActive: { borderWidth: 2, borderColor: colors.primary },
  colorOption: { width: 34, height: 34, borderRadius: 17, marginRight: 10 },
  colorOptionActive: { borderWidth: 3, borderColor: colors.primaryDark },
  modalButtons: { flexDirection: 'row', marginTop: spacing.sm },
});
