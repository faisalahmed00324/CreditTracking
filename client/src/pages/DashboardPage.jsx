import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  VStack,
  HStack,
  Button,
  Spinner,
  Center,
  useToast,
  Avatar,
  Badge,
  Icon,
} from '@chakra-ui/react';
import { FiPlusCircle, FiList, FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getCreditEntriesByShopApi,
  getCreditEntriesByCustomerApi,
} from '../api/creditEntryApi';

export default function DashboardPage() {
  const { user, isShop, isCustomer } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [stats, setStats] = useState({ total: 0, paid: 0, unpaid: 0, totalAmount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      let entries;
      if (isShop) {
        entries = await getCreditEntriesByShopApi(user.id, 1, 100);
      } else {
        entries = await getCreditEntriesByCustomerApi(user.id, 1, 100);
      }
      const paid = entries.filter((e) => e.isPaid);
      const unpaid = entries.filter((e) => !e.isPaid);
      const totalAmount = entries.reduce((sum, e) => sum + (e.amount || 0), 0);
      setStats({
        total: entries.length,
        paid: paid.length,
        unpaid: unpaid.length,
        totalAmount,
      });
    } catch {
      toast({
        title: 'Could not load dashboard data',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const formattedAmount = new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR',
  }).format(stats.totalAmount);

  if (loading) {
    return (
      <Center py={20}>
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  return (
    <Box>
      {/* Welcome */}
      <HStack spacing={4} mb={8}>
        <Avatar size="lg" name={user?.name || user?.userName} />
        <Box>
          <Heading size="md">Welcome, {user?.name || user?.userName}!</Heading>
          <HStack mt={1}>
            <Badge colorScheme={isShop ? 'purple' : 'blue'}>
              {isShop ? 'Shop' : 'Customer'}
            </Badge>
            {user?.email && (
              <Text fontSize="sm" color="gray.500">
                {user.email}
              </Text>
            )}
          </HStack>
        </Box>
      </HStack>

      {/* Stats */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4} mb={8}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Total Entries</StatLabel>
              <StatNumber>{stats.total}</StatNumber>
              <StatHelpText>All credit entries</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Unpaid</StatLabel>
              <StatNumber color="red.500">{stats.unpaid}</StatNumber>
              <StatHelpText>Pending payment</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Paid</StatLabel>
              <StatNumber color="green.500">{stats.paid}</StatNumber>
              <StatHelpText>Completed</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Total Amount</StatLabel>
              <StatNumber fontSize="xl">{formattedAmount}</StatNumber>
              <StatHelpText>All entries</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Quick Actions */}
      <Heading size="sm" mb={4}>
        Quick Actions
      </Heading>
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={4}>
        <Card
          cursor="pointer"
          _hover={{ shadow: 'md', borderColor: 'blue.200' }}
          onClick={() => navigate('/credit-entries')}
          borderWidth="1px"
        >
          <CardBody>
            <HStack spacing={3}>
              <Icon as={FiList} boxSize={6} color="blue.500" />
              <Box>
                <Text fontWeight="semibold">View Credit Entries</Text>
                <Text fontSize="sm" color="gray.500">
                  Browse all credit entries
                </Text>
              </Box>
            </HStack>
          </CardBody>
        </Card>

        {isShop && (
          <>
            <Card
              cursor="pointer"
              _hover={{ shadow: 'md', borderColor: 'green.200' }}
              onClick={() => navigate('/create-entry')}
              borderWidth="1px"
            >
              <CardBody>
                <HStack spacing={3}>
                  <Icon as={FiPlusCircle} boxSize={6} color="green.500" />
                  <Box>
                    <Text fontWeight="semibold">Create New Entry</Text>
                    <Text fontSize="sm" color="gray.500">
                      Add a credit entry for a customer
                    </Text>
                  </Box>
                </HStack>
              </CardBody>
            </Card>

            <Card
              cursor="pointer"
              _hover={{ shadow: 'md', borderColor: 'purple.200' }}
              onClick={() => navigate('/create-entry')}
              borderWidth="1px"
            >
              <CardBody>
                <HStack spacing={3}>
                  <Icon as={FiSearch} boxSize={6} color="purple.500" />
                  <Box>
                    <Text fontWeight="semibold">Search Customers</Text>
                    <Text fontSize="sm" color="gray.500">
                      Find customers and their entries
                    </Text>
                  </Box>
                </HStack>
              </CardBody>
            </Card>
          </>
        )}
      </SimpleGrid>
    </Box>
  );
}
