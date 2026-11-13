import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import FormField from '../components/FormField';
import PrimaryButton from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { colors, shadows } from '../constants/theme';

export default function LoginScreen({ navigation }) {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const { login, loading } = useAuth();

  const validate = () => {
    const next = {};
    if (!userName.trim()) next.userName = 'Username is required';
    if (!password.trim()) next.password = 'Password is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      await login(userName.trim(), password);
    } catch (error) {
      Alert.alert('Login failed', error?.response?.data?.message || error?.response?.data || 'Invalid credentials.');
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.centerWrap}>
        <View style={styles.card}>
          <Text style={styles.title}>CreditTracker</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>

          <FormField
            label="Username"
            value={userName}
            onChangeText={setUserName}
            placeholder="Enter your username"
            error={errors.userName}
          />
          <FormField
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
            error={errors.password}
          />

          <PrimaryButton label="Sign In" onPress={handleSubmit} loading={loading} />

          <Pressable onPress={() => navigation.navigate('Register')}>
            <Text style={styles.link}>No account yet? Register here</Text>
          </Pressable>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centerWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 18,
    gap: 12,
    ...shadows.card,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.primary,
  },
  subtitle: {
    color: colors.textMuted,
    marginBottom: 4,
  },
  link: {
    textAlign: 'center',
    color: colors.primary,
    fontWeight: '600',
  },
});
