import React from 'react';
import {
  Box,
  Flex,
  HStack,
  VStack,
  IconButton,
  Text,
  Button,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Divider,
  Icon,
  useColorModeValue,
  useColorMode,
} from '@chakra-ui/react';
import { HamburgerIcon, MoonIcon, SunIcon } from '@chakra-ui/icons';
import { FiHome, FiList, FiPlusCircle, FiLogOut, FiUser } from 'react-icons/fi';
import { Link as RouterLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/dashboard', icon: FiHome, roles: ['all'] },
  { label: 'Credit Entries', to: '/credit-entries', icon: FiList, roles: ['all'] },
  { label: 'Create Entry', to: '/create-entry', icon: FiPlusCircle, roles: ['Shop', '1'] },
];

function NavItem({ item, isActive, onClick }) {
  const activeBg = useColorModeValue('blue.50', 'blue.900');
  const activeColor = useColorModeValue('blue.700', 'blue.200');

  return (
    <Button
      as={RouterLink}
      to={item.to}
      variant="ghost"
      justifyContent="flex-start"
      w="full"
      leftIcon={<Icon as={item.icon} />}
      bg={isActive ? activeBg : 'transparent'}
      color={isActive ? activeColor : undefined}
      fontWeight={isActive ? 'semibold' : 'normal'}
      onClick={onClick}
      _hover={{ bg: activeBg }}
    >
      {item.label}
    </Button>
  );
}

function SidebarContent({ onClose }) {
  const { user } = useAuth();
  const location = useLocation();

  const filteredItems = NAV_ITEMS.filter(
    (item) =>
      item.roles.includes('all') ||
      item.roles.includes(user?.role)
  );

  return (
    <VStack spacing={1} align="stretch" p={4}>
      {filteredItems.map((item) => (
        <NavItem
          key={item.to}
          item={item}
          isActive={location.pathname === item.to}
          onClick={onClose}
        />
      ))}
    </VStack>
  );
}

export default function Layout() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, logout } = useAuth();
  const { colorMode, toggleColorMode } = useColorMode();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const displayName = user?.name || user?.userName || 'User';
  const roleLabel = user?.role === '1' || user?.role === 'Shop' ? 'Shop' : 'Customer';

  return (
    <Flex minH="100vh" direction="column">
      {/* Top Navbar */}
      <Flex
        as="header"
        align="center"
        justify="space-between"
        px={4}
        py={3}
        bg={bgColor}
        borderBottomWidth="1px"
        borderColor={borderColor}
        position="sticky"
        top={0}
        zIndex="sticky"
      >
        <HStack spacing={3}>
          <IconButton
            display={{ base: 'flex', md: 'none' }}
            icon={<HamburgerIcon />}
            variant="ghost"
            onClick={onOpen}
            aria-label="Open menu"
          />
          <Text fontSize="xl" fontWeight="bold" color="blue.600">
            CreditTracker
          </Text>
        </HStack>

        <HStack spacing={2}>
          <IconButton
            variant="ghost"
            aria-label={colorMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
          />

          <Menu>
            <MenuButton>
              <HStack spacing={2} cursor="pointer">
                <Avatar size="sm" name={displayName} />
                <Box display={{ base: 'none', md: 'block' }}>
                  <Text fontSize="sm" fontWeight="medium">
                    {displayName}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {roleLabel}
                  </Text>
                </Box>
              </HStack>
            </MenuButton>
            <MenuList>
              <MenuItem icon={<FiUser />}>
                {displayName} ({roleLabel})
              </MenuItem>
              <Divider />
              <MenuItem
                icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                onClick={toggleColorMode}
              >
                {colorMode === 'light' ? 'Dark mode' : 'Light mode'}
              </MenuItem>
              <Divider />
              <MenuItem icon={<FiLogOut />} onClick={logout}>
                Logout
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>

      <Flex flex="1">
        {/* Sidebar - Desktop */}
        <Box
          as="nav"
          display={{ base: 'none', md: 'block' }}
          w="240px"
          bg={bgColor}
          borderRightWidth="1px"
          borderColor={borderColor}
          py={4}
        >
          <SidebarContent onClose={() => {}} />
        </Box>

        {/* Sidebar - Mobile Drawer */}
        <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader borderBottomWidth="1px">
              <Text color="blue.600" fontWeight="bold">
                CreditTracker
              </Text>
            </DrawerHeader>
            <DrawerBody p={0}>
              <SidebarContent onClose={onClose} />
            </DrawerBody>
          </DrawerContent>
        </Drawer>

        {/* Main Content */}
        <Box flex="1" p={{ base: 4, md: 8 }} bg={useColorModeValue('gray.50', 'gray.900')}>
          <Outlet />
        </Box>
      </Flex>
    </Flex>
  );
}
