import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList } from '../../types';
import { authService } from '../../services/authService';
import { useColors, useSpacing, useTypography, useRadius } from '../../hooks/useTheme';
import Button from '../../components/Button';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'VerifyOtp'>;
  route: RouteProp<RootStackParamList, 'VerifyOtp'>;
};

export default function VerifyOtpScreen({ navigation, route }: Props) {
  const { userId } = route.params;
  const colors = useColors();
  const spacing = useSpacing();
  const typography = useTypography();
  const radius = useRadius();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputs = useRef<Array<TextInput | null>>([]);

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text.replace(/\D/g, '');
    setOtp(newOtp);
    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter the 6-digit OTP code.');
      return;
    }
    setLoading(true);
    try {
      const res = await authService.verifyOtp({ id: userId, otp: code });
      if (res.isSuccess) {
        Alert.alert('Verified!', 'Your account has been verified. Please log in.', [
          { text: 'Login', onPress: () => navigation.navigate('Login') },
        ]);
      } else {
        Alert.alert('Verification Failed', 'Invalid or expired OTP. Please try again.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={{ flex: 1, padding: spacing.lg, justifyContent: 'center' }}>
        {/* Back */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginBottom: spacing.xl, padding: 4, alignSelf: 'flex-start' }}
        >
          <Text style={{ color: colors.primary, fontSize: typography.base, fontWeight: '600' }}>
            ← Back
          </Text>
        </TouchableOpacity>

        {/* Icon */}
        <View style={{ alignItems: 'center', marginBottom: spacing.xl }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: colors.infoBackground,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="shield-checkmark-outline" size={40} color={colors.info} />
          </View>
          <Text style={{ fontSize: typography.xxl, fontWeight: '800', color: colors.text, marginTop: spacing.md }}>
            Verify OTP
          </Text>
          <Text
            style={{
              fontSize: typography.base,
              color: colors.textSecondary,
              textAlign: 'center',
              marginTop: spacing.sm,
              lineHeight: 22,
            }}
          >
            Enter the 6-digit code sent to your registered contact
          </Text>
        </View>

        {/* OTP Boxes */}
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
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xl }}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => { inputs.current[index] = ref; }}
                value={digit}
                onChangeText={(text) => handleChange(text, index)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                keyboardType="number-pad"
                maxLength={1}
                style={{
                  width: 46,
                  height: 56,
                  borderWidth: 2,
                  borderColor: digit ? colors.primary : colors.inputBorder,
                  borderRadius: radius.md,
                  textAlign: 'center',
                  fontSize: typography.xl,
                  fontWeight: '700',
                  color: colors.text,
                  backgroundColor: colors.inputBackground,
                }}
              />
            ))}
          </View>

          <Button
            title="Verify OTP"
            onPress={handleVerify}
            loading={loading}
            fullWidth
            size="lg"
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
