import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../../context/AuthContext';
import { useColors, useSpacing, useTypography, useRadius } from '../../hooks/useTheme';
import { useTheme } from '../../hooks/useTheme';
import { UserRole } from '../../types';
import Card from '../../components/Card';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const colors = useColors();
  const spacing = useSpacing();
  const typography = useTypography();
  const radius = useRadius();
  const { themeMode, setThemeMode, theme } = useTheme();
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  if (!user) return null;

  const roleLabel = user.role === UserRole.Shop ? 'Shop Owner' : 'Customer';
  const roleIcon = user.role === UserRole.Shop ? 'storefront-outline' : 'person-outline';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: spacing.xxl }}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Hero */}
      <View
        style={{
          backgroundColor: colors.primary,
          paddingTop: insets.top + spacing.md,
          paddingBottom: spacing.xxl + spacing.lg,
          alignItems: 'center',
          paddingHorizontal: spacing.lg,
        }}
      >
        <View
          style={{
            width: 90,
            height: 90,
            borderRadius: 45,
            backgroundColor: 'rgba(255,255,255,0.25)',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: spacing.md,
            borderWidth: 3,
            borderColor: 'rgba(255,255,255,0.4)',
          }}
        >
          <Text style={{ fontSize: 38, fontWeight: '800', color: '#fff' }}>
            {user.name[0]?.toUpperCase() ?? '?'}
          </Text>
        </View>
        <Text style={{ fontSize: typography.xxl, fontWeight: '800', color: '#fff' }}>
          {user.name}
        </Text>
        <Text style={{ fontSize: typography.sm, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>
          @{user.userName}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,0.2)',
            paddingHorizontal: spacing.md,
            paddingVertical: 4,
            borderRadius: radius.full,
            marginTop: spacing.sm,
            gap: 6,
          }}
        >
          <Ionicons name={roleIcon} size={14} color="rgba(255,255,255,0.9)" />
          <Text style={{ fontSize: typography.sm, color: 'rgba(255,255,255,0.9)', fontWeight: '600' }}>
            {roleLabel}
          </Text>
        </View>
      </View>

      {/* Overlap card */}
      <View style={{ marginTop: -(spacing.xxl), paddingHorizontal: spacing.md }}>
        <Card>
          <InfoRow
            icon="person-outline"
            label="Full Name"
            value={user.name}
            colors={colors}
            typography={typography}
            spacing={spacing}
          />
          <InfoRow
            icon="at-outline"
            label="Username"
            value={`@${user.userName}`}
            colors={colors}
            typography={typography}
            spacing={spacing}
          />
          {user.email ? (
            <InfoRow
              icon="mail-outline"
              label="Email"
              value={user.email}
              colors={colors}
              typography={typography}
              spacing={spacing}
            />
          ) : null}
          <InfoRow
            icon="id-card-outline"
            label="IC / Passport"
            value={user.icNoOrPassport}
            colors={colors}
            typography={typography}
            spacing={spacing}
          />
          {user.address ? (
            <InfoRow
              icon="location-outline"
              label="Address"
              value={user.address}
              colors={colors}
              typography={typography}
              spacing={spacing}
              last
            />
          ) : null}
        </Card>

        {/* Status */}
        <Card style={{ marginTop: spacing.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <StatusBadge
              label="Account"
              value={user.isActive ? 'Active' : 'Inactive'}
              active={user.isActive}
              colors={colors}
              typography={typography}
            />
            <View style={{ width: 1, backgroundColor: colors.border }} />
            <StatusBadge
              label="Verified"
              value={user.isVerified ? 'Yes' : 'No'}
              active={user.isVerified}
              colors={colors}
              typography={typography}
            />
          </View>
        </Card>

        {/* Theme Settings */}
        <Card title="Appearance" style={{ marginTop: spacing.md }}>
          <Text style={{ fontSize: typography.sm, color: colors.textSecondary, marginBottom: spacing.sm }}>
            Choose your preferred theme
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {(['light', 'dark', 'system'] as const).map((mode) => (
              <TouchableOpacity
                key={mode}
                onPress={() => setThemeMode(mode)}
                style={{
                  flex: 1,
                  paddingVertical: spacing.sm,
                  borderRadius: radius.md,
                  alignItems: 'center',
                  backgroundColor:
                    themeMode === mode ? colors.primary : colors.surfaceVariant,
                  borderWidth: 1.5,
                  borderColor: themeMode === mode ? colors.primary : colors.border,
                  gap: 4,
                }}
              >
                <Ionicons
                  name={mode === 'light' ? 'sunny-outline' : mode === 'dark' ? 'moon-outline' : 'phone-portrait-outline'}
                  size={20}
                  color={themeMode === mode ? '#fff' : colors.textSecondary}
                />
                <Text
                  style={{
                    fontSize: typography.xs,
                    fontWeight: '600',
                    color: themeMode === mode ? '#fff' : colors.textSecondary,
                    textTransform: 'capitalize',
                  }}
                >
                  {mode}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Logout */}
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            marginTop: spacing.md,
            backgroundColor: colors.dangerBackground,
            borderRadius: radius.lg,
            padding: spacing.md,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.sm,
          }}
        >
          <Ionicons name="log-out-outline" size={22} color={colors.danger} />
          <Text style={{ fontSize: typography.base, fontWeight: '700', color: colors.danger }}>
            Logout
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function InfoRow({ icon, label, value, colors, typography, spacing, last = false }: any) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.border,
        gap: spacing.sm,
      }}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          backgroundColor: colors.surfaceVariant,
          alignItems: 'center',
          justifyContent: 'center',
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

function StatusBadge({ label, value, active, colors, typography }: any) {
  return (
    <View style={{ alignItems: 'center', padding: 12 }}>
      <Text style={{ fontSize: typography.xs, color: colors.textSecondary, marginBottom: 4 }}>{label}</Text>
      <View
        style={{
          backgroundColor: active ? colors.successBackground : colors.dangerBackground,
          paddingHorizontal: 12,
          paddingVertical: 4,
          borderRadius: 8,
        }}
      >
        <Text
          style={{
            fontSize: typography.sm,
            fontWeight: '700',
            color: active ? colors.success : colors.danger,
          }}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}
