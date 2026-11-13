import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
  HStack,
  Heading,
  Text,
  Card,
  CardBody,
  useToast,
  IconButton,
  Link,
  PinInput,
  PinInputField,
  Alert,
  AlertIcon,
  Step,
  StepIndicator,
  StepStatus,
  StepTitle,
  StepSeparator,
  Stepper,
  useSteps,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const steps = [{ title: 'Register' }, { title: 'Verify OTP' }];

export default function RegisterPage() {
  const { activeStep, setActiveStep } = useSteps({ index: 0, count: steps.length });
  const [formData, setFormData] = useState({
    userName: '',
    password: '',
    confirmPassword: '',
    name: '',
    email: '',
    iCNoOrPassport: '',
    address: '',
    latitude: '',
    longitude: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [registeredId, setRegisteredId] = useState(null);
  const [errors, setErrors] = useState({});
  const { register, verifyOtp, loading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const getErrorMessage = (err, fallback) => {
    const responseData = err?.response?.data;
    if (typeof responseData?.message === 'string' && responseData.message.trim()) {
      return responseData.message;
    }
    if (typeof responseData === 'string' && responseData.trim()) {
      return responseData;
    }
    return fallback;
  };

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateRegistration = () => {
    const newErrors = {};
    if (!formData.userName.trim()) newErrors.userName = 'Username is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.iCNoOrPassport.trim())
      newErrors.iCNoOrPassport = 'IC No / Passport is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateRegistration()) return;
    try {
      const { confirmPassword, ...userData } = formData;
      const data = await register({
        ...userData,
        latitude: userData.latitude?.trim() || '',
        longitude: userData.longitude?.trim() || '',
      });
      setRegisteredId(data?.id || data);
      setActiveStep(1);
      toast({
        title: 'Registration submitted',
        description: 'Please check your email for the OTP code.',
        status: 'info',
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Registration failed',
        description: getErrorMessage(err, 'Please try again.'),
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      setErrors({ otp: 'Please enter the OTP code' });
      return;
    }
    try {
      await verifyOtp(registeredId, otp);
      toast({
        title: 'Verification successful!',
        description: 'You can now log in.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/login');
    } catch (err) {
      toast({
        title: 'Verification failed',
        description: getErrorMessage(err, 'Invalid OTP code.'),
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="gray.50"
      px={4}
      py={8}
    >
      <Card w="full" maxW="lg" shadow="lg">
        <CardBody p={8}>
          <VStack spacing={6}>
            <VStack spacing={2}>
              <Heading size="lg" color="blue.600">
                CreditTracker
              </Heading>
              <Text color="gray.500">Create your account</Text>
            </VStack>

            <Stepper index={activeStep} w="full" size="sm" colorScheme="blue">
              {steps.map((step, index) => (
                <Step key={index}>
                  <StepIndicator>
                    <StepStatus complete="✓" incomplete={index + 1} active={index + 1} />
                  </StepIndicator>
                  <Box flexShrink={0}>
                    <StepTitle>{step.title}</StepTitle>
                  </Box>
                  <StepSeparator />
                </Step>
              ))}
            </Stepper>

            {activeStep === 0 ? (
              <VStack as="form" onSubmit={handleRegister} spacing={4} w="full">
                <FormControl isInvalid={!!errors.userName}>
                  <FormLabel>Username</FormLabel>
                  <Input
                    placeholder="Choose a username"
                    value={formData.userName}
                    onChange={handleChange('userName')}
                  />
                  <FormErrorMessage>{errors.userName}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.name}>
                  <FormLabel>Full Name</FormLabel>
                  <Input
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange('name')}
                  />
                  <FormErrorMessage>{errors.name}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.email}>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange('email')}
                  />
                  <FormErrorMessage>{errors.email}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.iCNoOrPassport}>
                  <FormLabel>IC No / Passport</FormLabel>
                  <Input
                    placeholder="Enter IC number or passport"
                    value={formData.iCNoOrPassport}
                    onChange={handleChange('iCNoOrPassport')}
                  />
                  <FormErrorMessage>{errors.iCNoOrPassport}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.password}>
                  <FormLabel>Password</FormLabel>
                  <InputGroup>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="At least 6 characters"
                      value={formData.password}
                      onChange={handleChange('password')}
                    />
                    <InputRightElement>
                      <IconButton
                        variant="ghost"
                        size="sm"
                        icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide' : 'Show'}
                      />
                    </InputRightElement>
                  </InputGroup>
                  <FormErrorMessage>{errors.password}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.confirmPassword}>
                  <FormLabel>Confirm Password</FormLabel>
                  <Input
                    type="password"
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={handleChange('confirmPassword')}
                  />
                  <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.address}>
                  <FormLabel>Address</FormLabel>
                  <Input
                    placeholder="Enter your address"
                    value={formData.address}
                    onChange={handleChange('address')}
                  />
                  <FormErrorMessage>{errors.address}</FormErrorMessage>
                </FormControl>

                <HStack w="full" spacing={4}>
                  <FormControl>
                    <FormLabel>Latitude</FormLabel>
                    <Input
                      type="number"
                      step="any"
                      placeholder="0.0"
                      value={formData.latitude}
                      onChange={handleChange('latitude')}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Longitude</FormLabel>
                    <Input
                      type="number"
                      step="any"
                      placeholder="0.0"
                      value={formData.longitude}
                      onChange={handleChange('longitude')}
                    />
                  </FormControl>
                </HStack>

                <Button
                  type="submit"
                  colorScheme="blue"
                  w="full"
                  size="lg"
                  isLoading={loading}
                >
                  Register
                </Button>

                <Text fontSize="sm" color="gray.500">
                  Already have an account?{' '}
                  <Link as={RouterLink} to="/login" color="blue.500" fontWeight="medium">
                    Sign in
                  </Link>
                </Text>
              </VStack>
            ) : (
              <VStack as="form" onSubmit={handleVerifyOtp} spacing={6} w="full">
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  An OTP has been sent to your email. Please enter it below.
                </Alert>

                <FormControl isInvalid={!!errors.otp}>
                  <FormLabel textAlign="center">Enter OTP Code</FormLabel>
                  <HStack justify="center">
                    <PinInput
                      value={otp}
                      onChange={setOtp}
                      size="lg"
                      otp
                    >
                      <PinInputField />
                      <PinInputField />
                      <PinInputField />
                      <PinInputField />
                      <PinInputField />
                      <PinInputField />
                    </PinInput>
                  </HStack>
                  <FormErrorMessage justifyContent="center">{errors.otp}</FormErrorMessage>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="green"
                  w="full"
                  size="lg"
                  isLoading={loading}
                >
                  Verify OTP
                </Button>
              </VStack>
            )}
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
}
