import {
  Box, Button, Card, CardBody, FormControl, FormErrorMessage, FormLabel,
  Heading, Input, Stack, Text, Link, useToast, VStack, HStack, Icon
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useState } from 'react';
import { loginApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { useThemeColors } from '../hooks/useThemeColors';
import { MdCreditCard } from 'react-icons/md';

interface LoginForm {
  userName: string;
  password: string;
}

export function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const colors = useThemeColors();

  async function onSubmit(data: LoginForm) {
    setLoading(true);
    try {
      const res = await loginApi(data.userName, data.password);
      const token = res.data?.token;
      if (!token) throw new Error('No token received');
      login(token);
      // Determine role from token
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
        navigate(role === 'Shop' ? '/shop/dashboard' : '/customer/dashboard');
      } catch {
        navigate('/customer/dashboard');
      }
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Invalid credentials';
      toast({
        title: 'Login failed',
        description: message,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box minH="100vh" bg={colors.pageBg} display="flex" flexDirection="column">
      <HStack justify="flex-end" p={4}>
        <ThemeToggle />
      </HStack>
      <Box flex={1} display="flex" alignItems="center" justifyContent="center" px={4}>
        <Card maxW="420px" w="full" bg={colors.cardBg} shadow="xl">
          <CardBody>
            <VStack spacing={6} align="stretch">
              <VStack spacing={2}>
                <Icon as={MdCreditCard} boxSize={10} color={colors.brandPrimary} />
                <Heading size="lg" textAlign="center" color={colors.textPrimary}>
                  CreditTracker
                </Heading>
                <Text color={colors.textSecondary} fontSize="sm" textAlign="center">
                  Sign in to your account
                </Text>
              </VStack>

              <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={4}>
                  <FormControl isInvalid={!!errors.userName}>
                    <FormLabel color={colors.textPrimary}>Username</FormLabel>
                    <Input
                      {...register('userName', { required: 'Username is required' })}
                      placeholder="Enter your username"
                      bg={colors.inputBg}
                    />
                    <FormErrorMessage>{errors.userName?.message}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors.password}>
                    <FormLabel color={colors.textPrimary}>Password</FormLabel>
                    <Input
                      {...register('password', { required: 'Password is required' })}
                      type="password"
                      placeholder="Enter your password"
                      bg={colors.inputBg}
                    />
                    <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="brand"
                    size="lg"
                    isLoading={loading}
                    loadingText="Signing in..."
                  >
                    Sign In
                  </Button>
                </Stack>
              </form>

              <Text textAlign="center" fontSize="sm" color={colors.textSecondary}>
                Don't have an account?{' '}
                <Link as={RouterLink} to="/register" color={colors.brandPrimary} fontWeight="semibold">
                  Register
                </Link>
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </Box>
    </Box>
  );
}
