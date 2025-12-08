import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  Stack,
  Text,
  Card,
  Field,
} from '@chakra-ui/react';
import { Radio, RadioGroup } from '../components/ui/radio-group';
import { authService } from '../services/authService';
import { Toaster, toaster } from '../components/ui/toaster';

const Register = () => {
  const [formData, setFormData] = useState({
    userName: '',
    password: '',
    name: '',
    icNoOrPassport: '',
    role: '1', // Default to Customer
    email: '',
    address: '',
    latitude: '',
    longitude: '',
  });
  const [loading, setLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState('');
  const [userId, setUserId] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleChange = (value) => {
    setFormData({
      ...formData,
      role: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert role to number
      const userData = {
        ...formData,
        role: parseInt(formData.role),
      };

      const response = await authService.register(userData);
      setUserId(response.id);
      setShowOtpInput(true);
      
      toaster.create({
        title: 'Registration successful',
        description: 'Please check your email for the OTP code',
        type: 'success',
      });
    } catch (error) {
      console.error('Registration error:', error);
      toaster.create({
        title: 'Registration failed',
        description: error.response?.data?.message || 'Failed to register user',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authService.verifyOtp(userId, otp);
      
      toaster.create({
        title: 'OTP verified successfully',
        description: 'You can now log in with your credentials',
        type: 'success',
      });

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('OTP verification error:', error);
      toaster.create({
        title: 'OTP verification failed',
        description: error.response?.data?.message || 'Invalid OTP code',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  if (showOtpInput) {
    return (
      <Container maxW="md" py={{ base: '12', md: '24' }}>
        <Stack gap="8">
          <Stack gap="2" textAlign="center">
            <Heading size="xl">Verify OTP</Heading>
            <Text color="fg.muted">Enter the OTP sent to your email</Text>
          </Stack>

          <Card.Root>
            <Card.Body>
              <form onSubmit={handleOtpSubmit}>
                <Stack gap="4">
                  <Field.Root>
                    <Field.Label>OTP Code</Field.Label>
                    <Input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      placeholder="Enter OTP code"
                    />
                  </Field.Root>

                  <Button
                    type="submit"
                    colorScheme="blue"
                    loading={loading}
                    width="full"
                  >
                    Verify OTP
                  </Button>
                </Stack>
              </form>
            </Card.Body>
          </Card.Root>
        </Stack>
        <Toaster />
      </Container>
    );
  }

  return (
    <Container maxW="md" py={{ base: '12', md: '24' }}>
      <Stack gap="8">
        <Stack gap="2" textAlign="center">
          <Heading size="xl">Create Account</Heading>
          <Text color="fg.muted">Register for a new account</Text>
        </Stack>

        <Card.Root>
          <Card.Body>
            <form onSubmit={handleSubmit}>
              <Stack gap="4">
                <Field.Root>
                  <Field.Label>Username</Field.Label>
                  <Input
                    type="text"
                    name="userName"
                    value={formData.userName}
                    onChange={handleChange}
                    required
                    placeholder="Choose a username"
                  />
                </Field.Root>

                <Field.Root>
                  <Field.Label>Password</Field.Label>
                  <Input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Choose a password"
                  />
                </Field.Root>

                <Field.Root>
                  <Field.Label>Full Name</Field.Label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                  />
                </Field.Root>

                <Field.Root>
                  <Field.Label>IC No / Passport</Field.Label>
                  <Input
                    type="text"
                    name="icNoOrPassport"
                    value={formData.icNoOrPassport}
                    onChange={handleChange}
                    required
                    placeholder="Enter your IC or Passport number"
                  />
                </Field.Root>

                <Field.Root>
                  <Field.Label>Role</Field.Label>
                  <RadioGroup value={formData.role} onValueChange={handleRoleChange}>
                    <Stack direction="row" gap="4">
                      <Radio value="0">Shop</Radio>
                      <Radio value="1">Customer</Radio>
                    </Stack>
                  </RadioGroup>
                </Field.Root>

                <Field.Root>
                  <Field.Label>Email</Field.Label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter your email"
                  />
                </Field.Root>

                <Field.Root>
                  <Field.Label>Address</Field.Label>
                  <Input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    placeholder="Enter your address"
                  />
                </Field.Root>

                <Button
                  type="submit"
                  colorScheme="blue"
                  loading={loading}
                  width="full"
                >
                  Register
                </Button>
              </Stack>
            </form>
          </Card.Body>
        </Card.Root>

        <Text textAlign="center" fontSize="sm" color="fg.muted">
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'blue', textDecoration: 'underline' }}>
            Log in here
          </Link>
        </Text>
      </Stack>
      <Toaster />
    </Container>
  );
};

export default Register;
