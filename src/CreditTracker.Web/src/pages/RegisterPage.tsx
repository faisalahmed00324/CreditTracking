import {
  Box, Button, Card, CardBody, FormControl, FormErrorMessage, FormLabel,
  Heading, Input, Stack, Text, Link, useToast, VStack, HStack, Icon,
  Select, SimpleGrid, Textarea
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useState } from 'react';
import { createUserApi } from '../lib/api';
import { ThemeToggle } from '../components/ThemeToggle';
import { useThemeColors } from '../hooks/useThemeColors';
import { MdCreditCard } from 'react-icons/md';

interface RegisterForm {
  userName: string;
  password: string;
  name: string;
  iCNoOrPassport: string;
  role: string;
  email: string;
  address: string;
  latitude: string;
  longitude: string;
}

export function RegisterPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const colors = useThemeColors();

  async function onSubmit(data: RegisterForm) {
    setLoading(true);
    try {
      await createUserApi({
        ...data,
        role: parseInt(data.role),
        latitude: data.latitude || '0',
        longitude: data.longitude || '0',
      });
      toast({
        title: 'Account created!',
        description: 'Please verify your OTP to activate your account.',
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
      navigate('/verify-otp');
    } catch (err: unknown) {
      toast({
        title: 'Registration failed',
        description: (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'An error occurred',
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
      <Box flex={1} display="flex" alignItems="center" justifyContent="center" px={4} py={8}>
        <Card maxW="600px" w="full" bg={colors.cardBg} shadow="xl">
          <CardBody>
            <VStack spacing={6} align="stretch">
              <VStack spacing={2}>
                <Icon as={MdCreditCard} boxSize={10} color={colors.brandPrimary} />
                <Heading size="lg" textAlign="center" color={colors.textPrimary}>
                  Create Account
                </Heading>
                <Text color={colors.textSecondary} fontSize="sm" textAlign="center">
                  Register as a Shop or Customer
                </Text>
              </VStack>

              <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={4}>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl isInvalid={!!errors.userName}>
                      <FormLabel color={colors.textPrimary}>Username</FormLabel>
                      <Input
                        {...register('userName', { required: 'Required' })}
                        placeholder="Username"
                        bg={colors.inputBg}
                      />
                      <FormErrorMessage>{errors.userName?.message}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={!!errors.name}>
                      <FormLabel color={colors.textPrimary}>Full Name</FormLabel>
                      <Input
                        {...register('name', { required: 'Required' })}
                        placeholder="Full name"
                        bg={colors.inputBg}
                      />
                      <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={!!errors.email}>
                      <FormLabel color={colors.textPrimary}>Email</FormLabel>
                      <Input
                        {...register('email', { required: 'Required' })}
                        type="email"
                        placeholder="Email"
                        bg={colors.inputBg}
                      />
                      <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={!!errors.password}>
                      <FormLabel color={colors.textPrimary}>Password</FormLabel>
                      <Input
                        {...register('password', { required: 'Required', minLength: { value: 6, message: 'Min 6 chars' } })}
                        type="password"
                        placeholder="Password"
                        bg={colors.inputBg}
                      />
                      <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={!!errors.iCNoOrPassport}>
                      <FormLabel color={colors.textPrimary}>IC / Passport No</FormLabel>
                      <Input
                        {...register('iCNoOrPassport', { required: 'Required' })}
                        placeholder="IC or Passport"
                        bg={colors.inputBg}
                      />
                      <FormErrorMessage>{errors.iCNoOrPassport?.message}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={!!errors.role}>
                      <FormLabel color={colors.textPrimary}>Account Type</FormLabel>
                      <Select
                        {...register('role', { required: 'Required' })}
                        bg={colors.inputBg}
                      >
                        <option value="">Select type</option>
                        <option value="1">Shop</option>
                        <option value="2">Customer</option>
                      </Select>
                      <FormErrorMessage>{errors.role?.message}</FormErrorMessage>
                    </FormControl>
                  </SimpleGrid>

                  <FormControl>
                    <FormLabel color={colors.textPrimary}>Address</FormLabel>
                    <Textarea
                      {...register('address')}
                      placeholder="Address"
                      bg={colors.inputBg}
                      rows={2}
                    />
                  </FormControl>

                  <SimpleGrid columns={2} spacing={4}>
                    <FormControl>
                      <FormLabel color={colors.textPrimary}>Latitude</FormLabel>
                      <Input {...register('latitude')} placeholder="e.g. 3.1390" bg={colors.inputBg} />
                    </FormControl>
                    <FormControl>
                      <FormLabel color={colors.textPrimary}>Longitude</FormLabel>
                      <Input {...register('longitude')} placeholder="e.g. 101.6869" bg={colors.inputBg} />
                    </FormControl>
                  </SimpleGrid>

                  <Button
                    type="submit"
                    colorScheme="brand"
                    size="lg"
                    isLoading={loading}
                    loadingText="Creating..."
                  >
                    Create Account
                  </Button>
                </Stack>
              </form>

              <Text textAlign="center" fontSize="sm" color={colors.textSecondary}>
                Already have an account?{' '}
                <Link as={RouterLink} to="/login" color={colors.brandPrimary} fontWeight="semibold">
                  Sign in
                </Link>
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </Box>
    </Box>
  );
}
