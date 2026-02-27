import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../../context/AuthContext';
import { creditEntryService } from '../../services/creditEntryService';
import { CreditEntry } from '../../types';
import { useColors, useSpacing, useTypography } from '../../hooks/useTheme';
import CreditEntryCard from '../../components/CreditEntryCard';
import EmptyState from '../../components/EmptyState';
import Loading from '../../components/Loading';

export default function MyCreditEntriesScreen({ navigation }: any) {
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
      const res = await creditEntryService.getByCustomerId(user.id, { page: currentPage, pageSize: PAGE_SIZE });
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

  if (loading) return <Loading message="Loading entries..." />;

  // Group by paid status
  const unpaid = entries.filter((e) => !e.isPaid);
  const paid = entries.filter((e) => e.isPaid);
  const grouped: CreditEntry[] = [...unpaid, ...paid];

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
        <Text style={{ fontSize: typography.xl, fontWeight: '700', color: colors.text }}>
          My Credit Entries
        </Text>
        <Text style={{ fontSize: typography.sm, color: colors.textSecondary, marginTop: 2 }}>
          {unpaid.length} unpaid · {paid.length} paid
        </Text>
      </View>

      <FlatList
        data={grouped}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: spacing.md,
          paddingBottom: spacing.xxl,
          flexGrow: 1,
        }}
        renderItem={({ item }) => (
          <CreditEntryCard
            entry={item}
            showShop
            onPress={() => navigation.navigate('CustomerEntryDetail', { id: item.id })}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="receipt-outline"
            title="No Credit Entries"
            description="You don't have any credit entries yet."
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(true); }}
            tintColor={colors.primary}
          />
        }
        onEndReached={() => {
          if (!hasMore || loadingMore) return;
          setLoadingMore(true);
          load();
        }}
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
