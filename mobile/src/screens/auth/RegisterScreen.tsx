import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList, UserRole } from '../../types';
import { authService } from '../../services/authService';
import { useColors, useSpacing, useTypography, useRadius } from '../../hooks/useTheme';
import Input from '../../components/Input';
import Button from '../../components/Button';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Register'>;
};

type FormData = {
  name: string;
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
  icNoOrPassport: string;
  address: string;
};

type FormErrors = Partial<FormData>;

export default function RegisterScreen({ navigation }: Props) {
  const colors = useColors();
  const spacing = useSpacing();
  const typography = useTypography();
  const radius = useRadius();

  const [form, setForm] = useState<FormData>({
    name: '',
    userName: '',
    email: '',
    password: '',
    confirmPassword: '',
    icNoOrPassport: '',
    address: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const set = (field: keyof FormData) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const validate = () => {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.userName.trim()) e.userName = 'Username is required';
    if (!form.icNoOrPassport.trim()) e.icNoOrPassport = 'IC / Passport is required';
    if (!form.password.trim()) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Minimum 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await authService.register({
        name: form.name.trim(),
        userName: form.userName.trim(),
        email: form.email.trim(),
        password: form.password,
        icNoOrPassport: form.icNoOrPassport.trim(),
        address: form.address.trim(),
        role: UserRole.Customer,
      });
      Alert.alert(
        'Registration Successful',
        'Please check your email/SMS for the OTP verification code.',
        [{ text: 'Verify Now', onPress: () => navigation.navigate('VerifyOtp', { userId: res.id }) }]
      );
    } catch (err: any) {
      Alert.alert('Registration Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.xxl }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginBottom: spacing.lg, padding: 4, alignSelf: 'flex-start' }}
        >
          <Text style={{ color: colors.primary, fontSize: typography.base, fontWeight: '600' }}>
            ← Back to Login
          </Text>
        </TouchableOpacity>

        <Text style={{ fontSize: typography.xxxl, fontWeight: '800', color: colors.text, marginBottom: 8 }}>
          Create Account
        </Text>
        <Text style={{ fontSize: typography.base, color: colors.textSecondary, marginBottom: spacing.xl }}>
          Register as a customer to track your credits
        </Text>

        {/* Form Card */}
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
            label="Full Name *"
            placeholder="Enter your full name"
            value={form.name}
            onChangeText={set('name')}
            leftIcon="person-outline"
            error={errors.name}
          />

          <Input
            label="Username *"
            placeholder="Choose a username"
            value={form.userName}
            onChangeText={set('userName')}
            leftIcon="at-outline"
            autoCapitalize="none"
            error={errors.userName}
          />

          <Input
            label="Email"
            placeholder="Enter your email (optional)"
            value={form.email}
            onChangeText={set('email')}
            leftIcon="mail-outline"
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Input
            label="IC No / Passport *"
            placeholder="Enter IC number or passport"
            value={form.icNoOrPassport}
            onChangeText={set('icNoOrPassport')}
            leftIcon="id-card-outline"
            error={errors.icNoOrPassport}
          />

          <Input
            label="Address"
            placeholder="Enter your address"
            value={form.address}
            onChangeText={set('address')}
            leftIcon="location-outline"
            multiline
            numberOfLines={2}
          />

          <Input
            label="Password *"
            placeholder="Create a password (min 6 chars)"
            value={form.password}
            onChangeText={set('password')}
            leftIcon="lock-closed-outline"
            isPassword
            error={errors.password}
          />

          <Input
            label="Confirm Password *"
            placeholder="Repeat your password"
            value={form.confirmPassword}
            onChangeText={set('confirmPassword')}
            leftIcon="lock-closed-outline"
            isPassword
            error={errors.confirmPassword}
          />

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
            fullWidth
            size="lg"
            style={{ marginTop: spacing.sm }}
          />
        </View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
