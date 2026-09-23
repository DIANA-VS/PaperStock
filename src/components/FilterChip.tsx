import { Pressable, StyleSheet, Text } from "react-native";
import { colors, fonts, radius } from "../constants/theme";

export default function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
    >
      <Text style={[styles.text, active && styles.textActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.gray,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: colors.primary,
  },
  text: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textDark,
  },
  textActive: {
    color: "#fff",
  },
});
