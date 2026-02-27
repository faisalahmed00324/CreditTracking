import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useColors, useTypography } from '../hooks/useTheme';

interface LoadingProps {
  message?: string;
}

export default function Loading({ message }: LoadingProps) {
  const colors = useColors();
  const typography = useTypography();

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
      <ActivityIndicator size="large" color={colors.primary} />
      {message ? (
        <Text style={{ marginTop: 12, color: colors.textSecondary, fontSize: typography.sm }}>
          {message}
        </Text>
      ) : null}
    </View>
  );
}
