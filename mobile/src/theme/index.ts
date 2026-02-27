export const palette = {
  // Brand
  primary: '#4F46E5',
  primaryLight: '#818CF8',
  primaryDark: '#3730A3',

  // Accent
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',

  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
} as const;

export type Theme = {
  colors: {
    // App chrome
    background: string;
    surface: string;
    surfaceVariant: string;
    card: string;
    border: string;
    shadow: string;

    // Text
    text: string;
    textSecondary: string;
    textDisabled: string;
    textInverse: string;

    // Brand
    primary: string;
    primaryLight: string;
    primaryDark: string;

    // Status
    success: string;
    successBackground: string;
    warning: string;
    warningBackground: string;
    danger: string;
    dangerBackground: string;
    info: string;
    infoBackground: string;

    // Input
    inputBackground: string;
    inputBorder: string;
    inputFocusBorder: string;
    placeholder: string;

    // Tab bar
    tabBarBackground: string;
    tabBarActive: string;
    tabBarInactive: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
  typography: {
    xs: number;
    sm: number;
    base: number;
    lg: number;
    xl: number;
    xxl: number;
    xxxl: number;
  };
  isDark: boolean;
};

export const lightTheme: Theme = {
  colors: {
    background: palette.gray50,
    surface: palette.white,
    surfaceVariant: palette.gray100,
    card: palette.white,
    border: palette.gray200,
    shadow: 'rgba(0,0,0,0.08)',

    text: palette.gray900,
    textSecondary: palette.gray500,
    textDisabled: palette.gray400,
    textInverse: palette.white,

    primary: palette.primary,
    primaryLight: palette.primaryLight,
    primaryDark: palette.primaryDark,

    success: palette.success,
    successBackground: '#D1FAE5',
    warning: palette.warning,
    warningBackground: '#FEF3C7',
    danger: palette.danger,
    dangerBackground: '#FEE2E2',
    info: palette.info,
    infoBackground: '#DBEAFE',

    inputBackground: palette.white,
    inputBorder: palette.gray300,
    inputFocusBorder: palette.primary,
    placeholder: palette.gray400,

    tabBarBackground: palette.white,
    tabBarActive: palette.primary,
    tabBarInactive: palette.gray400,
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
  radius: { sm: 6, md: 10, lg: 14, xl: 20, full: 9999 },
  typography: { xs: 11, sm: 13, base: 15, lg: 17, xl: 20, xxl: 24, xxxl: 30 },
  isDark: false,
};

export const darkTheme: Theme = {
  ...lightTheme,
  colors: {
    background: palette.gray900,
    surface: palette.gray800,
    surfaceVariant: palette.gray700,
    card: palette.gray800,
    border: palette.gray700,
    shadow: 'rgba(0,0,0,0.4)',

    text: palette.gray50,
    textSecondary: palette.gray400,
    textDisabled: palette.gray600,
    textInverse: palette.gray900,

    primary: palette.primaryLight,
    primaryLight: '#A5B4FC',
    primaryDark: palette.primary,

    success: '#34D399',
    successBackground: '#064E3B',
    warning: '#FCD34D',
    warningBackground: '#78350F',
    danger: '#F87171',
    dangerBackground: '#7F1D1D',
    info: '#60A5FA',
    infoBackground: '#1E3A5F',

    inputBackground: palette.gray800,
    inputBorder: palette.gray600,
    inputFocusBorder: palette.primaryLight,
    placeholder: palette.gray500,

    tabBarBackground: palette.gray800,
    tabBarActive: palette.primaryLight,
    tabBarInactive: palette.gray500,
  },
  isDark: true,
};
