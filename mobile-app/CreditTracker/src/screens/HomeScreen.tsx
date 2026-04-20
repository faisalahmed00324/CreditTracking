import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {CreditEntryCard, LoadingScreen, Button} from '../components';
import {useAuth} from '../context';
import {creditEntryApi, ApiError} from '../api';
import {CreditEntry, Role} from '../types';

type MainStackParamList = {
  Home: undefined;
  CreditEntryDetail: {entryId: string};
  CreateCreditEntry: undefined;
  Profile: undefined;
};

type HomeScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'Home'
>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({navigation}) => {
  const {user} = useAuth();
  const [entries, setEntries] = useState<CreditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const isShop = user?.role === Role.Shop;

  const fetchEntries = useCallback(
    async (pageNum: number = 1, refresh: boolean = false) => {
      if (!user?.id) {
        return;
      }

      try {
        const pagination = {pageIndex: pageNum, pageSize: 10};

        const result = isShop
          ? await creditEntryApi.getByShopId(user.id, pagination)
          : await creditEntryApi.getByCustomerId(user.id, pagination);

        if (refresh || pageNum === 1) {
          setEntries(result.data);
        } else {
          setEntries(prev => [...prev, ...result.data]);
        }

        setHasMore(result.data.length === pagination.pageSize);
        setPage(pageNum);
      } catch (error) {
        const message =
          error instanceof ApiError
            ? error.message
            : 'Failed to load credit entries';
        Alert.alert('Error', message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user?.id, isShop],
  );

  useFocusEffect(
    useCallback(() => {
      fetchEntries(1, true);
    }, [fetchEntries]),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchEntries(1, true);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchEntries(page + 1);
    }
  };

  const handleEntryPress = (entry: CreditEntry) => {
    navigation.navigate('CreditEntryDetail', {entryId: entry.id});
  };

  if (loading && entries.length === 0) {
    return <LoadingScreen message="Loading credit entries..." />;
  }

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>No Credit Entries</Text>
      <Text style={styles.emptyStateText}>
        {isShop
          ? 'You haven\'t created any credit entries yet.'
          : 'You don\'t have any credit entries yet.'}
      </Text>
      {isShop && (
        <Button
          title="Create First Entry"
          onPress={() => navigation.navigate('CreateCreditEntry')}
          style={styles.emptyStateButton}
        />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Credit Entries</Text>
        <Text style={styles.headerSubtitle}>
          Welcome back, {user?.name || 'User'}
        </Text>
      </View>

      <FlatList
        data={entries}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <CreditEntryCard
            entry={item}
            onPress={() => handleEntryPress(item)}
            showShop={!isShop}
            showCustomer={isShop}
          />
        )}
        contentContainerStyle={
          entries.length === 0 ? styles.emptyContainer : styles.listContent
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={renderEmptyState}
      />

      {isShop && entries.length > 0 && (
        <View style={styles.fabContainer}>
          <Button
            title="+ New Entry"
            onPress={() => navigation.navigate('CreateCreditEntry')}
            style={styles.fab}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E0E0E0',
    marginTop: 4,
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyStateButton: {
    paddingHorizontal: 32,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
  fab: {
    borderRadius: 28,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});
