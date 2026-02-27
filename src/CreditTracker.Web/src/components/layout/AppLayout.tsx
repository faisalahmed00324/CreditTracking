import { Box, Flex } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useThemeColors } from '../../hooks/useThemeColors';

export function AppLayout() {
  const colors = useThemeColors();
  return (
    <Flex minH="100vh" bg={colors.pageBg}>
      <Sidebar />
      <Box flex={1} display="flex" flexDirection="column" minW={0}>
        <Navbar />
        <Box flex={1} p={6} overflowY="auto">
          <Outlet />
        </Box>
      </Box>
    </Flex>
  );
}
