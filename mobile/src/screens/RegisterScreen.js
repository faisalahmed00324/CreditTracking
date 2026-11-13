import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import FormField from '../components/FormField';
import PrimaryButton from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { colors, shadows } from '../constants/theme';

export default function RegisterScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [registeredId, setRegisteredId] = useState(null);
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState({});
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

  const { register, verifyOtp, loading } = useAuth();

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateRegistration = () => {
    const next = {};
    if (!formData.userName.trim()) next.userName = 'Username is required';
    if (!formData.name.trim()) next.name = 'Full name is required';
    if (!formData.email.trim()) next.email = 'Email is required';
    if (!formData.iCNoOrPassport.trim()) next.iCNoOrPassport = 'IC/Passport is required';
    if (!formData.password) next.password = 'Password is required';
    if (formData.password.length < 6) next.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) next.confirmPassword = 'Passwords do not match';
    if (!formData.address.trim()) next.address = 'Address is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleRegister = async () => {
    if (!validateRegistration()) return;

    try {
      const { confirmPassword, ...payload } = formData;
      const data = await register({
        ...payload,
        latitude: payload.latitude?.trim() || '',
        longitude: payload.longitude?.trim() || '',
      });

      setRegisteredId(data?.id || data);
      setStep(2);
      Alert.alert('Registration submitted', 'Please check your email for the OTP code.');
    } catch (error) {
      Alert.alert('Registration failed', error?.response?.data?.message || error?.response?.data || 'Please try again.');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) {
      setErrors({ otp: 'Please enter your OTP code' });
      return;
    }

    try {
      await verifyOtp(registeredId, otp);
      Alert.alert('Verification successful', 'You can now log in.');
      navigation.replace('Login');
    } catch (error) {
      Alert.alert('Verification failed', error?.response?.data?.message || error?.response?.data || 'Invalid OTP code.');
    }
  };

  return (
    <ScreenContainer scroll>
      <View style={styles.card}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>{step === 1 ? 'Step 1 of 2: Registration' : 'Step 2 of 2: Verify OTP'}</Text>

        {step === 1 ? (
          <>
            <FormField label="Username" value={formData.userName} onChangeText={(v) => updateField('userName', v)} error={errors.userName} placeholder="Choose a username" />
            <FormField label="Full Name" value={formData.name} onChangeText={(v) => updateField('name', v)} error={errors.name} placeholder="Enter your full name" autoCapitalize="words" />
            <FormField label="Email" value={formData.email} onChangeText={(v) => updateField('email', v)} error={errors.email} placeholder="name@email.com" keyboardType="email-address" />
            <FormField label="IC No / Passport" value={formData.iCNoOrPassport} onChangeText={(v) => updateField('iCNoOrPassport', v)} error={errors.iCNoOrPassport} placeholder="Identity document" />
            <FormField label="Password" value={formData.password} onChangeText={(v) => updateField('password', v)} error={errors.password} placeholder="At least 6 characters" secureTextEntry />
            <FormField label="Confirm Password" value={formData.confirmPassword} onChangeText={(v) => updateField('confirmPassword', v)} error={errors.confirmPassword} placeholder="Re-enter password" secureTextEntry />
            <FormField label="Address" value={formData.address} onChangeText={(v) => updateField('address', v)} error={errors.address} placeholder="Enter your address" autoCapitalize="words" />
            <FormField label="Latitude (optional)" value={formData.latitude} onChangeText={(v) => updateField('latitude', v)} placeholder="0.0" keyboardType="decimal-pad" />
            <FormField label="Longitude (optional)" value={formData.longitude} onChangeText={(v) => updateField('longitude', v)} placeholder="0.0" keyboardType="decimal-pad" />

            <PrimaryButton label="Register" onPress={handleRegister} loading={loading} />
          </>
        ) : (
          <>
            <Text style={styles.infoBox}>An OTP has been sent to your email. Enter it below to verify your account.</Text>
            <FormField
              label="OTP Code"
              value={otp}
              onChangeText={(value) => {
                setOtp(value);
                setErrors((prev) => ({ ...prev, otp: undefined }));
              }}
              error={errors.otp}
              placeholder="Enter 6-digit OTP"
              keyboardType="number-pad"
            />
            <PrimaryButton label="Verify OTP" tone="success" onPress={handleVerifyOtp} loading={loading} />
          </>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 18,
    gap: 10,
    ...shadows.card,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
  },
  subtitle: {
    color: colors.textMuted,
    marginBottom: 8,
  },
  infoBox: {
    borderWidth: 1,
    borderColor: '#bae6fd',
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    padding: 10,
    borderRadius: 10,
  },
});
