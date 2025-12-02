import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Button, TextInput} from '../components';
import {useAuth} from '../context';
import {Role, User} from '../types';
import {ApiError} from '../api';

type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  VerifyOtp: {userId: string};
};

type RegisterScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Register'
>;

interface RegisterScreenProps {
  navigation: RegisterScreenNavigationProp;
}

interface FormErrors {
  name?: string;
  userName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  icNoOrPassport?: string;
  address?: string;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({navigation}) => {
  const {register} = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    userName: '',
    email: '',
    password: '',
    confirmPassword: '',
    icNoOrPassport: '',
    address: '',
    latitude: '',
    longitude: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({...prev, [field]: value}));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({...prev, [field]: undefined}));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.userName.trim()) {
      newErrors.userName = 'Username is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.icNoOrPassport.trim()) {
      newErrors.icNoOrPassport = 'IC No or Passport is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const user: User = {
        id: '',
        userName: formData.userName.trim(),
        password: formData.password,
        name: formData.name.trim(),
        email: formData.email.trim(),
        icNoOrPassport: formData.icNoOrPassport.trim(),
        address: formData.address.trim(),
        latitude: formData.latitude || '0',
        longitude: formData.longitude || '0',
        role: Role.Customer, // Default to Customer role
      };

      const userId = await register(user);
      Alert.alert(
        'Registration Successful',
        'Please verify your account with the OTP sent to your email.',
        [{text: 'OK', onPress: () => navigation.navigate('VerifyOtp', {userId})}],
      );
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Registration failed. Please try again.';
      Alert.alert('Registration Failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to start tracking credits</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            label="Full Name"
            placeholder="Enter your full name"
            value={formData.name}
            onChangeText={value => updateField('name', value)}
            error={errors.name}
          />

          <TextInput
            label="Username"
            placeholder="Choose a username"
            value={formData.userName}
            onChangeText={value => updateField('userName', value)}
            error={errors.userName}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            label="Email"
            placeholder="Enter your email"
            value={formData.email}
            onChangeText={value => updateField('email', value)}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            label="IC No / Passport"
            placeholder="Enter your IC No or Passport"
            value={formData.icNoOrPassport}
            onChangeText={value => updateField('icNoOrPassport', value)}
            error={errors.icNoOrPassport}
          />

          <TextInput
            label="Address (Optional)"
            placeholder="Enter your address"
            value={formData.address}
            onChangeText={value => updateField('address', value)}
            error={errors.address}
            multiline
          />

          <TextInput
            label="Password"
            placeholder="Create a password"
            value={formData.password}
            onChangeText={value => updateField('password', value)}
            error={errors.password}
            secureTextEntry
          />

          <TextInput
            label="Confirm Password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChangeText={value => updateField('confirmPassword', value)}
            error={errors.confirmPassword}
            secureTextEntry
          />

          <Button
            title="Register"
            onPress={handleRegister}
            loading={loading}
            disabled={loading}
            style={styles.registerButton}
          />

          <Button
            title="Already have an account? Login"
            onPress={() => navigation.navigate('Login')}
            variant="secondary"
            disabled={loading}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  registerButton: {
    marginTop: 8,
    marginBottom: 16,
  },
});
