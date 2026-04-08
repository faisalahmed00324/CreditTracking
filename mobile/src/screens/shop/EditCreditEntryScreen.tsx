import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { creditEntryService } from '../../services/creditEntryService';
import { CreditEntry } from '../../types';
import { useColors, useSpacing, useTypography, useRadius } from '../../hooks/useTheme';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Card from '../../components/Card';

export default function EditCreditEntryScreen({ navigation, route }: any) {
  const entryParam: CreditEntry = route.params?.entry;
  const colors = useColors();
  const spacing = useSpacing();
  const typography = useTypography();
  const radius = useRadius();

  const [item, setItem] = useState(entryParam.item);
  const [amount, setAmount] = useState(String(entryParam.amount));
  const [date, setDate] = useState(entryParam.date.split('T')[0]);
  const [isPaid, setIsPaid] = useState(entryParam.isPaid);
  const [paymentDate, setPaymentDate] = useState(
    entryParam.paymentDate ? entryParam.paymentDate.split('T')[0] : ''
  );
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!item.trim()) e.item = 'Item description is required';
    const amt = parseFloat(amount);
    if (!amount || isNaN(amt) || amt <= 0) e.amount = 'Enter a valid amount greater than 0';
    if (!date.trim()) e.date = 'Date is required';
    if (isPaid && !paymentDate.trim()) e.paymentDate = 'Payment date is required when marked as paid';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleUpdate = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await creditEntryService.update({
        id: entryParam.id,
        item: item.trim(),
        amount: parseFloat(amount),
        date: new Date(date).toISOString(),
        isPaid,
        paymentDate: isPaid && paymentDate ? new Date(paymentDate).toISOString() : null,
      });
      Alert.alert('Success', 'Credit entry updated!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxl }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Nav Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ flex: 1, fontSize: typography.xl, fontWeight: '700', color: colors.text, marginLeft: spacing.sm }}>
            Edit Credit Entry
          </Text>
        </View>

        {/* Customer Info (read-only) */}
        <Card title="Customer">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Ionicons name="person-circle-outline" size={28} color={colors.primary} />
            <View>
              <Text style={{ fontSize: typography.base, fontWeight: '700', color: colors.text }}>
                {entryParam.customerName}
              </Text>
              <Text style={{ fontSize: typography.xs, color: colors.textSecondary }}>Customer (read-only)</Text>
            </View>
          </View>
        </Card>

        {/* Entry Details */}
        <Card title="Entry Details" style={{ marginTop: spacing.md }}>
          <Input
            label="Item Description *"
            placeholder="What was purchased/credited?"
            value={item}
            onChangeText={setItem}
            leftIcon="bag-outline"
            error={errors.item}
          />

          <Input
            label="Amount (RM) *"
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            leftIcon="cash-outline"
            keyboardType="decimal-pad"
            error={errors.amount}
          />

          <Input
            label="Date *"
            placeholder="YYYY-MM-DD"
            value={date}
            onChangeText={setDate}
            leftIcon="calendar-outline"
            error={errors.date}
          />

          {/* Payment toggle */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: spacing.sm,
              marginBottom: spacing.xs,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color={isPaid ? colors.success : colors.textSecondary}
              />
              <Text style={{ fontSize: typography.base, color: colors.text, fontWeight: '600' }}>
                Mark as Paid
              </Text>
            </View>
            <Switch
              value={isPaid}
              onValueChange={setIsPaid}
              trackColor={{ false: colors.border, true: colors.success }}
              thumbColor={isPaid ? colors.textInverse : colors.surface}
            />
          </View>

          {isPaid && (
            <Input
              label="Payment Date *"
              placeholder="YYYY-MM-DD"
              value={paymentDate}
              onChangeText={setPaymentDate}
              leftIcon="calendar-clear-outline"
              error={errors.paymentDate}
            />
          )}
        </Card>

        <Button
          title="Update Entry"
          onPress={handleUpdate}
          loading={loading}
          fullWidth
          size="lg"
          style={{ marginTop: spacing.lg }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
