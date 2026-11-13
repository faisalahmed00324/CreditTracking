import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { searchCustomersApi } from '../api/userApi';
import { colors } from '../constants/theme';

export default function CustomerSearchModal({ visible, onClose, onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) {
      setQuery('');
      setResults([]);
      return;
    }

    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const users = await searchCustomersApi(query.trim());
        setResults(users);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query, visible]);

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Select Customer</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by name or IC"
            placeholderTextColor="#94a3b8"
            style={styles.input}
          />

          {loading ? (
            <View style={styles.centerArea}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.list}>
              {results.map((customer) => (
                <Pressable
                  key={customer.id}
                  style={styles.row}
                  onPress={() => {
                    onSelect(customer);
                    onClose();
                  }}
                >
                  <Text style={styles.name}>{customer.name || customer.userName}</Text>
                  <Text style={styles.meta}>{customer.email || customer.iCNoOrPassport || '-'}</Text>
                </Pressable>
              ))}
              {!results.length && query.trim().length >= 2 ? (
                <Text style={styles.empty}>No customers found</Text>
              ) : null}
            </ScrollView>
          )}

          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeLabel}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    minHeight: '70%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    color: colors.text,
  },
  centerArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    gap: 10,
    paddingBottom: 8,
  },
  row: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  name: {
    fontWeight: '600',
    color: colors.text,
  },
  meta: {
    color: colors.textMuted,
    fontSize: 12,
  },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: 12,
  },
  closeButton: {
    borderWidth: 1,
    borderColor: colors.border,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeLabel: {
    color: colors.text,
    fontWeight: '600',
  },
});
