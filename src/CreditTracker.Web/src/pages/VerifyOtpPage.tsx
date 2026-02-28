import {
  Box, Button, Card, CardBody, FormControl, FormErrorMessage, FormLabel,
  Heading, Input, Stack, Text, VStack, HStack, Icon, useToast
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { verifyOtpApi } from '../lib/api';
import { ThemeToggle } from '../components/ThemeToggle';
import { useThemeColors } from '../hooks/useThemeColors';
import { MdVerified } from 'react-icons/md';

interface VerifyForm {
  id: string;
  otp: string;
}

export function VerifyOtpPage() {
  const location = useLocation();
  const prefillId = (location.state as { userId?: string } | null)?.userId || '';
  const { register, handleSubmit, formState: { errors } } = useForm<VerifyForm>({
    defaultValues: { id: prefillId },
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const colors = useThemeColors();

  async function onSubmit(data: VerifyForm) {
    setLoading(true);
    try {
      const res = await verifyOtpApi(data.id, data.otp);
      if (res.data?.isSuccess) {
        toast({
          title: 'Account verified!',
          description: 'You can now log in.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        navigate('/login');
      } else {
        toast({
          title: 'Verification failed',
          description: 'Invalid OTP. Please try again.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err: unknown) {
      toast({
        title: 'Error',
        description: (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Verification failed',
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
        <Card maxW="440px" w="full" bg={colors.cardBg} shadow="xl">
          <CardBody>
            <VStack spacing={6} align="stretch">
              <VStack spacing={2}>
                <Icon as={MdVerified} boxSize={10} color="green.500" />
                <Heading size="lg" textAlign="center" color={colors.textPrimary}>
                  Verify OTP
                </Heading>
                <Text color={colors.textSecondary} fontSize="sm" textAlign="center">
                  Enter the OTP sent to your email
                </Text>
              </VStack>

              <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={4}>
                  <FormControl isInvalid={!!errors.id}>
                    <FormLabel color={colors.textPrimary}>User ID</FormLabel>
                    <Input
                      {...register('id', { required: 'User ID is required' })}
                      placeholder="Your user ID (from registration)"
                      bg={colors.inputBg}
                      isReadOnly={!!prefillId}
                    />
                    <FormErrorMessage>{errors.id?.message}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors.otp}>
                    <FormLabel color={colors.textPrimary}>OTP Code</FormLabel>
                    <Input
                      {...register('otp', { required: 'OTP is required' })}
                      placeholder="Enter OTP"
                      bg={colors.inputBg}
                      maxLength={6}
                    />
                    <FormErrorMessage>{errors.otp?.message}</FormErrorMessage>
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="green"
                    size="lg"
                    isLoading={loading}
                    loadingText="Verifying..."
                  >
                    Verify OTP
                  </Button>
                </Stack>
              </form>
            </VStack>
          </CardBody>
        </Card>
      </Box>
    </Box>
  );
}
