import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import FormField from '../components/FormField';
import PrimaryButton from '../components/PrimaryButton';
import CustomerSearchModal from '../components/CustomerSearchModal';
import { useAuth } from '../context/AuthContext';
import { createCreditEntryApi } from '../api/creditEntryApi';
import { colors } from '../constants/theme';
import { toInputDate } from '../utils/format';

export default function CreateCreditEntryScreen({ navigation }) {
  const { user } = useAuth();
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [item, setItem] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(toInputDate());
  const [loading, setLoading] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const next = {};
    if (!selectedCustomer) next.customer = 'Please select a customer';
    if (!item.trim()) next.item = 'Item is required';
    if (!amount || Number.isNaN(Number(amount)) || Number(amount) <= 0) next.amount = 'Valid amount is required';
    if (!date) next.date = 'Date is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await createCreditEntryApi({
        shopId: user?.id,
        customerId: selectedCustomer.id,
        item: item.trim(),
        amount: Number(amount),
        date: new Date(date).toISOString(),
        isPaid: false,
        paymentDate: null,
      });
      Alert.alert('Credit entry created', 'The credit entry has been created successfully.');
      navigation.navigate('CreditEntries');
    } catch (error) {
      Alert.alert('Failed to create entry', error?.response?.data?.message || error?.response?.data || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <Text style={styles.heading}>Create Credit Entry</Text>

      <View style={styles.formCard}>
        <Text style={styles.label}>Customer</Text>
        <Pressable style={styles.customerSelect} onPress={() => setSearchVisible(true)}>
          <Text style={selectedCustomer ? styles.customerValue : styles.customerPlaceholder}>
            {selectedCustomer ? selectedCustomer.name || selectedCustomer.userName : 'Tap to search customer'}
          </Text>
        </Pressable>
        {!!errors.customer && <Text style={styles.error}>{errors.customer}</Text>}

        <FormField label="Item" value={item} onChangeText={setItem} placeholder="e.g. Groceries" error={errors.item} />
        <FormField label="Amount (MYR)" value={amount} onChangeText={setAmount} placeholder="0.00" keyboardType="decimal-pad" error={errors.amount} />
        <FormField label="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} placeholder="2026-01-31" error={errors.date} />

        <PrimaryButton label="Create Credit Entry" onPress={handleSubmit} loading={loading} />
      </View>

      <CustomerSearchModal
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
        onSelect={(customer) => {
          setSelectedCustomer(customer);
          setErrors((prev) => ({ ...prev, customer: undefined }));
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  customerSelect: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  customerValue: {
    color: colors.text,
  },
  customerPlaceholder: {
    color: '#94a3b8',
  },
  error: {
    color: colors.danger,
    fontSize: 12,
  },
});
