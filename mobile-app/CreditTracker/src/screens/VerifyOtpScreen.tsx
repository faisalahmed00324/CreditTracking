import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {Button, TextInput} from '../components';
import {useAuth} from '../context';
import {ApiError} from '../api';

type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  VerifyOtp: {userId: string};
};

type VerifyOtpScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'VerifyOtp'
>;

type VerifyOtpScreenRouteProp = RouteProp<AuthStackParamList, 'VerifyOtp'>;

interface VerifyOtpScreenProps {
  navigation: VerifyOtpScreenNavigationProp;
  route: VerifyOtpScreenRouteProp;
}

export const VerifyOtpScreen: React.FC<VerifyOtpScreenProps> = ({
  navigation,
  route,
}) => {
  const {verifyOtp} = useAuth();
  const {userId} = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    if (!otp.trim()) {
      setError('Please enter the OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const success = await verifyOtp(userId, otp.trim());
      if (success) {
        Alert.alert(
          'Verification Successful',
          'Your account has been verified. You can now login.',
          [{text: 'OK', onPress: () => navigation.navigate('Login')}],
        );
      } else {
        setError('Invalid or expired OTP. Please try again.');
      }
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Verification failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Verify Your Account</Text>
          <Text style={styles.subtitle}>
            Enter the OTP sent to your email to verify your account
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            label="OTP Code"
            placeholder="Enter OTP"
            value={otp}
            onChangeText={text => {
              setOtp(text);
              setError('');
            }}
            error={error}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
          />

          <Button
            title="Verify"
            onPress={handleVerify}
            loading={loading}
            disabled={loading}
            style={styles.verifyButton}
          />

          <Button
            title="Back to Login"
            onPress={() => navigation.navigate('Login')}
            variant="secondary"
            disabled={loading}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    width: '100%',
  },
  verifyButton: {
    marginTop: 8,
    marginBottom: 16,
  },
});
