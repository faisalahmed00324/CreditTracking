import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import PrimaryButton from './PrimaryButton';
import { colors } from '../constants/theme';
import { toInputDate } from '../utils/format';

export default function UpdatePaymentModal({ visible, onClose, onConfirm, loading }) {
  const [paymentDate, setPaymentDate] = useState(toInputDate());

  useEffect(() => {
    if (visible) {
      setPaymentDate(toInputDate());
    }
  }, [visible]);

  return (
    <Modal transparent visible={visible} onRequestClose={onClose} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Mark as Paid</Text>
          <Text style={styles.caption}>Payment Date (YYYY-MM-DD)</Text>
          <TextInput
            value={paymentDate}
            onChangeText={setPaymentDate}
            placeholder="2026-01-31"
            placeholderTextColor="#94a3b8"
            style={styles.input}
          />

          <View style={styles.actions}>
            <Pressable style={styles.cancel} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <View style={styles.confirmWrap}>
              <PrimaryButton
                label="Confirm"
                tone="success"
                loading={loading}
                onPress={() => onConfirm(paymentDate)}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  caption: {
    fontSize: 13,
    color: colors.textMuted,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 12,
    color: colors.text,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  cancel: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    color: colors.text,
    fontWeight: '600',
  },
  confirmWrap: {
    flex: 1,
  },
});
