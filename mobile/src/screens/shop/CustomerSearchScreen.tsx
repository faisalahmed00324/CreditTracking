import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { authService } from '../../services/authService';
import { UserDto } from '../../types';
import { useColors, useSpacing, useTypography, useRadius } from '../../hooks/useTheme';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Card from '../../components/Card';
import EmptyState from '../../components/EmptyState';

export default function CustomerSearchScreen({ navigation }: any) {
  const colors = useColors();
  const spacing = useSpacing();
  const typography = useTypography();
  const radius = useRadius();
  const insets = useSafeAreaInsets();

  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchText.trim()) return;
    setLoading(true);
    setSearched(false);
    try {
      const res = await authService.searchCustomers(searchText.trim());
      setResults(res);
    } catch (err: any) {
      Alert.alert('Search Error', err.message);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: colors.surface,
          paddingTop: insets.top + spacing.sm,
          paddingBottom: spacing.md,
          paddingHorizontal: spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <Text style={{ fontSize: typography.xl, fontWeight: '700', color: colors.text, marginBottom: spacing.sm }}>
          Customer Search
        </Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <View style={{ flex: 1 }}>
            <Input
              placeholder="Search by name or username..."
              value={searchText}
              onChangeText={setSearchText}
              leftIcon="search-outline"
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
          </View>
          <Button
            title="Search"
            onPress={handleSearch}
            loading={loading}
            size="sm"
            style={{ alignSelf: 'flex-start' }}
          />
        </View>
      </View>

      {/* Results */}
      {!searched ? (
        <EmptyState
          icon="people-outline"
          title="Search Customers"
          description="Enter a name or username above to find customers."
        />
      ) : results.length === 0 ? (
        <EmptyState
          icon="person-remove-outline"
          title="No Results"
          description={`No customers found for "${searchText}"`}
        />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.md }}
          renderItem={({ item }) => (
            <CustomerCard
              customer={item}
              onPress={() => navigation.navigate('CreditEntries', {
                screen: 'CreateCreditEntry',
              })}
              colors={colors}
              typography={typography}
              spacing={spacing}
              radius={radius}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

function CustomerCard({ customer, onPress, colors, typography, spacing, radius }: any) {
  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: radius.lg,
        padding: spacing.md,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      {/* Avatar */}
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: colors.primaryLight + '25',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: typography.xl, fontWeight: '800', color: colors.primary }}>
          {customer.name[0]?.toUpperCase() ?? '?'}
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: typography.base, fontWeight: '700', color: colors.text }}>
          {customer.name}
        </Text>
        <Text style={{ fontSize: typography.sm, color: colors.textSecondary }}>@{customer.userName}</Text>
        {customer.address ? (
          <Text style={{ fontSize: typography.xs, color: colors.textSecondary, marginTop: 2 }}>
            <Ionicons name="location-outline" size={11} /> {customer.address}
          </Text>
        ) : null}
      </View>

      <View style={{ alignItems: 'flex-end', gap: 4 }}>
        <View
          style={{
            backgroundColor: customer.isVerified ? colors.successBackground : colors.warningBackground,
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: radius.full,
          }}
        >
          <Text
            style={{
              fontSize: typography.xs,
              fontWeight: '600',
              color: customer.isVerified ? colors.success : colors.warning,
            }}
          >
            {customer.isVerified ? 'Verified' : 'Unverified'}
          </Text>
        </View>
        <TouchableOpacity onPress={onPress}>
          <Ionicons name="add-circle-outline" size={26} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
