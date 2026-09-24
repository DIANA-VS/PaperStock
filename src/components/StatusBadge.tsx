import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, radius } from '../constants/theme';
import { StockStatus } from '../types';

const STATUS_MAP: Record<StockStatus, { label: string; bg: string; fg: string }> = {
  normal: { label: 'Normal', bg: colors.successBg, fg: colors.success },
  bajo: { label: 'Bajo', bg: colors.warningBg, fg: colors.warning },
  sin_stock: { label: 'Sin stock', bg: colors.dangerBg, fg: colors.danger },
};

export default function StatusBadge({ status }: { status: StockStatus }) {
  const s = STATUS_MAP[status];
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={[styles.text, { color: s.fg }]}>{s.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
});
