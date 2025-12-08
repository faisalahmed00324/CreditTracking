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
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { Toaster, toaster } from '../components/ui/toaster';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.login(username, password);
      
      // Get user details
      const userDetails = await authService.getCurrentUser();
      
      login(userDetails, response.token);
      
      toaster.create({
        title: 'Login successful',
        type: 'success',
      });

      // Navigate based on user role
      if (userDetails.role === 0) {
        navigate('/shop/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      toaster.create({
        title: 'Login failed',
        description: error.response?.data?.message || 'Invalid username or password',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="md" py={{ base: '12', md: '24' }}>
      <Stack gap="8">
        <Stack gap="2" textAlign="center">
          <Heading size="xl">Welcome Back</Heading>
          <Text color="fg.muted">Log in to your account</Text>
        </Stack>

        <Card.Root>
          <Card.Body>
            <form onSubmit={handleSubmit}>
              <Stack gap="4">
                <Field.Root>
                  <Field.Label>Username</Field.Label>
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="Enter your username"
                  />
                </Field.Root>

                <Field.Root>
                  <Field.Label>Password</Field.Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                  />
                </Field.Root>

                <Button
                  type="submit"
                  colorScheme="blue"
                  loading={loading}
                  width="full"
                >
                  Sign In
                </Button>
              </Stack>
            </form>
          </Card.Body>
        </Card.Root>

        <Text textAlign="center" fontSize="sm" color="fg.muted">
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'blue', textDecoration: 'underline' }}>
            Register here
          </Link>
        </Text>
      </Stack>
      <Toaster />
    </Container>
  );
};

export default Login;
