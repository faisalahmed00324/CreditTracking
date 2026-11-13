import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import StatCard from '../components/StatCard';
import { useAuth } from '../context/AuthContext';
import { getCreditEntriesByCustomerApi, getCreditEntriesByShopApi } from '../api/creditEntryApi';
import { colors } from '../constants/theme';
import { formatCurrency } from '../utils/format';

export default function DashboardScreen({ navigation }) {
  const { user, isShop, isCustomer } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, paid: 0, unpaid: 0, totalAmount: 0 });

  useEffect(() => {
    const loadStats = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const entries = isShop
          ? await getCreditEntriesByShopApi(user.id, 1, 100)
          : await getCreditEntriesByCustomerApi(user.id, 1, 100);
        const paid = entries.filter((entry) => entry.isPaid);
        const unpaid = entries.filter((entry) => !entry.isPaid);
        const totalAmount = entries.reduce((sum, entry) => sum + (entry.amount || 0), 0);
        setStats({ total: entries.length, paid: paid.length, unpaid: unpaid.length, totalAmount });
      } catch {
        setStats({ total: 0, paid: 0, unpaid: 0, totalAmount: 0 });
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [isShop, user?.id]);

  const roleLabel = useMemo(() => {
    if (isShop) return 'Shop';
    if (isCustomer) return 'Customer';
    return 'User';
  }, [isCustomer, isShop]);

  if (loading) {
    return (
      <ScreenContainer>
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll>
      <View style={styles.headerCard}>
        <Text style={styles.welcome}>Welcome, {user?.name || user?.userName}!</Text>
        <Text style={styles.role}>{roleLabel}</Text>
        <Text style={styles.email}>{user?.email || ''}</Text>
      </View>

      <View style={styles.statGrid}>
        <StatCard label="Total Entries" value={String(stats.total)} />
        <StatCard label="Unpaid" value={String(stats.unpaid)} accent={colors.danger} />
        <StatCard label="Paid" value={String(stats.paid)} accent={colors.success} />
        <StatCard label="Total Amount" value={formatCurrency(stats.totalAmount)} />
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <Pressable style={styles.actionCard} onPress={() => navigation.navigate('CreditEntries')}>
        <Text style={styles.actionTitle}>View Credit Entries</Text>
        <Text style={styles.actionDescription}>Browse all credit entries</Text>
      </Pressable>

      {isShop ? (
        <Pressable style={styles.actionCard} onPress={() => navigation.navigate('CreateEntry')}>
          <Text style={styles.actionTitle}>Create New Entry</Text>
          <Text style={styles.actionDescription}>Add a credit entry for a customer</Text>
        </Pressable>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    gap: 4,
  },
  welcome: {
    fontSize: 21,
    fontWeight: '800',
    color: colors.text,
  },
  role: {
    fontWeight: '700',
    color: colors.primary,
  },
  email: {
    color: colors.textMuted,
    fontSize: 13,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  sectionTitle: {
    marginTop: 4,
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  actionCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    gap: 4,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  actionDescription: {
    color: colors.textMuted,
  },
});
