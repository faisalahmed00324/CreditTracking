import {
  Box, Heading, SimpleGrid, Card, CardBody, Stat, StatLabel, StatNumber,
  StatHelpText, Text, VStack, HStack, Icon, Skeleton, Button
} from '@chakra-ui/react';
import { MdCreditCard, MdPeople, MdTrendingUp, MdAddCircle } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getCreditEntriesByShopApi, getCurrentUserApi, type CreditEntryDto } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useThemeColors } from '../../hooks/useThemeColors';

export function ShopDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const colors = useThemeColors();
  const [entries, setEntries] = useState<CreditEntryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [shopName, setShopName] = useState('');

  useEffect(() => {
    async function load() {
      if (!user?.id) return;
      try {
        const [entriesRes, userRes] = await Promise.all([
          getCreditEntriesByShopApi(user.id, 0, 100),
          getCurrentUserApi(),
        ]);
        setEntries(entriesRes.data?.creditEntries?.data || []);
        setShopName(userRes.data?.user?.name || '');
      } catch {
        setEntries([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user?.id]);

  const totalAmount = entries.reduce((sum, e) => sum + e.amount, 0);
  const unpaidCount = entries.filter((e) => !e.isPaid).length;
  const paidCount = entries.filter((e) => e.isPaid).length;
  const uniqueCustomers = new Set(entries.map((e) => e.customerId)).size;

  const stats = [
    {
      label: 'Total Credit Entries',
      value: entries.length,
      icon: MdCreditCard,
      color: 'blue.500',
      helpText: 'All time',
    },
    {
      label: 'Total Amount',
      value: `RM ${totalAmount.toFixed(2)}`,
      icon: MdTrendingUp,
      color: 'green.500',
      helpText: 'Outstanding + paid',
    },
    {
      label: 'Unpaid Entries',
      value: unpaidCount,
      icon: MdCreditCard,
      color: 'red.500',
      helpText: `${paidCount} paid`,
    },
    {
      label: 'Unique Customers',
      value: uniqueCustomers,
      icon: MdPeople,
      color: 'purple.500',
      helpText: 'Active customers',
    },
  ];

  return (
    <VStack spacing={6} align="stretch">
      <HStack justify="space-between" align="center">
        <Box>
          <Heading size="lg" color={colors.textPrimary}>
            {loading ? 'Loading...' : `Welcome, ${shopName || 'Shop'}!`}
          </Heading>
          <Text color={colors.textSecondary} mt={1}>
            Here's an overview of your credit entries
          </Text>
        </Box>
        <Button
          leftIcon={<Icon as={MdAddCircle} />}
          colorScheme="brand"
          onClick={() => navigate('/shop/entries/new')}
        >
          New Entry
        </Button>
      </HStack>

      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4}>
        {stats.map((stat) => (
          <Card key={stat.label} bg={colors.cardBg} shadow="sm">
            <CardBody>
              <Skeleton isLoaded={!loading}>
                <HStack justify="space-between" mb={2}>
                  <Icon as={stat.icon} boxSize={6} color={stat.color} />
                </HStack>
                <Stat>
                  <StatLabel color={colors.textSecondary} fontSize="sm">{stat.label}</StatLabel>
                  <StatNumber color={colors.textPrimary} fontSize="2xl">{stat.value}</StatNumber>
                  <StatHelpText color={colors.textSecondary}>{stat.helpText}</StatHelpText>
                </Stat>
              </Skeleton>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      <Card bg={colors.cardBg} shadow="sm">
        <CardBody>
          <Heading size="sm" color={colors.textPrimary} mb={4}>Recent Entries</Heading>
          <Skeleton isLoaded={!loading}>
            {entries.slice(0, 5).length === 0 ? (
              <Text color={colors.textSecondary}>No entries yet. Create your first credit entry!</Text>
            ) : (
              <VStack spacing={2} align="stretch">
                {entries.slice(0, 5).map((entry) => (
                  <HStack
                    key={entry.id}
                    p={3}
                    borderRadius="md"
                    bg={colors.tableHeaderBg}
                    justify="space-between"
                    cursor="pointer"
                    _hover={{ bg: colors.tableRowHover }}
                    onClick={() => navigate(`/shop/entries/${entry.id}`)}
                  >
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="semibold" fontSize="sm" color={colors.textPrimary}>{entry.customerName}</Text>
                      <Text fontSize="xs" color={colors.textSecondary}>{entry.item}</Text>
                    </VStack>
                    <VStack align="end" spacing={0}>
                      <Text fontWeight="semibold" color={colors.textPrimary}>RM {entry.amount.toFixed(2)}</Text>
                      <Text
                        fontSize="xs"
                        color={entry.isPaid ? colors.badgePaidColor : colors.badgeUnpaidColor}
                        fontWeight="semibold"
                      >
                        {entry.isPaid ? 'PAID' : 'UNPAID'}
                      </Text>
                    </VStack>
                  </HStack>
                ))}
              </VStack>
            )}
          </Skeleton>
        </CardBody>
      </Card>
    </VStack>
  );
}
