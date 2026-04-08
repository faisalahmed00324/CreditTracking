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

export default function ShopDashboardScreen({ navigation }: any) {
  const { user } = useAuth();
  const colors = useColors();
  const spacing = useSpacing();
  const typography = useTypography();
  const radius = useRadius();
  const { toggleTheme, theme } = useTheme();
  const insets = useSafeAreaInsets();

  const [recentEntries, setRecentEntries] = useState<CreditEntry[]>([]);
  const [stats, setStats] = useState({ total: 0, paid: 0, unpaid: 0, totalAmount: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const res = await creditEntryService.getByShopId(user.id, { page: 1, pageSize: 20 });
      const items = res.items ?? [];
      setRecentEntries(items.slice(0, 5));
      const paid = items.filter((e) => e.isPaid).length;
      const totalAmt = items.reduce((s, e) => s + e.amount, 0);
      setStats({ total: items.length, paid, unpaid: items.length - paid, totalAmount: totalAmt });
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
      {/* Header */}
      <View
        style={{
          backgroundColor: colors.primary,
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
              {user?.name ?? 'Shop Owner'}
            </Text>
            <Text style={{ fontSize: typography.sm, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
              {user?.userName}
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

        {/* Stats */}
        <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg }}>
          <StatPill label="Total" value={stats.total} colors={colors} />
          <StatPill label="Paid" value={stats.paid} colors={colors} />
          <StatPill label="Unpaid" value={stats.unpaid} colors={colors} />
        </View>
      </View>

      <View style={{ padding: spacing.md, gap: spacing.md }}>
        {/* Revenue Card */}
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                backgroundColor: colors.successBackground,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="cash-outline" size={24} color={colors.success} />
            </View>
            <View>
              <Text style={{ fontSize: typography.sm, color: colors.textSecondary }}>Total Credit Amount</Text>
              <Text style={{ fontSize: typography.xxl, fontWeight: '800', color: colors.text }}>
                RM {stats.totalAmount.toFixed(2)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Quick Actions */}
        <Text style={{ fontSize: typography.lg, fontWeight: '700', color: colors.text, marginTop: spacing.xs }}>
          Quick Actions
        </Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <QuickAction
            icon="add-circle-outline"
            label="New Entry"
            color={colors.primary}
            bg={colors.infoBackground}
            onPress={() => navigation.navigate('CreditEntries', { screen: 'CreateCreditEntry' })}
            colors={colors}
            typography={typography}
            radius={radius}
            spacing={spacing}
          />
          <QuickAction
            icon="search-outline"
            label="Search"
            color={colors.warning}
            bg={colors.warningBackground}
            onPress={() => navigation.navigate('CustomerSearch')}
            colors={colors}
            typography={typography}
            radius={radius}
            spacing={spacing}
          />
          <QuickAction
            icon="list-outline"
            label="All Entries"
            color={colors.success}
            bg={colors.successBackground}
            onPress={() => navigation.navigate('CreditEntries')}
            colors={colors}
            typography={typography}
            radius={radius}
            spacing={spacing}
          />
        </View>

        {/* Recent Entries */}
        <Text style={{ fontSize: typography.lg, fontWeight: '700', color: colors.text, marginTop: spacing.xs }}>
          Recent Entries
        </Text>
        {recentEntries.length === 0 ? (
          <Card>
            <Text style={{ color: colors.textSecondary, textAlign: 'center', padding: spacing.lg }}>
              No credit entries yet. Create your first one!
            </Text>
          </Card>
        ) : (
          recentEntries.map((entry) => (
            <CreditEntryCard
              key={entry.id}
              entry={entry}
              showCustomer
              onPress={() =>
                navigation.navigate('CreditEntries', {
                  screen: 'CreditEntryDetail',
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

function StatPill({ label, value, colors }: any) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
      }}
    >
      <Text style={{ fontSize: 22, fontWeight: '800', color: '#fff' }}>{value}</Text>
      <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>{label}</Text>
    </View>
  );
}

function QuickAction({ icon, label, color, bg, onPress, colors, typography, radius, spacing }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        padding: spacing.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        gap: spacing.xs,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 2,
      }}
      activeOpacity={0.75}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          backgroundColor: bg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={{ fontSize: typography.xs, fontWeight: '600', color: colors.text, textAlign: 'center' }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
