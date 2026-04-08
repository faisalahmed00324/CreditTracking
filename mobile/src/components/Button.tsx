import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { useColors, useRadius, useSpacing, useTypography } from '../hooks/useTheme';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export default function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  style,
  textStyle,
  fullWidth = false,
  disabled,
  ...rest
}: ButtonProps) {
  const colors = useColors();
  const spacing = useSpacing();
  const radius = useRadius();
  const typography = useTypography();

  const isDisabled = disabled || loading;

  const bgMap: Record<Variant, string> = {
    primary: colors.primary,
    secondary: colors.surfaceVariant,
    danger: colors.danger,
    ghost: 'transparent',
    success: colors.success,
  };

  const textColorMap: Record<Variant, string> = {
    primary: colors.textInverse,
    secondary: colors.text,
    danger: colors.textInverse,
    ghost: colors.primary,
    success: colors.textInverse,
  };

  const paddingMap: Record<Size, { h: number; v: number }> = {
    sm: { h: spacing.md, v: spacing.xs + 2 },
    md: { h: spacing.lg, v: spacing.sm + 2 },
    lg: { h: spacing.xl, v: spacing.md },
  };

  const fontSizeMap: Record<Size, number> = {
    sm: typography.sm,
    md: typography.base,
    lg: typography.lg,
  };

  const pad = paddingMap[size];

  return (
    <TouchableOpacity
      style={[
        {
          backgroundColor: isDisabled ? colors.textDisabled : bgMap[variant],
          paddingHorizontal: pad.h,
          paddingVertical: pad.v,
          borderRadius: radius.md,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          alignSelf: fullWidth ? 'stretch' : 'auto',
          borderWidth: variant === 'ghost' ? 1 : 0,
          borderColor: variant === 'ghost' ? colors.primary : 'transparent',
          opacity: isDisabled ? 0.6 : 1,
        },
        style,
      ]}
      disabled={isDisabled}
      activeOpacity={0.75}
      {...rest}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={textColorMap[variant]}
          style={{ marginRight: spacing.xs }}
        />
      )}
      <Text
        style={[
          {
            color: textColorMap[variant],
            fontSize: fontSizeMap[size],
            fontWeight: '600',
            letterSpacing: 0.2,
          },
          textStyle,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}
