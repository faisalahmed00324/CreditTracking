import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { useColors, useRadius, useSpacing, useTypography } from '../hooks/useTheme';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  style?: ViewStyle;
}

export default function Card({ children, title, style }: CardProps) {
  const colors = useColors();
  const spacing = useSpacing();
  const radius = useRadius();
  const typography = useTypography();

  return (
    <View
      style={[
        {
          backgroundColor: colors.card,
          borderRadius: radius.lg,
          padding: spacing.md,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 1,
          shadowRadius: 6,
          elevation: 3,
          borderWidth: 1,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {title ? (
        <Text
          style={{
            fontSize: typography.lg,
            fontWeight: '700',
            color: colors.text,
            marginBottom: spacing.md,
          }}
        >
          {title}
        </Text>
      ) : null}
      {children}
    </View>
  );
}
