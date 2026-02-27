import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RootStackParamList } from '../../types';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { useColors, useSpacing, useTypography, useRadius } from '../../hooks/useTheme';
import Input from '../../components/Input';
import Button from '../../components/Button';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation }: Props) {
  const colors = useColors();
  const spacing = useSpacing();
  const typography = useTypography();
  const radius = useRadius();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ userName?: string; password?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!userName.trim()) e.userName = 'Username is required';
    if (!password.trim()) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await authService.login({ userName: userName.trim(), password });
      await login(res.token);
    } catch (err: any) {
      Alert.alert('Login Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar
        barStyle={colors.background === '#F9FAFB' ? 'dark-content' : 'light-content'}
        backgroundColor={colors.background}
      />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: spacing.lg }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo / Brand */}
        <View style={{ alignItems: 'center', marginBottom: spacing.xxl }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              backgroundColor: colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: spacing.md,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 10,
              elevation: 8,
            }}
          >
            <Ionicons name="card" size={40} color="#fff" />
          </View>
          <Text style={{ fontSize: typography.xxxl, fontWeight: '800', color: colors.text }}>
            CreditTracker
          </Text>
          <Text style={{ fontSize: typography.base, color: colors.textSecondary, marginTop: 6 }}>
            Sign in to your account
          </Text>
        </View>

        {/* Form */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: radius.xl,
            padding: spacing.lg,
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 1,
            shadowRadius: 12,
            elevation: 4,
          }}
        >
          <Input
            label="Username"
            placeholder="Enter your username"
            value={userName}
            onChangeText={setUserName}
            leftIcon="person-outline"
            autoCapitalize="none"
            error={errors.userName}
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            leftIcon="lock-closed-outline"
            isPassword
            error={errors.password}
          />

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            fullWidth
            size="lg"
            style={{ marginTop: spacing.sm }}
          />
        </View>

        {/* Register link */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl }}>
          <Text style={{ color: colors.textSecondary, fontSize: typography.base }}>
            Don't have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={{ color: colors.primary, fontWeight: '700', fontSize: typography.base }}>
              Register
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
