import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
  HStack,
  Text,
  Spinner,
  useColorModeValue,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { searchCustomersApi } from '../api/userApi';

export default function CustomerSearch({ onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const resultsBg = useColorModeValue('white', 'gray.700');
  const hoverBg = useColorModeValue('blue.50', 'blue.900');

  const search = useCallback(async (text) => {
    if (!text || text.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const users = await searchCustomersApi(text);
      setResults(users);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      search(query);
    }, 400);
    return () => clearTimeout(timer);
  }, [query, search]);

  const handleSelect = (customer) => {
    onSelect(customer);
    setQuery(customer.name || customer.userName || '');
    setShowResults(false);
  };

  return (
    <Box position="relative">
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="gray.400" />
        </InputLeftElement>
        <Input
          placeholder="Search customer by name or IC..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
        />
      </InputGroup>
      {showResults && (query.length >= 2) && (
        <Box
          position="absolute"
          top="100%"
          left={0}
          right={0}
          bg={resultsBg}
          shadow="lg"
          borderRadius="md"
          zIndex={10}
          maxH="250px"
          overflowY="auto"
          mt={1}
          border="1px solid"
          borderColor="gray.200"
        >
          {loading ? (
            <Box p={4} textAlign="center">
              <Spinner size="sm" />
            </Box>
          ) : results.length === 0 ? (
            <Box p={4} textAlign="center">
              <Text fontSize="sm" color="gray.500">
                No customers found
              </Text>
            </Box>
          ) : (
            <VStack align="stretch" spacing={0}>
              {results.map((customer) => (
                <HStack
                  key={customer.id}
                  p={3}
                  cursor="pointer"
                  _hover={{ bg: hoverBg }}
                  onClick={() => handleSelect(customer)}
                >
                  <Box>
                    <Text fontSize="sm" fontWeight="medium">
                      {customer.name || customer.userName}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {customer.email || customer.iCNoOrPassport || ''}
                    </Text>
                  </Box>
                </HStack>
              ))}
            </VStack>
          )}
        </Box>
      )}
    </Box>
  );
}
