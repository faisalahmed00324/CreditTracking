import { useState, useEffect } from 'react';
import {
  Box,
  Table,
  Heading,
  Badge,
  Stack,
  Card,
  Grid,
  Text,
} from '@chakra-ui/react';
import Layout from '../components/Layout';
import { creditEntryService } from '../services/creditEntryService';
import { useAuth } from '../contexts/AuthContext';
import { Toaster, toaster } from '../components/ui/toaster';

const CustomerDashboard = () => {
  const [creditEntries, setCreditEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchCreditEntries();
  }, []);

  const fetchCreditEntries = async () => {
    setLoading(true);
    try {
      const response = await creditEntryService.getCreditEntriesByCustomer(user.id);
      setCreditEntries(response.entries || []);
    } catch (error) {
      console.error('Error fetching credit entries:', error);
      toaster.create({
        title: 'Error',
        description: 'Failed to fetch credit entries',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const totalDebt = creditEntries
    .filter(e => !e.isPaid)
    .reduce((sum, e) => sum + e.amount, 0);

  const totalPaid = creditEntries
    .filter(e => e.isPaid)
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <Layout title="Customer Dashboard">
      <Stack gap={6}>
        {/* Summary Cards */}
        <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
          <Card.Root>
            <Card.Body>
              <Text fontSize="sm" color="gray.600">Total Entries</Text>
              <Heading size="xl">{creditEntries.length}</Heading>
            </Card.Body>
          </Card.Root>
          <Card.Root>
            <Card.Body>
              <Text fontSize="sm" color="gray.600">Outstanding Balance</Text>
              <Heading size="xl" color="red.500">
                ${totalDebt.toFixed(2)}
              </Heading>
            </Card.Body>
          </Card.Root>
          <Card.Root>
            <Card.Body>
              <Text fontSize="sm" color="gray.600">Total Paid</Text>
              <Heading size="xl" color="green.500">
                ${totalPaid.toFixed(2)}
              </Heading>
            </Card.Body>
          </Card.Root>
        </Grid>

        {/* Credit Entries Table */}
        <Card.Root>
          <Card.Body>
            <Heading size="md" mb={4}>My Credit Entries</Heading>
            <Box overflowX="auto">
              <Table.Root variant="outline">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>Shop</Table.ColumnHeader>
                    <Table.ColumnHeader>Item</Table.ColumnHeader>
                    <Table.ColumnHeader>Amount</Table.ColumnHeader>
                    <Table.ColumnHeader>Date</Table.ColumnHeader>
                    <Table.ColumnHeader>Status</Table.ColumnHeader>
                    <Table.ColumnHeader>Payment Date</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {creditEntries.map((entry) => (
                    <Table.Row key={entry.id}>
                      <Table.Cell>{entry.shopName}</Table.Cell>
                      <Table.Cell>{entry.item}</Table.Cell>
                      <Table.Cell>${entry.amount.toFixed(2)}</Table.Cell>
                      <Table.Cell>{new Date(entry.date).toLocaleDateString()}</Table.Cell>
                      <Table.Cell>
                        {entry.isPaid ? (
                          <Badge colorScheme="green">Paid</Badge>
                        ) : (
                          <Badge colorScheme="red">Unpaid</Badge>
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        {entry.paymentDate
                          ? new Date(entry.paymentDate).toLocaleDateString()
                          : '-'}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
              {creditEntries.length === 0 && (
                <Box textAlign="center" py={8}>
                  <Text color="gray.500">No credit entries found</Text>
                </Box>
              )}
            </Box>
          </Card.Body>
        </Card.Root>

        {/* Unpaid Entries */}
        {creditEntries.filter(e => !e.isPaid).length > 0 && (
          <Card.Root>
            <Card.Body>
              <Heading size="md" mb={4} color="red.500">
                Outstanding Payments
              </Heading>
              <Stack gap={3}>
                {creditEntries
                  .filter(e => !e.isPaid)
                  .map((entry) => (
                    <Box
                      key={entry.id}
                      p={4}
                      borderWidth={1}
                      borderRadius="md"
                      borderColor="red.200"
                      bg="red.50"
                    >
                      <Grid templateColumns={{ base: '1fr', md: '2fr 1fr 1fr' }} gap={4}>
                        <Box>
                          <Text fontWeight="bold">{entry.shopName}</Text>
                          <Text fontSize="sm" color="gray.600">{entry.item}</Text>
                        </Box>
                        <Box>
                          <Text fontSize="sm" color="gray.600">Date</Text>
                          <Text>{new Date(entry.date).toLocaleDateString()}</Text>
                        </Box>
                        <Box>
                          <Text fontSize="sm" color="gray.600">Amount</Text>
                          <Text fontSize="xl" fontWeight="bold" color="red.500">
                            ${entry.amount.toFixed(2)}
                          </Text>
                        </Box>
                      </Grid>
                    </Box>
                  ))}
              </Stack>
            </Card.Body>
          </Card.Root>
        )}
      </Stack>
      <Toaster />
    </Layout>
  );
};

export default CustomerDashboard;
