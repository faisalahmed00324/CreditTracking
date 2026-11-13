import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, shadows } from '../constants/theme';

export default function StatCard({ label, value, accent }) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, accent && { color: accent }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  label: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 8,
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
});
