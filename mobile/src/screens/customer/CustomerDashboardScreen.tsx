import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../../context/AuthContext';
import { creditEntryService } from '../../services/creditEntryService';
import { CreditEntry } from '../../types';
import { useColors, useSpacing, useTypography, useRadius } from '../../hooks/useTheme';
import { useTheme } from '../../hooks/useTheme';
import Card from '../../components/Card';
import CreditEntryCard from '../../components/CreditEntryCard';
import Loading from '../../components/Loading';

export default function CustomerDashboardScreen({ navigation }: any) {
  const { user } = useAuth();
  const colors = useColors();
  const spacing = useSpacing();
  const typography = useTypography();
  const radius = useRadius();
  const { toggleTheme, theme } = useTheme();
  const insets = useSafeAreaInsets();

  const [recentEntries, setRecentEntries] = useState<CreditEntry[]>([]);
  const [stats, setStats] = useState({ total: 0, paid: 0, unpaid: 0, totalOwed: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const res = await creditEntryService.getByCustomerId(user.id, { page: 1, pageSize: 20 });
      const items = res.items ?? [];
      setRecentEntries(items.slice(0, 5));
      const paid = items.filter((e) => e.isPaid).length;
      const totalOwed = items.filter((e) => !e.isPaid).reduce((s, e) => s + e.amount, 0);
      setStats({ total: items.length, paid, unpaid: items.length - paid, totalOwed });
    } catch {
      // silent fail
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Loading message="Loading dashboard..." />;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: spacing.xl }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Header */}
      <View
        style={{
          backgroundColor: colors.primaryDark,
          paddingTop: insets.top + spacing.md,
          paddingBottom: spacing.xl,
          paddingHorizontal: spacing.lg,
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontSize: typography.sm, color: 'rgba(255,255,255,0.75)', fontWeight: '500' }}>
              {greeting()},
            </Text>
            <Text style={{ fontSize: typography.xxl, fontWeight: '800', color: '#fff', marginTop: 2 }}>
              {user?.name ?? 'Customer'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={toggleTheme}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              width: 44,
              height: 44,
              borderRadius: 22,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name={theme.isDark ? 'sunny' : 'moon'} size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Stat pills */}
        <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg }}>
          {[
            { label: 'Total', value: stats.total },
            { label: 'Paid', value: stats.paid },
            { label: 'Unpaid', value: stats.unpaid },
          ].map((s) => (
            <View
              key={s.label}
              style={{
                flex: 1,
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: 12,
                padding: 12,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 22, fontWeight: '800', color: '#fff' }}>{s.value}</Text>
              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ padding: spacing.md, gap: spacing.md }}>
        {/* Owed Card */}
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                backgroundColor: colors.dangerBackground,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="alert-circle-outline" size={24} color={colors.danger} />
            </View>
            <View>
              <Text style={{ fontSize: typography.sm, color: colors.textSecondary }}>Total Outstanding</Text>
              <Text style={{ fontSize: typography.xxl, fontWeight: '800', color: colors.danger }}>
                RM {stats.totalOwed.toFixed(2)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Recent Entries */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: typography.lg, fontWeight: '700', color: colors.text }}>
            Recent Entries
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('MyCreditEntries')}>
            <Text style={{ fontSize: typography.sm, color: colors.primary, fontWeight: '600' }}>
              View All
            </Text>
          </TouchableOpacity>
        </View>

        {recentEntries.length === 0 ? (
          <Card>
            <Text style={{ color: colors.textSecondary, textAlign: 'center', padding: spacing.md }}>
              No credit entries yet.
            </Text>
          </Card>
        ) : (
          recentEntries.map((entry) => (
            <CreditEntryCard
              key={entry.id}
              entry={entry}
              showShop
              onPress={() =>
                navigation.navigate('MyCreditEntries', {
                  screen: 'CustomerEntryDetail',
                  params: { id: entry.id },
                })
              }
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}
