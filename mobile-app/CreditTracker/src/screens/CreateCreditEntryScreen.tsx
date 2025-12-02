import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Button, TextInput} from '../components';
import {useAuth} from '../context';
import {creditEntryApi, userApi, ApiError} from '../api';
import {User} from '../types';

type MainStackParamList = {
  Home: undefined;
  CreditEntryDetail: {entryId: string};
  CreateCreditEntry: undefined;
  Profile: undefined;
};

type CreateCreditEntryScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'CreateCreditEntry'
>;

interface CreateCreditEntryScreenProps {
  navigation: CreateCreditEntryScreenNavigationProp;
}

interface FormErrors {
  customerId?: string;
  item?: string;
  amount?: string;
}

export const CreateCreditEntryScreen: React.FC<
  CreateCreditEntryScreenProps
> = ({navigation}) => {
  const {user} = useAuth();
  const [formData, setFormData] = useState({
    customerSearch: '',
    customerId: '',
    customerName: '',
    item: '',
    amount: '',
  });
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({...prev, [field]: value}));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({...prev, [field]: undefined}));
    }
  };

  const handleSearchCustomers = async () => {
    if (!formData.customerSearch.trim()) {
      return;
    }

    setSearching(true);
    try {
      const results = await userApi.searchCustomers(
        formData.customerSearch.trim(),
      );
      setCustomers(results);
      if (results.length === 0) {
        Alert.alert('No Results', 'No customers found matching your search');
      }
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Failed to search customers';
      Alert.alert('Error', message);
    } finally {
      setSearching(false);
    }
  };

  const selectCustomer = (customer: User) => {
    setFormData(prev => ({
      ...prev,
      customerId: customer.id,
      customerName: customer.name,
      customerSearch: customer.name,
    }));
    setCustomers([]);
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.customerId) {
      newErrors.customerId = 'Please select a customer';
    }
    if (!formData.item.trim()) {
      newErrors.item = 'Item description is required';
    }
    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (
      isNaN(parseFloat(formData.amount)) ||
      parseFloat(formData.amount) <= 0
    ) {
      newErrors.amount = 'Please enter a valid amount';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validate() || !user) {
      return;
    }

    setLoading(true);
    try {
      await creditEntryApi.create({
        shopId: user.id,
        customerId: formData.customerId,
        item: formData.item.trim(),
        amount: parseFloat(formData.amount),
        date: new Date().toISOString(),
        isPaid: false,
      });

      Alert.alert('Success', 'Credit entry created successfully', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Failed to create credit entry';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>New Credit Entry</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer</Text>

          <View style={styles.searchRow}>
            <View style={styles.searchInput}>
              <TextInput
                placeholder="Search customer by name..."
                value={formData.customerSearch}
                onChangeText={value => {
                  updateField('customerSearch', value);
                  if (formData.customerId) {
                    setFormData(prev => ({
                      ...prev,
                      customerId: '',
                      customerName: '',
                    }));
                  }
                }}
                error={errors.customerId}
              />
            </View>
            <Button
              title="Search"
              onPress={handleSearchCustomers}
              loading={searching}
              disabled={searching || !formData.customerSearch.trim()}
              style={styles.searchButton}
            />
          </View>

          {customers.length > 0 && (
            <View style={styles.customerList}>
              {customers.map(customer => (
                <Button
                  key={customer.id}
                  title={`${customer.name} (${customer.userName})`}
                  onPress={() => selectCustomer(customer)}
                  variant="secondary"
                  style={styles.customerItem}
                />
              ))}
            </View>
          )}

          {formData.customerId && (
            <View style={styles.selectedCustomer}>
              <Text style={styles.selectedLabel}>Selected:</Text>
              <Text style={styles.selectedValue}>{formData.customerName}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Entry Details</Text>

          <TextInput
            label="Item Description"
            placeholder="Enter item or service description"
            value={formData.item}
            onChangeText={value => updateField('item', value)}
            error={errors.item}
          />

          <TextInput
            label="Amount ($)"
            placeholder="0.00"
            value={formData.amount}
            onChangeText={value => updateField('amount', value)}
            error={errors.amount}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.actions}>
          <Button
            title="Create Entry"
            onPress={handleCreate}
            loading={loading}
            disabled={loading}
            style={styles.createButton}
          />

          <Button
            title="Cancel"
            onPress={() => navigation.goBack()}
            variant="secondary"
            disabled={loading}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 24,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  searchInput: {
    flex: 1,
    marginRight: 8,
  },
  searchButton: {
    marginTop: 0,
    minWidth: 80,
  },
  customerList: {
    marginTop: 12,
    gap: 8,
  },
  customerItem: {
    marginBottom: 0,
  },
  selectedCustomer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
  },
  selectedLabel: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
    marginRight: 8,
  },
  selectedValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  actions: {
    marginTop: 8,
    gap: 12,
  },
  createButton: {
    marginBottom: 0,
  },
});
