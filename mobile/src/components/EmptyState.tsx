import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors, useSpacing, useTypography } from '../hooks/useTheme';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  actionTitle?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon = 'document-outline',
  title,
  description,
  actionTitle,
  onAction,
}: EmptyStateProps) {
  const colors = useColors();
  const spacing = useSpacing();
  const typography = useTypography();

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl }}>
      <Ionicons name={icon} size={64} color={colors.textDisabled} />
      <Text
        style={{
          fontSize: typography.xl,
          fontWeight: '700',
          color: colors.text,
          marginTop: spacing.md,
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
      {description ? (
        <Text
          style={{
            fontSize: typography.base,
            color: colors.textSecondary,
            marginTop: spacing.sm,
            textAlign: 'center',
            lineHeight: 22,
          }}
        >
          {description}
        </Text>
      ) : null}
      {actionTitle && onAction ? (
        <TouchableOpacity
          onPress={onAction}
          style={{
            marginTop: spacing.lg,
            backgroundColor: colors.primary,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.sm,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: colors.textInverse, fontWeight: '600', fontSize: typography.base }}>
            {actionTitle}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
