import {
  Box, Heading, SimpleGrid, Card, CardBody, Stat, StatLabel, StatNumber,
  StatHelpText, Text, VStack, HStack, Icon, Skeleton, Button, Badge
} from '@chakra-ui/react';
import { MdCreditCard, MdTrendingUp, MdCheckCircle } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getCreditEntriesByCustomerApi, getCurrentUserApi, type CreditEntryDto } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useThemeColors } from '../../hooks/useThemeColors';

export function CustomerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const colors = useThemeColors();
  const [entries, setEntries] = useState<CreditEntryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [customerName, setCustomerName] = useState('');

  useEffect(() => {
    async function load() {
      if (!user?.id) return;
      try {
        const [entriesRes, userRes] = await Promise.all([
          getCreditEntriesByCustomerApi(user.id, 0, 100),
          getCurrentUserApi(),
        ]);
        setEntries(entriesRes.data?.creditEntries?.data || []);
        setCustomerName(userRes.data?.user?.name || '');
      } catch {
        setEntries([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user?.id]);

  const totalAmount = entries.reduce((sum, e) => sum + e.amount, 0);
  const unpaidAmount = entries.filter((e) => !e.isPaid).reduce((sum, e) => sum + e.amount, 0);
  const paidAmount = entries.filter((e) => e.isPaid).reduce((sum, e) => sum + e.amount, 0);

  const stats = [
    {
      label: 'Total Credits',
      value: entries.length,
      icon: MdCreditCard,
      color: 'blue.500',
      helpText: 'All entries',
    },
    {
      label: 'Total Amount',
      value: `RM ${totalAmount.toFixed(2)}`,
      icon: MdTrendingUp,
      color: 'orange.500',
      helpText: 'All time',
    },
    {
      label: 'Outstanding',
      value: `RM ${unpaidAmount.toFixed(2)}`,
      icon: MdCreditCard,
      color: 'red.500',
      helpText: 'Unpaid balance',
    },
    {
      label: 'Paid',
      value: `RM ${paidAmount.toFixed(2)}`,
      icon: MdCheckCircle,
      color: 'green.500',
      helpText: 'Settled',
    },
  ];

  return (
    <VStack spacing={6} align="stretch">
      <HStack justify="space-between" align="center">
        <Box>
          <Heading size="lg" color={colors.textPrimary}>
            {loading ? 'Loading...' : `Hello, ${customerName || 'Customer'}!`}
          </Heading>
          <Text color={colors.textSecondary} mt={1}>
            Your credit summary
          </Text>
        </Box>
        <Button colorScheme="brand" onClick={() => navigate('/customer/entries')}>
          View All Credits
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
          <Heading size="sm" color={colors.textPrimary} mb={4}>Recent Credits</Heading>
          <Skeleton isLoaded={!loading}>
            {entries.slice(0, 5).length === 0 ? (
              <Text color={colors.textSecondary}>You have no credit entries yet.</Text>
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
                    onClick={() => navigate(`/customer/entries/${entry.id}`)}
                  >
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="semibold" fontSize="sm" color={colors.textPrimary}>{entry.shopName}</Text>
                      <Text fontSize="xs" color={colors.textSecondary}>{entry.item}</Text>
                    </VStack>
                    <VStack align="end" spacing={0}>
                      <Text fontWeight="semibold" color={colors.textPrimary}>RM {entry.amount.toFixed(2)}</Text>
                      <Badge
                        bg={entry.isPaid ? colors.badgePaidBg : colors.badgeUnpaidBg}
                        color={entry.isPaid ? colors.badgePaidColor : colors.badgeUnpaidColor}
                        borderRadius="full"
                        px={2}
                        fontSize="xs"
                      >
                        {entry.isPaid ? 'Paid' : 'Unpaid'}
                      </Badge>
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
