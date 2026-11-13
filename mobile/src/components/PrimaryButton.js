import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../constants/theme';

export default function PrimaryButton({ label, onPress, disabled, loading, tone = 'primary' }) {
  const isDisabled = disabled || loading;
  const backgroundColor = tone === 'danger' ? colors.danger : tone === 'success' ? colors.success : colors.primary;

  return (
    <Pressable
      style={[styles.button, { backgroundColor }, isDisabled && styles.disabled]}
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.label}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  disabled: {
    opacity: 0.55,
  },
});
