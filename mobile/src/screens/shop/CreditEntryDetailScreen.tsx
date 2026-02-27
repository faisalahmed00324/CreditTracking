import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
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

export default function CreditEntryDetailScreen({ navigation, route }: any) {
  const { id } = route.params;
  const colors = useColors();
  const spacing = useSpacing();
  const typography = useTypography();
  const radius = useRadius();

  const [entry, setEntry] = useState<CreditEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    creditEntryService
      .getById(id)
      .then(setEntry)
      .catch(() => Alert.alert('Error', 'Could not load entry'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = () => {
    Alert.alert('Delete Entry', 'Are you sure you want to delete this entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await creditEntryService.delete(id);
            navigation.goBack();
          } catch (err: any) {
            Alert.alert('Error', err.message);
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

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
        <TouchableOpacity
          onPress={() => navigation.navigate('EditCreditEntry', { entry })}
          style={{ marginRight: spacing.sm, padding: 8 }}
        >
          <Ionicons name="create-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
        {deleting ? (
          <ActivityIndicator color={colors.danger} />
        ) : (
          <TouchableOpacity onPress={handleDelete} style={{ padding: 8 }}>
            <Ionicons name="trash-outline" size={22} color={colors.danger} />
          </TouchableOpacity>
        )}
      </View>

      <View style={{ padding: spacing.md, gap: spacing.md }}>
        {/* Amount badge */}
        <View
          style={{
            backgroundColor: colors.primary,
            borderRadius: radius.xl,
            padding: spacing.lg,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: typography.sm, color: 'rgba(255,255,255,0.75)', marginBottom: 4 }}>
            Credit Amount
          </Text>
          <Text style={{ fontSize: 42, fontWeight: '900', color: '#fff' }}>
            RM {entry.amount.toFixed(2)}
          </Text>
          <View
            style={{
              backgroundColor: entry.isPaid ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)',
              paddingHorizontal: spacing.md,
              paddingVertical: 4,
              borderRadius: radius.full,
              marginTop: spacing.sm,
            }}
          >
            <Text
              style={{
                color: entry.isPaid ? '#6EE7B7' : '#FCD34D',
                fontWeight: '700',
                fontSize: typography.sm,
              }}
            >
              {entry.isPaid ? '✓ Paid' : '⏳ Unpaid'}
            </Text>
          </View>
        </View>

        {/* Details card */}
        <Card title="Transaction Details">
          <DetailRow label="Item" value={entry.item} icon="bag-outline" colors={colors} typography={typography} spacing={spacing} />
          <DetailRow label="Date" value={formatDate(entry.date)} icon="calendar-outline" colors={colors} typography={typography} spacing={spacing} />
          {entry.isPaid && (
            <DetailRow label="Payment Date" value={formatDate(entry.paymentDate)} icon="checkmark-circle-outline" colors={colors} typography={typography} spacing={spacing} />
          )}
        </Card>

        <Card title="Parties">
          <DetailRow label="Customer" value={entry.customerName} icon="person-outline" colors={colors} typography={typography} spacing={spacing} />
          <DetailRow label="Shop" value={entry.shopName} icon="storefront-outline" colors={colors} typography={typography} spacing={spacing} />
        </Card>
      </View>
    </ScrollView>
  );
}

function DetailRow({ label, value, icon, colors, typography, spacing }: any) {
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
