import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, shadows } from '../constants/theme';
import { formatCurrency, formatDate } from '../utils/format';

export default function CreditEntryCard({ entry, isShop, onDelete, onUpdate }) {
  const paid = !!entry.isPaid;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.item}>{entry.item || 'Untitled Item'}</Text>
          <Text style={styles.meta}>
            {isShop
              ? `Customer: ${entry.customerName || entry.customerId || '-'}`
              : `Shop: ${entry.shopName || entry.shopId || '-'}`}
          </Text>
        </View>
        <View style={[styles.badge, paid ? styles.badgePaid : styles.badgeUnpaid]}>
          <Text style={[styles.badgeText, paid ? styles.badgeTextPaid : styles.badgeTextUnpaid]}>
            {paid ? 'Paid' : 'Unpaid'}
          </Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Amount</Text>
        <Text style={styles.infoValue}>{formatCurrency(entry.amount)}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Date</Text>
        <Text style={styles.infoValue}>{formatDate(entry.date)}</Text>
      </View>
      {paid ? (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Payment Date</Text>
          <Text style={[styles.infoValue, { color: colors.success }]}>{formatDate(entry.paymentDate)}</Text>
        </View>
      ) : null}

      {isShop ? (
        <View style={styles.actionRow}>
          {!paid ? (
            <Pressable style={[styles.actionBtn, styles.updateBtn]} onPress={() => onUpdate(entry)}>
              <Text style={styles.updateText}>Mark Paid</Text>
            </Pressable>
          ) : null}
          <Pressable
            style={[styles.actionBtn, styles.deleteBtn]}
            onPress={() => {
              Alert.alert('Delete entry', 'Are you sure you want to delete this credit entry?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => onDelete(entry) },
              ]);
            }}
          >
            <Text style={styles.deleteText}>Delete</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    gap: 8,
    ...shadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  item: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  meta: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textMuted,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgePaid: {
    backgroundColor: '#dcfce7',
  },
  badgeUnpaid: {
    backgroundColor: '#fee2e2',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  badgeTextPaid: {
    color: colors.success,
  },
  badgeTextUnpaid: {
    color: colors.danger,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    color: colors.textMuted,
    fontSize: 13,
  },
  infoValue: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 13,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 2,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  updateBtn: {
    backgroundColor: colors.primarySoft,
  },
  deleteBtn: {
    backgroundColor: '#fee2e2',
  },
  updateText: {
    color: colors.primary,
    fontWeight: '700',
  },
  deleteText: {
    color: colors.danger,
    fontWeight: '700',
  },
});
