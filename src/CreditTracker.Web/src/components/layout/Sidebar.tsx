import {
  Box, VStack, Text, Icon, Flex, Divider
} from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import {
  MdDashboard, MdCreditCard, MdAddCircle, MdPeople
} from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import { useThemeColors } from '../../hooks/useThemeColors';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  to: string;
}

function NavItem({ icon, label, to }: NavItemProps) {
  const { pathname } = useLocation();
  const colors = useThemeColors();
  const isActive = pathname === to || pathname.startsWith(to + '/');

  return (
    <Flex
      as={Link}
      to={to}
      align="center"
      gap={3}
      px={4}
      py={3}
      borderRadius="lg"
      bg={isActive ? colors.sidebarActive : 'transparent'}
      color={colors.sidebarText}
      _hover={{ bg: colors.sidebarHover, textDecoration: 'none' }}
      fontWeight={isActive ? 'semibold' : 'normal'}
      w="full"
      transition="all 0.2s"
    >
      <Icon as={icon} boxSize={5} />
      <Text fontSize="sm">{label}</Text>
    </Flex>
  );
}

export function Sidebar() {
  const { isShop } = useAuth();
  const colors = useThemeColors();

  const shopNav = [
    { icon: MdDashboard, label: 'Dashboard', to: '/shop/dashboard' },
    { icon: MdCreditCard, label: 'Credit Entries', to: '/shop/entries' },
    { icon: MdAddCircle, label: 'New Entry', to: '/shop/entries/new' },
    { icon: MdPeople, label: 'Customers', to: '/shop/customers' },
  ];

  const customerNav = [
    { icon: MdDashboard, label: 'Dashboard', to: '/customer/dashboard' },
    { icon: MdCreditCard, label: 'My Credits', to: '/customer/entries' },
  ];

  const navItems = isShop ? shopNav : customerNav;

  return (
    <Box
      w="240px"
      minH="100vh"
      bg={colors.sidebarBg}
      py={6}
      px={3}
      flexShrink={0}
    >
      <Text
        fontSize="lg"
        fontWeight="bold"
        color={colors.sidebarText}
        px={4}
        mb={6}
        letterSpacing="wide"
      >
        💳 CreditTracker
      </Text>
      <Divider borderColor="whiteAlpha.300" mb={4} />
      <VStack spacing={1} align="stretch">
        {navItems.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </VStack>
    </Box>
  );
}
