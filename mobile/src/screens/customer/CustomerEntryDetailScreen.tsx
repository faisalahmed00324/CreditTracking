import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { creditEntryService } from '../../services/creditEntryService';
import { CreditEntry } from '../../types';
import { useColors, useSpacing, useTypography, useRadius } from '../../hooks/useTheme';
import Loading from '../../components/Loading';
import Card from '../../components/Card';

function formatDate(d: string | null | undefined) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-MY', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function CustomerEntryDetailScreen({ navigation, route }: any) {
  const { id } = route.params;
  const colors = useColors();
  const spacing = useSpacing();
  const typography = useTypography();
  const radius = useRadius();

  const [entry, setEntry] = useState<CreditEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    creditEntryService
      .getById(id)
      .then(setEntry)
      .catch(() => Alert.alert('Error', 'Could not load entry'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loading message="Loading entry..." />;
  if (!entry)
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <Text style={{ color: colors.textSecondary }}>Entry not found</Text>
      </View>
    );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: colors.surface,
          paddingBottom: spacing.md,
          paddingHorizontal: spacing.md,
          paddingTop: spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: spacing.sm, padding: 4 }}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ flex: 1, fontSize: typography.xl, fontWeight: '700', color: colors.text }}>
          Entry Details
        </Text>
      </View>

      <View style={{ padding: spacing.md, gap: spacing.md }}>
        {/* Amount Badge */}
        <View
          style={{
            backgroundColor: entry.isPaid ? colors.success : colors.warning,
            borderRadius: radius.xl,
            padding: spacing.lg,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: typography.sm, color: 'rgba(255,255,255,0.8)', marginBottom: 4 }}>
            Credit Amount
          </Text>
          <Text style={{ fontSize: 42, fontWeight: '900', color: '#fff' }}>
            RM {entry.amount.toFixed(2)}
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '700', marginTop: spacing.sm }}>
            {entry.isPaid ? '✓ Fully Paid' : '⏳ Payment Pending'}
          </Text>
        </View>

        <Card title="Transaction Details">
          <InfoRow label="Item" value={entry.item} icon="bag-outline" colors={colors} typography={typography} spacing={spacing} />
          <InfoRow label="Date" value={formatDate(entry.date)} icon="calendar-outline" colors={colors} typography={typography} spacing={spacing} />
          {entry.isPaid && (
            <InfoRow label="Payment Date" value={formatDate(entry.paymentDate)} icon="checkmark-circle-outline" colors={colors} typography={typography} spacing={spacing} />
          )}
        </Card>

        <Card title="Shop Info">
          <InfoRow label="Shop Name" value={entry.shopName} icon="storefront-outline" colors={colors} typography={typography} spacing={spacing} />
        </Card>
      </View>
    </ScrollView>
  );
}

function InfoRow({ label, value, icon, colors, typography, spacing }: any) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          backgroundColor: colors.surfaceVariant,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: spacing.sm,
        }}
      >
        <Ionicons name={icon} size={16} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: typography.xs, color: colors.textSecondary }}>{label}</Text>
        <Text style={{ fontSize: typography.base, fontWeight: '600', color: colors.text }}>{value}</Text>
      </View>
    </View>
  );
}
