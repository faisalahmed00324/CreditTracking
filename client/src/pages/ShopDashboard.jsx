import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Table,
  Heading,
  Badge,
  HStack,
  IconButton,
  Input,
  Stack,
  Card,
  Field,
  Grid,
  Text,
} from '@chakra-ui/react';
import Layout from '../components/Layout';
import { creditEntryService } from '../services/creditEntryService';
import { authService } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import { Toaster, toaster } from '../components/ui/toaster';

const ShopDashboard = () => {
  const [creditEntries, setCreditEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    customerId: '',
    item: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    isPaid: false,
    paymentDate: null,
  });

  useEffect(() => {
    fetchCreditEntries();
  }, []);

  const fetchCreditEntries = async () => {
    setLoading(true);
    try {
      const response = await creditEntryService.getCreditEntriesByShop(user.id);
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

  const searchCustomers = async () => {
    if (!searchTerm) return;
    
    try {
      const response = await authService.searchCustomers(searchTerm);
      setCustomers(response.customers || []);
    } catch (error) {
      console.error('Error searching customers:', error);
      toaster.create({
        title: 'Error',
        description: 'Failed to search customers',
        type: 'error',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const entryData = {
        shopId: user.id,
        customerId: formData.customerId,
        item: formData.item,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date).toISOString(),
        isPaid: formData.isPaid,
        paymentDate: formData.paymentDate ? new Date(formData.paymentDate).toISOString() : null,
      };

      await creditEntryService.createCreditEntry(entryData);
      
      toaster.create({
        title: 'Success',
        description: 'Credit entry created successfully',
        type: 'success',
      });

      setShowForm(false);
      setFormData({
        customerId: '',
        item: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        isPaid: false,
        paymentDate: null,
      });
      fetchCreditEntries();
    } catch (error) {
      console.error('Error creating credit entry:', error);
      toaster.create({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create credit entry',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (entryId) => {
    try {
      const entry = creditEntries.find(e => e.id === entryId);
      await creditEntryService.updateCreditEntry(entryId, {
        ...entry,
        isPaid: true,
        paymentDate: new Date().toISOString(),
      });

      toaster.create({
        title: 'Success',
        description: 'Credit entry marked as paid',
        type: 'success',
      });

      fetchCreditEntries();
    } catch (error) {
      console.error('Error updating credit entry:', error);
      toaster.create({
        title: 'Error',
        description: 'Failed to update credit entry',
        type: 'error',
      });
    }
  };

  const handleDelete = async (entryId) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;

    try {
      await creditEntryService.deleteCreditEntry(entryId);
      
      toaster.create({
        title: 'Success',
        description: 'Credit entry deleted successfully',
        type: 'success',
      });

      fetchCreditEntries();
    } catch (error) {
      console.error('Error deleting credit entry:', error);
      toaster.create({
        title: 'Error',
        description: 'Failed to delete credit entry',
        type: 'error',
      });
    }
  };

  return (
    <Layout title="Shop Dashboard">
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
              <Text fontSize="sm" color="gray.600">Unpaid</Text>
              <Heading size="xl" color="red.500">
                {creditEntries.filter(e => !e.isPaid).length}
              </Heading>
            </Card.Body>
          </Card.Root>
          <Card.Root>
            <Card.Body>
              <Text fontSize="sm" color="gray.600">Total Amount Due</Text>
              <Heading size="xl" color="red.500">
                ${creditEntries.filter(e => !e.isPaid).reduce((sum, e) => sum + e.amount, 0).toFixed(2)}
              </Heading>
            </Card.Body>
          </Card.Root>
        </Grid>

        {/* Action Button */}
        <Box>
          <Button colorScheme="blue" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Add Credit Entry'}
          </Button>
        </Box>

        {/* Credit Entry Form */}
        {showForm && (
          <Card.Root>
            <Card.Body>
              <form onSubmit={handleSubmit}>
                <Stack gap={4}>
                  <Heading size="md">New Credit Entry</Heading>

                  {/* Customer Search */}
                  <Field.Root>
                    <Field.Label>Search Customer</Field.Label>
                    <HStack>
                      <Input
                        placeholder="Search by name or IC"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <Button onClick={searchCustomers}>Search</Button>
                    </HStack>
                  </Field.Root>

                  {customers.length > 0 && (
                    <Box>
                      <Text fontSize="sm" mb={2}>Select a customer:</Text>
                      <Stack gap={2}>
                        {customers.map((customer) => (
                          <Button
                            key={customer.id}
                            variant={formData.customerId === customer.id ? 'solid' : 'outline'}
                            onClick={() => setFormData({ ...formData, customerId: customer.id })}
                          >
                            {customer.name} - {customer.icNoOrPassport}
                          </Button>
                        ))}
                      </Stack>
                    </Box>
                  )}

                  <Field.Root required>
                    <Field.Label>Item/Description</Field.Label>
                    <Input
                      value={formData.item}
                      onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                      placeholder="What was purchased?"
                    />
                  </Field.Root>

                  <Field.Root required>
                    <Field.Label>Amount</Field.Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0.00"
                    />
                  </Field.Root>

                  <Field.Root required>
                    <Field.Label>Date</Field.Label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </Field.Root>

                  <Button type="submit" colorScheme="blue" loading={loading}>
                    Create Entry
                  </Button>
                </Stack>
              </form>
            </Card.Body>
          </Card.Root>
        )}

        {/* Credit Entries Table */}
        <Card.Root>
          <Card.Body>
            <Heading size="md" mb={4}>Credit Entries</Heading>
            <Box overflowX="auto">
              <Table.Root variant="outline">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>Customer</Table.ColumnHeader>
                    <Table.ColumnHeader>Item</Table.ColumnHeader>
                    <Table.ColumnHeader>Amount</Table.ColumnHeader>
                    <Table.ColumnHeader>Date</Table.ColumnHeader>
                    <Table.ColumnHeader>Status</Table.ColumnHeader>
                    <Table.ColumnHeader>Actions</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {creditEntries.map((entry) => (
                    <Table.Row key={entry.id}>
                      <Table.Cell>{entry.customerName}</Table.Cell>
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
                        <HStack gap={2}>
                          {!entry.isPaid && (
                            <Button
                              size="sm"
                              colorScheme="green"
                              onClick={() => handleMarkAsPaid(entry.id)}
                            >
                              Mark Paid
                            </Button>
                          )}
                          <Button
                            size="sm"
                            colorScheme="red"
                            onClick={() => handleDelete(entry.id)}
                          >
                            Delete
                          </Button>
                        </HStack>
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
      </Stack>
      <Toaster />
    </Layout>
  );
};

export default ShopDashboard;
