import {
  Flex, Text, HStack, Avatar, Menu, MenuButton, MenuList, MenuItem,
  MenuDivider, Button
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../ThemeToggle';
import { useThemeColors } from '../../hooks/useThemeColors';

export function Navbar() {
  const { user, logout, isShop } = useAuth();
  const navigate = useNavigate();
  const colors = useThemeColors();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <Flex
      h="64px"
      bg={colors.navbarBg}
      borderBottom="1px"
      borderColor={colors.borderColor}
      px={6}
      align="center"
      justify="space-between"
      position="sticky"
      top={0}
      zIndex={10}
    >
      <Text fontWeight="semibold" color={colors.textPrimary} fontSize="sm">
        {isShop ? '🏪 Shop Portal' : '👤 Customer Portal'}
      </Text>

      <HStack spacing={3}>
        <ThemeToggle />
        <Menu>
          <MenuButton as={Button} variant="ghost" rightIcon={<ChevronDownIcon />} size="sm">
            <HStack spacing={2}>
              <Avatar size="xs" name={user?.id} bg="brand.500" />
              <Text fontSize="sm" color={colors.textPrimary}>{user?.role}</Text>
            </HStack>
          </MenuButton>
          <MenuList>
            <MenuItem onClick={() => navigate(isShop ? '/shop/dashboard' : '/customer/dashboard')}>
              Profile
            </MenuItem>
            <MenuDivider />
            <MenuItem color="red.500" onClick={handleLogout}>Logout</MenuItem>
          </MenuList>
        </Menu>
      </HStack>
    </Flex>
  );
}
