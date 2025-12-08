import { Box, Container, Flex, Heading, Button, HStack } from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Layout = ({ children, title }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Header */}
      <Box bg="blue.600" color="white" py={4} boxShadow="md">
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center">
            <Heading size="lg">Credit Tracker</Heading>
            <HStack gap={4}>
              <Box>
                Welcome, <strong>{user?.name}</strong> ({user?.role === 0 ? 'Shop' : 'Customer'})
              </Box>
              <Button size="sm" colorScheme="red" onClick={handleLogout}>
                Logout
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxW="container.xl" py={8}>
        {title && (
          <Heading size="xl" mb={6}>
            {title}
          </Heading>
        )}
        {children}
      </Container>
    </Box>
  );
};

export default Layout;
