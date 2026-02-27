import React from 'react';
import { View, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors, useRadius, useSpacing, useTypography } from '../hooks/useTheme';
import { CreditEntry } from '../types';

function formatCurrency(amount: number) {
  return `RM ${amount.toFixed(2)}`;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-MY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

interface CreditEntryCardProps {
  entry: CreditEntry;
  onPress?: () => void;
  showShop?: boolean;
  showCustomer?: boolean;
}

export default function CreditEntryCard({
  entry,
  onPress,
  showShop = false,
  showCustomer = true,
}: CreditEntryCardProps) {
  const colors = useColors();
  const spacing = useSpacing();
  const radius = useRadius();
  const typography = useTypography();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        backgroundColor: colors.card,
        borderRadius: radius.lg,
        padding: spacing.md,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: typography.base, fontWeight: '700', color: colors.text }}>
            {entry.item}
          </Text>
          {showCustomer && (
            <Text style={{ fontSize: typography.sm, color: colors.textSecondary, marginTop: 2 }}>
              <Ionicons name="person-outline" size={12} /> {entry.customerName}
            </Text>
          )}
          {showShop && (
            <Text style={{ fontSize: typography.sm, color: colors.textSecondary, marginTop: 2 }}>
              <Ionicons name="storefront-outline" size={12} /> {entry.shopName}
            </Text>
          )}
          <Text style={{ fontSize: typography.xs, color: colors.textSecondary, marginTop: 4 }}>
            <Ionicons name="calendar-outline" size={11} /> {formatDate(entry.date)}
          </Text>
        </View>

        <View style={{ alignItems: 'flex-end', gap: 4 }}>
          <Text style={{ fontSize: typography.lg, fontWeight: '800', color: colors.text }}>
            {formatCurrency(entry.amount)}
          </Text>
          <View
            style={{
              backgroundColor: entry.isPaid ? colors.successBackground : colors.warningBackground,
              paddingHorizontal: spacing.sm,
              paddingVertical: 2,
              borderRadius: radius.full,
            }}
          >
            <Text
              style={{
                fontSize: typography.xs,
                fontWeight: '600',
                color: entry.isPaid ? colors.success : colors.warning,
              }}
            >
              {entry.isPaid ? 'Paid' : 'Unpaid'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
