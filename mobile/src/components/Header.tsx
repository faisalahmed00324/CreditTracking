import React from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors, useSpacing, useTypography } from '../hooks/useTheme';
import { useTheme } from '../hooks/useTheme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: {
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
  };
}

export default function Header({ title, subtitle, onBack, rightAction }: HeaderProps) {
  const colors = useColors();
  const spacing = useSpacing();
  const typography = useTypography();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        paddingTop: insets.top,
        paddingBottom: spacing.md,
        paddingHorizontal: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.surface}
      />
      {onBack ? (
        <TouchableOpacity onPress={onBack} style={{ marginRight: spacing.sm, padding: 4 }}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
      ) : null}

      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: typography.xl, fontWeight: '700', color: colors.text }}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={{ fontSize: typography.sm, color: colors.textSecondary, marginTop: 2 }}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {rightAction ? (
        <TouchableOpacity
          onPress={rightAction.onPress}
          style={{
            padding: spacing.sm,
            backgroundColor: colors.surfaceVariant,
            borderRadius: 10,
          }}
        >
          <Ionicons name={rightAction.icon} size={20} color={colors.text} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
