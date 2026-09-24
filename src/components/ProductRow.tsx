import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, shadow, spacing } from '../constants/theme';
import { Product, Category, getStockStatus } from '../types';
import StatusBadge from './StatusBadge';

interface Props {
  product: Product;
  category?: Category;
  onPress?: () => void;
  showPrice?: boolean;
}

export default function ProductRow({ product, category, onPress, showPrice = true }: Props) {
  const status = getStockStatus(product);

  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={[styles.iconWrap, { backgroundColor: category?.color ?? colors.gray }]}>
        <Ionicons name={(category?.icon as any) ?? 'cube-outline'} size={20} color={colors.textDark} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
        <Text style={styles.category} numberOfLines={1}>{category?.name ?? 'Sin categoría'}</Text>
      </View>
      <View style={styles.right}>
        {showPrice ? (
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>
        ) : (
          <Text style={styles.qty}>{product.quantity} pzas.</Text>
        )}
        <StatusBadge status={status} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.sm + 4,
    marginBottom: spacing.sm,
    ...shadow.card,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm + 2,
  },
  info: {
    flex: 1,
    marginRight: spacing.sm,
  },
  name: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.textDark,
  },
  category: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
  },
  price: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.textDark,
    marginBottom: 4,
  },
  qty: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.textDark,
    marginBottom: 4,
  },
});
