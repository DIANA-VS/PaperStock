import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, shadow, spacing } from '../constants/theme';

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
  bgColor: string;
  iconColor?: string;
}

export default function StatCard({ icon, label, value, bgColor, iconColor = colors.textDark }: Props) {
  return (
    <View style={[styles.card, { backgroundColor: bgColor }]}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexBasis: '48%',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadow.card,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  value: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.textDark,
  },
  label: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textDark,
    opacity: 0.75,
    marginTop: 2,
  },
});
