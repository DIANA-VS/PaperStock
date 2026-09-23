import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    ViewStyle,
} from "react-native";
import { colors, fonts, radius } from "../constants/theme";

interface Props {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "outline" | "danger";
  style?: ViewStyle;
}

export default function PrimaryButton({
  title,
  onPress,
  loading,
  disabled,
  variant = "primary",
  style,
}: Props) {
  const isOutline = variant === "outline";
  const isDanger = variant === "danger";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        isOutline && styles.outline,
        isDanger && styles.danger,
        !isOutline && !isDanger && styles.primary,
        (disabled || loading) && styles.disabled,
        pressed && { opacity: 0.85 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? colors.primary : "#fff"} />
      ) : (
        <Text style={[styles.text, isOutline && styles.textOutline]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: {
    backgroundColor: colors.primary,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  danger: {
    backgroundColor: colors.danger,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: "#fff",
  },
  textOutline: {
    color: colors.primary,
  },
});
