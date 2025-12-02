import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {Button, LoadingScreen} from '../components';
import {useAuth} from '../context';
import {creditEntryApi, ApiError} from '../api';
import {CreditEntry, Role} from '../types';

type MainStackParamList = {
  Home: undefined;
  CreditEntryDetail: {entryId: string};
  CreateCreditEntry: undefined;
  Profile: undefined;
};

type CreditEntryDetailScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'CreditEntryDetail'
>;

type CreditEntryDetailScreenRouteProp = RouteProp<
  MainStackParamList,
  'CreditEntryDetail'
>;

interface CreditEntryDetailScreenProps {
  navigation: CreditEntryDetailScreenNavigationProp;
  route: CreditEntryDetailScreenRouteProp;
}

export const CreditEntryDetailScreen: React.FC<
  CreditEntryDetailScreenProps
> = ({navigation, route}) => {
  const {user} = useAuth();
  const {entryId} = route.params;
  const [entry, setEntry] = useState<CreditEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const isShop = user?.role === Role.Shop;

  const fetchEntry = React.useCallback(async () => {
    try {
      const data = await creditEntryApi.getById(entryId);
      setEntry(data);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Failed to load credit entry';
      Alert.alert('Error', message, [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    } finally {
      setLoading(false);
    }
  }, [entryId, navigation]);

  useEffect(() => {
    fetchEntry();
  }, [fetchEntry]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const handleMarkAsPaid = () => {
    Alert.alert(
      'Mark as Paid',
      'Are you sure you want to mark this entry as paid?',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Confirm', onPress: confirmMarkAsPaid},
      ],
    );
  };

  const confirmMarkAsPaid = async () => {
    if (!entry) {
      return;
    }

    setUpdating(true);
    try {
      await creditEntryApi.update({
        id: entry.id,
        isPaid: true,
        paymentDate: new Date().toISOString(),
      });
      Alert.alert('Success', 'Credit entry marked as paid');
      fetchEntry(); // Refresh the data
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Failed to update entry';
      Alert.alert('Error', message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this credit entry? This action cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Delete', style: 'destructive', onPress: confirmDelete},
      ],
    );
  };

  const confirmDelete = async () => {
    if (!entry) {
      return;
    }

    setUpdating(true);
    try {
      await creditEntryApi.delete(entry.id);
      Alert.alert('Success', 'Credit entry deleted', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Failed to delete entry';
      Alert.alert('Error', message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Loading entry details..." />;
  }

  if (!entry) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Entry not found</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
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
            {entry.isPaid ? '✓ Paid' : '○ Unpaid'}
          </Text>
        </View>
        <Text style={styles.amount}>{formatCurrency(entry.amount)}</Text>
        <Text style={styles.item}>{entry.item}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Details</Text>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Shop</Text>
          <Text style={styles.detailValue}>{entry.shopName}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Customer</Text>
          <Text style={styles.detailValue}>{entry.customerName}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date</Text>
          <Text style={styles.detailValue}>{formatDate(entry.date)}</Text>
        </View>

        {entry.isPaid && entry.paymentDate && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Date</Text>
            <Text style={styles.detailValue}>
              {formatDate(entry.paymentDate)}
            </Text>
          </View>
        )}
      </View>

      {isShop && (
        <View style={styles.actions}>
          {!entry.isPaid && (
            <Button
              title="Mark as Paid"
              onPress={handleMarkAsPaid}
              loading={updating}
              disabled={updating}
              style={styles.actionButton}
            />
          )}

          <Button
            title="Delete Entry"
            onPress={handleDelete}
            variant="danger"
            disabled={updating}
            style={styles.actionButton}
          />
        </View>
      )}

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>← Back to List</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  paidBadge: {
    backgroundColor: '#E8F5E9',
  },
  unpaidBadge: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  paidText: {
    color: '#4CAF50',
  },
  unpaidText: {
    color: '#F44336',
  },
  amount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 8,
  },
  item: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  actions: {
    padding: 20,
    gap: 12,
  },
  actionButton: {
    marginBottom: 0,
  },
  backButton: {
    padding: 20,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
});
