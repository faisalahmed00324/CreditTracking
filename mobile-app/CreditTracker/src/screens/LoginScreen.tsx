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
import {ApiError} from '../api';

type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  VerifyOtp: {userId: string};
};

type LoginScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Login'
>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({navigation}) => {
  const {login} = useAuth();
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{userName?: string; password?: string}>(
    {},
  );

  const validate = (): boolean => {
    const newErrors: {userName?: string; password?: string} = {};

    if (!userName.trim()) {
      newErrors.userName = 'Username is required';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      await login(userName.trim(), password);
      // Navigation will be handled by the auth state change
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Login failed. Please check your credentials.';
      Alert.alert('Login Failed', message);
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
          <Text style={styles.title}>Credit Tracker</Text>
          <Text style={styles.subtitle}>
            Track your credit entries with ease
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            label="Username"
            placeholder="Enter your username"
            value={userName}
            onChangeText={setUserName}
            error={errors.userName}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            secureTextEntry
          />

          <Button
            title="Login"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.loginButton}
          />

          <Button
            title="Create Account"
            onPress={() => navigation.navigate('Register')}
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
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
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
  loginButton: {
    marginTop: 8,
    marginBottom: 16,
  },
});
