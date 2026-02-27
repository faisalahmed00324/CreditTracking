import {
  Box, Button, Card, CardBody, FormControl, FormErrorMessage,
  FormLabel, Heading, Input, Stack, Switch, Text, VStack, useToast,
  SimpleGrid, HStack
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { createCreditEntryApi, searchCustomersApi, type UserDto } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useThemeColors } from '../../hooks/useThemeColors';
import { SearchIcon } from '@chakra-ui/icons';
import { format } from 'date-fns';

interface CreateForm {
  customerId: string;
  item: string;
  amount: number;
  date: string;
  isPaid: boolean;
  paymentDate: string;
}

export function CreateCreditEntry() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const colors = useThemeColors();
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CreateForm>({
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      isPaid: false,
    }
  });

  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [customers, setCustomers] = useState<UserDto[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<UserDto | null>(null);
  const [searching, setSearching] = useState(false);
  const isPaid = watch('isPaid');

  async function handleSearch() {
    if (!searchText.trim()) return;
    setSearching(true);
    try {
      const res = await searchCustomersApi(searchText);
      setCustomers(Array.isArray(res.data) ? res.data : []);
    } catch {
      setCustomers([]);
    } finally {
      setSearching(false);
    }
  }

  function selectCustomer(c: UserDto) {
    setSelectedCustomer(c);
    setValue('customerId', c.id);
    setCustomers([]);
    setSearchText(c.name);
  }

  async function onSubmit(data: CreateForm) {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await createCreditEntryApi({
        shopId: user.id,
        customerId: data.customerId,
        item: data.item,
        amount: Number(data.amount),
        date: new Date(data.date).toISOString(),
        isPaid: data.isPaid,
        paymentDate: data.isPaid && data.paymentDate ? new Date(data.paymentDate).toISOString() : null,
      });
      toast({
        title: 'Entry created!',
        description: `Credit entry ID: ${res.data?.id}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/shop/entries');
    } catch (err: any) {
      toast({
        title: 'Failed',
        description: err.response?.data?.detail || 'Could not create entry',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <VStack spacing={6} align="stretch">
      <HStack justify="space-between">
        <Heading size="lg" color={colors.textPrimary}>New Credit Entry</Heading>
        <Button variant="ghost" onClick={() => navigate('/shop/entries')}>Cancel</Button>
      </HStack>

      <Card bg={colors.cardBg} shadow="sm">
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={5}>
              {/* Customer Search */}
              <FormControl isInvalid={!!errors.customerId}>
                <FormLabel color={colors.textPrimary}>Customer</FormLabel>
                <HStack>
                  <Input
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Search customer by name..."
                    bg={colors.inputBg}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearch(); } }}
                  />
                  <Button
                    leftIcon={<SearchIcon />}
                    onClick={handleSearch}
                    isLoading={searching}
                    colorScheme="brand"
                    variant="outline"
                  >
                    Search
                  </Button>
                </HStack>
                <input type="hidden" {...register('customerId', { required: 'Select a customer' })} />
                {customers.length > 0 && (
                  <Box
                    mt={2}
                    border="1px"
                    borderColor={colors.borderColor}
                    borderRadius="md"
                    bg={colors.cardBg}
                    shadow="md"
                    maxH="200px"
                    overflowY="auto"
                    zIndex={10}
                    position="relative"
                  >
                    {customers.map((c) => (
                      <Box
                        key={c.id}
                        px={3}
                        py={2}
                        cursor="pointer"
                        _hover={{ bg: colors.tableRowHover }}
                        onClick={() => selectCustomer(c)}
                      >
                        <Text fontWeight="medium" color={colors.textPrimary}>{c.name}</Text>
                        <Text fontSize="xs" color={colors.textSecondary}>{c.email} • {c.iCNoOrPassport}</Text>
                      </Box>
                    ))}
                  </Box>
                )}
                {selectedCustomer && (
                  <Text fontSize="sm" color="green.500" mt={1}>
                    ✓ Selected: {selectedCustomer.name}
                  </Text>
                )}
                <FormErrorMessage>{errors.customerId?.message}</FormErrorMessage>
              </FormControl>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl isInvalid={!!errors.item}>
                  <FormLabel color={colors.textPrimary}>Item / Description</FormLabel>
                  <Input
                    {...register('item', { required: 'Item is required' })}
                    placeholder="Item or service description"
                    bg={colors.inputBg}
                  />
                  <FormErrorMessage>{errors.item?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.amount}>
                  <FormLabel color={colors.textPrimary}>Amount (RM)</FormLabel>
                  <Input
                    {...register('amount', {
                      required: 'Amount is required',
                      min: { value: 0.01, message: 'Must be > 0' }
                    })}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    bg={colors.inputBg}
                  />
                  <FormErrorMessage>{errors.amount?.message}</FormErrorMessage>
                </FormControl>

                <FormControl>
                  <FormLabel color={colors.textPrimary}>Entry Date</FormLabel>
                  <Input {...register('date')} type="date" bg={colors.inputBg} />
                </FormControl>

                <FormControl>
                  <FormLabel color={colors.textPrimary}>Payment Status</FormLabel>
                  <HStack mt={1}>
                    <Switch {...register('isPaid')} colorScheme="green" />
                    <Text color={colors.textPrimary}>{isPaid ? 'Paid' : 'Unpaid'}</Text>
                  </HStack>
                </FormControl>

                {isPaid && (
                  <FormControl>
                    <FormLabel color={colors.textPrimary}>Payment Date</FormLabel>
                    <Input {...register('paymentDate')} type="date" bg={colors.inputBg} />
                  </FormControl>
                )}
              </SimpleGrid>

              <HStack justify="flex-end" pt={2}>
                <Button variant="ghost" onClick={() => navigate('/shop/entries')}>Cancel</Button>
                <Button
                  type="submit"
                  colorScheme="brand"
                  isLoading={loading}
                  loadingText="Creating..."
                >
                  Create Entry
                </Button>
              </HStack>
            </Stack>
          </form>
        </CardBody>
      </Card>
    </VStack>
  );
}
