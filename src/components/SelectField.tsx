import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, spacing } from '../constants/theme';

interface Option {
  label: string;
  value: string;
}

interface Props {
  label: string;
  required?: boolean;
  placeholder?: string;
  value?: string;
  options: Option[];
  onSelect: (value: string) => void;
  error?: string;
}

export default function SelectField({ label, required, placeholder = 'Selecciona una opción', value, options, onSelect, error }: Props) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>
      <Pressable style={[styles.select, error ? styles.selectError : null]} onPress={() => setOpen(true)}>
        <Text style={[styles.selectText, !selected && styles.placeholder]}>
          {selected ? selected.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              style={{ maxHeight: 340 }}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.option}
                  onPress={() => {
                    onSelect(item.value);
                    setOpen(false);
                  }}
                >
                  <Text style={styles.optionText}>{item.label}</Text>
                  {item.value === value && <Ionicons name="checkmark" size={18} color={colors.primary} />}
                </Pressable>
              )}
              ListEmptyComponent={<Text style={styles.empty}>No hay opciones disponibles.</Text>}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  label: { fontFamily: fonts.medium, fontSize: 13, color: colors.textDark, marginBottom: 6 },
  required: { color: colors.danger },
  select: {
    backgroundColor: colors.card,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectError: { borderColor: colors.danger },
  selectText: { fontFamily: fonts.regular, fontSize: 14, color: colors.textDark },
  placeholder: { color: colors.textMuted },
  error: { fontFamily: fonts.regular, fontSize: 12, color: colors.danger, marginTop: 4 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  sheetTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textDark,
    marginBottom: spacing.md,
  },
  option: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionText: { fontFamily: fonts.regular, fontSize: 14, color: colors.textDark },
  empty: { fontFamily: fonts.regular, color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.lg },
});
