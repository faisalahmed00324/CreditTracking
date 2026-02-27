import {
  Box, Button, Card, CardBody, Heading, HStack, Input, InputGroup,
  InputLeftElement, Text, VStack, SimpleGrid, Badge, Skeleton, useToast
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { searchCustomersApi, type UserDto } from '../../lib/api';
import { useThemeColors } from '../../hooks/useThemeColors';

export function CustomerSearch() {
  const colors = useThemeColors();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [customers, setCustomers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch() {
    if (!searchText.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await searchCustomersApi(searchText);
      setCustomers(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      toast({
        title: 'Search failed',
        description: err.response?.data?.detail || 'Error searching',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <VStack spacing={6} align="stretch">
      <Heading size="lg" color={colors.textPrimary}>Customer Search</Heading>

      <Card bg={colors.cardBg} shadow="sm">
        <CardBody>
          <HStack>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color={colors.textSecondary} />
              </InputLeftElement>
              <Input
                placeholder="Search by name, IC, or email..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                bg={colors.inputBg}
              />
            </InputGroup>
            <Button
              colorScheme="brand"
              onClick={handleSearch}
              isLoading={loading}
              loadingText="Searching..."
              minW="100px"
            >
              Search
            </Button>
          </HStack>
        </CardBody>
      </Card>

      {searched && (
        <Card bg={colors.cardBg} shadow="sm">
          <CardBody>
            <Text color={colors.textSecondary} mb={4} fontSize="sm">
              {customers.length} result{customers.length !== 1 ? 's' : ''} found
            </Text>
            {loading ? (
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} height="80px" borderRadius="md" />
                ))}
              </SimpleGrid>
            ) : customers.length === 0 ? (
              <Text color={colors.textSecondary} textAlign="center" py={8}>
                No customers found. Try a different search term.
              </Text>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {customers.map((c) => (
                  <Box
                    key={c.id}
                    p={4}
                    border="1px"
                    borderColor={colors.borderColor}
                    borderRadius="lg"
                    bg={colors.cardBg}
                    _hover={{ borderColor: 'brand.400', shadow: 'md' }}
                    transition="all 0.2s"
                    cursor="pointer"
                    onClick={() => navigate(`/shop/entries/new`)}
                  >
                    <HStack justify="space-between" mb={2}>
                      <Text fontWeight="semibold" color={colors.textPrimary}>{c.name}</Text>
                      <Badge colorScheme="blue" fontSize="xs">Customer</Badge>
                    </HStack>
                    <Text fontSize="sm" color={colors.textSecondary}>{c.email}</Text>
                    <Text fontSize="sm" color={colors.textSecondary}>{c.iCNoOrPassport}</Text>
                    <Text fontSize="xs" color={colors.textSecondary} mt={1}>{c.address}</Text>
                  </Box>
                ))}
              </SimpleGrid>
            )}
          </CardBody>
        </Card>
      )}
    </VStack>
  );
}
