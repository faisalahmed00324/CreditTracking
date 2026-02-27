import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../../context/AuthContext';
import { creditEntryService } from '../../services/creditEntryService';
import { CreditEntry } from '../../types';
import { useColors, useSpacing, useTypography } from '../../hooks/useTheme';
import CreditEntryCard from '../../components/CreditEntryCard';
import EmptyState from '../../components/EmptyState';
import Loading from '../../components/Loading';

export default function CreditEntryListScreen({ navigation }: any) {
  const { user } = useAuth();
  const colors = useColors();
  const spacing = useSpacing();
  const typography = useTypography();
  const insets = useSafeAreaInsets();

  const [entries, setEntries] = useState<CreditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const PAGE_SIZE = 15;

  const load = useCallback(async (reset = false) => {
    if (!user) return;
    const currentPage = reset ? 1 : page;
    try {
      const res = await creditEntryService.getByShopId(user.id, { page: currentPage, pageSize: PAGE_SIZE });
      const newItems = res.items ?? [];
      if (reset) {
        setEntries(newItems);
        setPage(2);
      } else {
        setEntries((prev) => [...prev, ...newItems]);
        setPage((p) => p + 1);
      }
      setHasMore(newItems.length === PAGE_SIZE);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [user, page]);

  useEffect(() => { load(true); }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load(true);
  };

  const loadMore = () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    load();
  };

  if (loading) return <Loading message="Loading credit entries..." />;

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
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ fontSize: typography.xl, fontWeight: '700', color: colors.text }}>
          Credit Entries
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('CreateCreditEntry')}
          style={{
            backgroundColor: colors.primary,
            width: 38,
            height: 38,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: spacing.md,
          paddingBottom: spacing.xxl,
          flexGrow: 1,
        }}
        renderItem={({ item }) => (
          <CreditEntryCard
            entry={item}
            showCustomer
            onPress={() => navigation.navigate('CreditEntryDetail', { id: item.id })}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="receipt-outline"
            title="No Credit Entries"
            description="Start adding credit entries for your customers."
            actionTitle="Add Entry"
            onAction={() => navigation.navigate('CreateCreditEntry')}
          />
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          loadingMore ? (
            <Text style={{ textAlign: 'center', color: colors.textSecondary, padding: spacing.md }}>
              Loading more...
            </Text>
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
