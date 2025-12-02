import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {CreditEntry} from '../types';

interface CreditEntryCardProps {
  entry: CreditEntry;
  onPress?: () => void;
  showShop?: boolean;
  showCustomer?: boolean;
}

export const CreditEntryCard: React.FC<CreditEntryCardProps> = ({
  entry,
  onPress,
  showShop = true,
  showCustomer = true,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}>
      <View style={styles.header}>
        <Text style={styles.item} numberOfLines={1}>
          {entry.item}
        </Text>
        <View
          style={[
            styles.statusBadge,
            entry.isPaid ? styles.paidBadge : styles.unpaidBadge,
          ]}>
          <Text
            style={[
              styles.statusText,
              entry.isPaid ? styles.paidText : styles.unpaidText,
            ]}>
            {entry.isPaid ? 'Paid' : 'Unpaid'}
          </Text>
        </View>
      </View>

      <Text style={styles.amount}>{formatCurrency(entry.amount)}</Text>

      <View style={styles.details}>
        {showShop && (
          <Text style={styles.detailText}>Shop: {entry.shopName}</Text>
        )}
        {showCustomer && (
          <Text style={styles.detailText}>Customer: {entry.customerName}</Text>
        )}
        <Text style={styles.detailText}>Date: {formatDate(entry.date)}</Text>
        {entry.isPaid && entry.paymentDate && (
          <Text style={styles.detailText}>
            Paid on: {formatDate(entry.paymentDate)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  item: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paidBadge: {
    backgroundColor: '#E8F5E9',
  },
  unpaidBadge: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  paidText: {
    color: '#4CAF50',
  },
  unpaidText: {
    color: '#F44336',
  },
  amount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 12,
  },
  details: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
});
