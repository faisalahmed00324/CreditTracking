import { useColorModeValue } from '@chakra-ui/react';

export function useThemeColors() {
  return {
    pageBg: useColorModeValue('gray.50', 'gray.900'),
    cardBg: useColorModeValue('white', 'gray.800'),
    sidebarBg: useColorModeValue('brand.700', 'gray.900'),
    sidebarText: useColorModeValue('whiteAlpha.900', 'whiteAlpha.900'),
    sidebarHover: useColorModeValue('brand.800', 'gray.700'),
    sidebarActive: useColorModeValue('brand.900', 'brand.700'),
    textPrimary: useColorModeValue('gray.800', 'whiteAlpha.900'),
    textSecondary: useColorModeValue('gray.600', 'gray.400'),
    borderColor: useColorModeValue('gray.200', 'gray.700'),
    brandPrimary: useColorModeValue('brand.600', 'brand.400'),
    navbarBg: useColorModeValue('white', 'gray.800'),
    tableHeaderBg: useColorModeValue('gray.50', 'gray.700'),
    tableRowHover: useColorModeValue('blue.50', 'gray.700'),
    inputBg: useColorModeValue('white', 'gray.700'),
    badgePaidBg: useColorModeValue('green.100', 'green.900'),
    badgePaidColor: useColorModeValue('green.700', 'green.200'),
    badgeUnpaidBg: useColorModeValue('red.100', 'red.900'),
    badgeUnpaidColor: useColorModeValue('red.700', 'red.200'),
  };
}
