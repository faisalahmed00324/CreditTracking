import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { creditEntryService } from '../../services/creditEntryService';
import { UserDto } from '../../types';
import { useColors, useSpacing, useTypography, useRadius } from '../../hooks/useTheme';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Card from '../../components/Card';

export default function CreateCreditEntryScreen({ navigation }: any) {
  const { user } = useAuth();
  const colors = useColors();
  const spacing = useSpacing();
  const typography = useTypography();
  const radius = useRadius();

  const [customerSearch, setCustomerSearch] = useState('');
  const [searchResults, setSearchResults] = useState<UserDto[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<UserDto | null>(null);
  const [searching, setSearching] = useState(false);

  const [item, setItem] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const searchCustomers = async () => {
    if (!customerSearch.trim()) return;
    setSearching(true);
    try {
      const results = await authService.searchCustomers(customerSearch.trim());
      setSearchResults(results);
    } catch (err: any) {
      Alert.alert('Search Error', err.message);
    } finally {
      setSearching(false);
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!selectedCustomer) e.customer = 'Please select a customer';
    if (!item.trim()) e.item = 'Item description is required';
    const amt = parseFloat(amount);
    if (!amount || isNaN(amt) || amt <= 0) e.amount = 'Enter a valid amount greater than 0';
    if (!date.trim()) e.date = 'Date is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = async () => {
    if (!validate() || !user || !selectedCustomer) return;
    setLoading(true);
    try {
      await creditEntryService.create({
        shopId: user.id,
        customerId: selectedCustomer.id,
        item: item.trim(),
        amount: parseFloat(amount),
        date: new Date(date).toISOString(),
      });
      Alert.alert('Success', 'Credit entry created successfully!', [
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
            New Credit Entry
          </Text>
        </View>

        {/* Customer Search */}
        <Card title="Select Customer">
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <View style={{ flex: 1 }}>
              <Input
                placeholder="Search by name or username"
                value={customerSearch}
                onChangeText={setCustomerSearch}
                leftIcon="search-outline"
                onSubmitEditing={searchCustomers}
              />
            </View>
            <Button
              title="Search"
              onPress={searchCustomers}
              loading={searching}
              size="sm"
              style={{ alignSelf: 'flex-start', marginTop: 0 }}
            />
          </View>

          {errors.customer ? (
            <Text style={{ color: colors.danger, fontSize: typography.xs }}>{errors.customer}</Text>
          ) : null}

          {searchResults.length > 0 && !selectedCustomer && (
            <View style={{ marginTop: spacing.sm }}>
              {searchResults.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => {
                    setSelectedCustomer(c);
                    setSearchResults([]);
                    setErrors((e) => ({ ...e, customer: '' }));
                  }}
                  style={{
                    padding: spacing.sm,
                    borderRadius: radius.md,
                    backgroundColor: colors.surfaceVariant,
                    marginBottom: spacing.xs,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.sm,
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: colors.primaryLight + '30',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ fontSize: typography.base, fontWeight: '700', color: colors.primary }}>
                      {c.name[0]?.toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text style={{ fontSize: typography.base, fontWeight: '600', color: colors.text }}>{c.name}</Text>
                    <Text style={{ fontSize: typography.xs, color: colors.textSecondary }}>@{c.userName}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {selectedCustomer && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.successBackground,
                padding: spacing.sm,
                borderRadius: radius.md,
                gap: spacing.sm,
              }}
            >
              <Ionicons name="checkmark-circle" size={22} color={colors.success} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: typography.base, fontWeight: '700', color: colors.text }}>
                  {selectedCustomer.name}
                </Text>
                <Text style={{ fontSize: typography.xs, color: colors.textSecondary }}>
                  @{selectedCustomer.userName}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedCustomer(null)}>
                <Ionicons name="close-circle-outline" size={22} color={colors.danger} />
              </TouchableOpacity>
            </View>
          )}
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
        </Card>

        <Button
          title="Create Credit Entry"
          onPress={handleCreate}
          loading={loading}
          fullWidth
          size="lg"
          style={{ marginTop: spacing.lg }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
