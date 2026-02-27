import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

const colors = {
  brand: {
    50: '#e3f2fd',
    100: '#bbdefb',
    200: '#90caf9',
    300: '#64b5f6',
    400: '#42a5f5',
    500: '#2196f3',
    600: '#1e88e5',
    700: '#1976d2',
    800: '#1565c0',
    900: '#0d47a1',
  },
  accent: {
    50: '#fff3e0',
    100: '#ffe0b2',
    200: '#ffcc80',
    300: '#ffb74d',
    400: '#ffa726',
    500: '#ff9800',
    600: '#fb8c00',
    700: '#f57c00',
    800: '#ef6c00',
    900: '#e65100',
  },
  success: {
    50: '#e8f5e9',
    500: '#4caf50',
    700: '#388e3c',
  },
  danger: {
    50: '#ffebee',
    500: '#f44336',
    700: '#d32f2f',
  },
};

const semanticTokens = {
  colors: {
    'bg.page': {
      default: 'gray.50',
      _dark: 'gray.900',
    },
    'bg.card': {
      default: 'white',
      _dark: 'gray.800',
    },
    'bg.sidebar': {
      default: 'brand.700',
      _dark: 'gray.900',
    },
    'text.primary': {
      default: 'gray.800',
      _dark: 'whiteAlpha.900',
    },
    'text.secondary': {
      default: 'gray.600',
      _dark: 'gray.400',
    },
    'border.default': {
      default: 'gray.200',
      _dark: 'gray.700',
    },
    'brand.primary': {
      default: 'brand.600',
      _dark: 'brand.400',
    },
    'badge.paid': {
      default: 'green.100',
      _dark: 'green.900',
    },
    'badge.unpaid': {
      default: 'red.100',
      _dark: 'red.900',
    },
  },
};

export const theme = extendTheme({ config, colors, semanticTokens });
