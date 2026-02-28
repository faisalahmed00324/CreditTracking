import {
  Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Badge, Button,
  HStack, VStack, Text, Card, CardBody, IconButton, Tooltip,
  Skeleton, Select, Input, InputGroup, InputLeftElement,
  useToast
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon, ViewIcon, AddIcon, SearchIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  getCreditEntriesByShopApi, deleteCreditEntryApi, type CreditEntryDto
} from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useThemeColors } from '../../hooks/useThemeColors';
import { format } from 'date-fns';

export function ShopEntries() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const colors = useThemeColors();
  const toast = useToast();

  const [entries, setEntries] = useState<CreditEntryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [filterPaid, setFilterPaid] = useState('all');

  async function loadEntries(page = 0) {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await getCreditEntriesByShopApi(user.id, page, pageSize);
      const data = res.data?.creditEntries;
      setEntries(data?.data || []);
      setTotal(data?.count || 0);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadEntries(pageIndex); }, [pageIndex, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this entry?')) return;
    try {
      await deleteCreditEntryApi(id);
      toast({ title: 'Entry deleted', status: 'success', duration: 3000, isClosable: true });
      loadEntries(pageIndex);
    } catch {
      toast({ title: 'Delete failed', status: 'error', duration: 3000, isClosable: true });
    }
  }

  const filtered = entries.filter((e) => {
    const matchSearch = !search ||
      e.customerName.toLowerCase().includes(search.toLowerCase()) ||
      e.item.toLowerCase().includes(search.toLowerCase());
    const matchPaid = filterPaid === 'all' || (filterPaid === 'paid' ? e.isPaid : !e.isPaid);
    return matchSearch && matchPaid;
  });

  const totalPages = Math.ceil(total / pageSize);

  return (
    <VStack spacing={6} align="stretch">
      <HStack justify="space-between">
        <Heading size="lg" color={colors.textPrimary}>Credit Entries</Heading>
        <Button
          leftIcon={<AddIcon />}
          colorScheme="brand"
          onClick={() => navigate('/shop/entries/new')}
        >
          New Entry
        </Button>
      </HStack>

      <Card bg={colors.cardBg} shadow="sm">
        <CardBody>
          <HStack mb={4} spacing={3} flexWrap="wrap">
            <InputGroup maxW="280px">
              <InputLeftElement pointerEvents="none">
                <SearchIcon color={colors.textSecondary} />
              </InputLeftElement>
              <Input
                placeholder="Search customer or item..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                bg={colors.inputBg}
              />
            </InputGroup>
            <Select
              maxW="160px"
              value={filterPaid}
              onChange={(e) => setFilterPaid(e.target.value)}
              bg={colors.inputBg}
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </Select>
          </HStack>

          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead bg={colors.tableHeaderBg}>
                <Tr>
                  <Th color={colors.textSecondary}>Customer</Th>
                  <Th color={colors.textSecondary}>Item</Th>
                  <Th color={colors.textSecondary} isNumeric>Amount</Th>
                  <Th color={colors.textSecondary}>Date</Th>
                  <Th color={colors.textSecondary}>Status</Th>
                  <Th color={colors.textSecondary}>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <Tr key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <Td key={j}><Skeleton height="20px" /></Td>
                      ))}
                    </Tr>
                  ))
                ) : filtered.length === 0 ? (
                  <Tr>
                    <Td colSpan={6} textAlign="center" py={8} color={colors.textSecondary}>
                      No entries found
                    </Td>
                  </Tr>
                ) : (
                  filtered.map((entry) => (
                    <Tr
                      key={entry.id}
                      _hover={{ bg: colors.tableRowHover }}
                      cursor="pointer"
                    >
                      <Td color={colors.textPrimary} fontWeight="medium">{entry.customerName}</Td>
                      <Td color={colors.textPrimary}>{entry.item}</Td>
                      <Td isNumeric color={colors.textPrimary} fontWeight="semibold">
                        RM {entry.amount.toFixed(2)}
                      </Td>
                      <Td color={colors.textSecondary}>
                        {entry.date ? format(new Date(entry.date), 'dd MMM yyyy') : '-'}
                      </Td>
                      <Td>
                        <Badge
                          bg={entry.isPaid ? colors.badgePaidBg : colors.badgeUnpaidBg}
                          color={entry.isPaid ? colors.badgePaidColor : colors.badgeUnpaidColor}
                          borderRadius="full"
                          px={2}
                        >
                          {entry.isPaid ? 'Paid' : 'Unpaid'}
                        </Badge>
                      </Td>
                      <Td>
                        <HStack spacing={1}>
                          <Tooltip label="View">
                            <IconButton
                              aria-label="View"
                              icon={<ViewIcon />}
                              size="xs"
                              variant="ghost"
                              colorScheme="blue"
                              onClick={() => navigate(`/shop/entries/${entry.id}`)}
                            />
                          </Tooltip>
                          <Tooltip label="Edit">
                            <IconButton
                              aria-label="Edit"
                              icon={<EditIcon />}
                              size="xs"
                              variant="ghost"
                              colorScheme="orange"
                              onClick={() => navigate(`/shop/entries/${entry.id}/edit`)}
                            />
                          </Tooltip>
                          <Tooltip label="Delete">
                            <IconButton
                              aria-label="Delete"
                              icon={<DeleteIcon />}
                              size="xs"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => handleDelete(entry.id)}
                            />
                          </Tooltip>
                        </HStack>
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </Box>

          {totalPages > 1 && (
            <HStack mt={4} justify="center" spacing={2}>
              <Button
                size="sm"
                isDisabled={pageIndex === 0}
                onClick={() => setPageIndex((p) => p - 1)}
              >
                Previous
              </Button>
              <Text fontSize="sm" color={colors.textSecondary}>
                Page {pageIndex + 1} of {totalPages}
              </Text>
              <Button
                size="sm"
                isDisabled={pageIndex >= totalPages - 1}
                onClick={() => setPageIndex((p) => p + 1)}
              >
                Next
              </Button>
            </HStack>
          )}
        </CardBody>
      </Card>
    </VStack>
  );
}
