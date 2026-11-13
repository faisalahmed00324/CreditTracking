import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import CreditEntryCard from '../components/CreditEntryCard';
import PrimaryButton from '../components/PrimaryButton';
import EmptyState from '../components/EmptyState';
import UpdatePaymentModal from '../components/UpdatePaymentModal';
import { useAuth } from '../context/AuthContext';
import {
  deleteCreditEntryApi,
  getCreditEntriesByCustomerApi,
  getCreditEntriesByShopApi,
  updateCreditEntryPaymentApi,
} from '../api/creditEntryApi';
import { colors } from '../constants/theme';

const PAGE_SIZE = 10;

export default function CreditEntriesScreen({ navigation }) {
  const { user, isShop } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [updating, setUpdating] = useState(false);

  const loadEntries = useCallback(async (targetPage = page) => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const items = isShop
        ? await getCreditEntriesByShopApi(user.id, targetPage, PAGE_SIZE)
        : await getCreditEntriesByCustomerApi(user.id, targetPage, PAGE_SIZE);
      setEntries(items);
      setHasMore(items.length === PAGE_SIZE);
    } catch {
      setEntries([]);
      setHasMore(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isShop, page, user?.id]);

  useEffect(() => {
    loadEntries(page);
  }, [loadEntries, page]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadEntries(page);
  };

  const handleDelete = async (entry) => {
    await deleteCreditEntryApi(entry.id);
    loadEntries(page);
  };

  const handleUpdatePayment = async (paymentDate) => {
    if (!selectedEntry) return;
    setUpdating(true);
    try {
      await updateCreditEntryPaymentApi({
        id: selectedEntry.id,
        isPaid: true,
        paymentDate: new Date(paymentDate).toISOString(),
      });
      setSelectedEntry(null);
      loadEntries(page);
    } finally {
      setUpdating(false);
    }
  };

  if (loading && !entries.length) {
    return (
      <ScreenContainer>
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      {!entries.length ? (
        <EmptyState
          title="No credit entries"
          description={isShop ? 'Create your first credit entry to get started.' : 'No credit entries found for your account.'}
          actionLabel={isShop ? 'Create Entry' : undefined}
          onAction={isShop ? () => navigation.navigate('CreateEntry') : undefined}
        />
      ) : (
        <>
          <FlatList
            data={entries}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <CreditEntryCard
                entry={item}
                isShop={isShop}
                onDelete={handleDelete}
                onUpdate={setSelectedEntry}
              />
            )}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          />

          <View style={styles.paginationRow}>
            <View style={styles.pageBtn}>
              <PrimaryButton
                label="Previous"
                onPress={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page <= 1}
              />
            </View>
            <Text style={styles.pageText}>Page {page}</Text>
            <View style={styles.pageBtn}>
              <PrimaryButton label="Next" onPress={() => setPage((prev) => prev + 1)} disabled={!hasMore} />
            </View>
          </View>
        </>
      )}

      <UpdatePaymentModal
        visible={!!selectedEntry}
        onClose={() => setSelectedEntry(null)}
        onConfirm={handleUpdatePayment}
        loading={updating}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    gap: 10,
    paddingBottom: 12,
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  pageBtn: {
    flex: 1,
  },
  pageText: {
    color: colors.textMuted,
    fontWeight: '600',
    minWidth: 64,
    textAlign: 'center',
  },
});
