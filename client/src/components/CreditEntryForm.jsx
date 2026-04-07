import React, { useState } from 'react';
import {
  VStack,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  Box,
  Text,
} from '@chakra-ui/react';
import CustomerSearch from './CustomerSearch';

export default function CreditEntryForm({ shopId, onSubmit, loading }) {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [item, setItem] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!selectedCustomer) newErrors.customer = 'Please select a customer';
    if (!item.trim()) newErrors.item = 'Item is required';
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0)
      newErrors.amount = 'Valid amount is required';
    if (!date) newErrors.date = 'Date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      shopId,
      customerId: selectedCustomer.id,
      item: item.trim(),
      amount: Number(amount),
      date: new Date(date).toISOString(),
      isPaid: false,
      paymentDate: null,
    });
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <VStack spacing={4} align="stretch">
        <FormControl isInvalid={!!errors.customer}>
          <FormLabel>Customer</FormLabel>
          <CustomerSearch
            onSelect={(customer) => {
              setSelectedCustomer(customer);
              setErrors((prev) => ({ ...prev, customer: undefined }));
            }}
          />
          {selectedCustomer && (
            <Text fontSize="sm" color="green.600" mt={1}>
              Selected: {selectedCustomer.name || selectedCustomer.userName}
            </Text>
          )}
          <FormErrorMessage>{errors.customer}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.item}>
          <FormLabel>Item</FormLabel>
          <Input
            placeholder="e.g. Groceries, Fuel"
            value={item}
            onChange={(e) => setItem(e.target.value)}
          />
          <FormErrorMessage>{errors.item}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.amount}>
          <FormLabel>Amount</FormLabel>
          <InputGroup>
            <InputLeftElement pointerEvents="none" color="gray.500">
              RM
            </InputLeftElement>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              pl="12"
            />
          </InputGroup>
          <FormErrorMessage>{errors.amount}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.date}>
          <FormLabel>Date</FormLabel>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <FormErrorMessage>{errors.date}</FormErrorMessage>
        </FormControl>

        <Button type="submit" colorScheme="blue" isLoading={loading} size="lg" mt={2}>
          Create Credit Entry
        </Button>
      </VStack>
    </Box>
  );
}
