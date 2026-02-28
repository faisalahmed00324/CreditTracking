import {
  Badge, Box, Button, Card, CardBody, Heading, HStack, SimpleGrid,
  Skeleton, Stack, Text, VStack, useToast
} from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getCreditEntryApi, deleteCreditEntryApi, type CreditEntryDto } from '../../lib/api';
import { useThemeColors } from '../../hooks/useThemeColors';
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';

export function CreditEntryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const colors = useThemeColors();
  const toast = useToast();
  const { isShop } = useAuth();
  const [entry, setEntry] = useState<CreditEntryDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getCreditEntryApi(id)
      .then((res) => setEntry(res.data?.creditEntry || null))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    if (!id || !window.confirm('Delete this entry?')) return;
    try {
      await deleteCreditEntryApi(id);
      toast({ title: 'Deleted', status: 'success', duration: 3000, isClosable: true });
      navigate(isShop ? '/shop/entries' : '/customer/entries');
    } catch {
      toast({ title: 'Delete failed', status: 'error', duration: 3000, isClosable: true });
    }
  }

  return (
    <VStack spacing={6} align="stretch">
      <HStack justify="space-between">
        <Heading size="lg" color={colors.textPrimary}>Credit Entry Detail</Heading>
        <HStack>
          {isShop && (
            <>
              <Button leftIcon={<EditIcon />} colorScheme="orange" variant="outline" onClick={() => navigate(`/shop/entries/${id}/edit`)}>
                Edit
              </Button>
              <Button leftIcon={<DeleteIcon />} colorScheme="red" variant="outline" onClick={handleDelete}>
                Delete
              </Button>
            </>
          )}
          <Button variant="ghost" onClick={() => navigate(isShop ? '/shop/entries' : '/customer/entries')}>
            Back
          </Button>
        </HStack>
      </HStack>

      <Card bg={colors.cardBg} shadow="sm">
        <CardBody>
          <Skeleton isLoaded={!loading}>
            {entry && (
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <Stack spacing={4}>
                  <Box>
                    <Text fontSize="xs" color={colors.textSecondary} fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">Shop</Text>
                    <Text fontSize="lg" color={colors.textPrimary} fontWeight="semibold">{entry.shopName}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color={colors.textSecondary} fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">Customer</Text>
                    <Text fontSize="lg" color={colors.textPrimary} fontWeight="semibold">{entry.customerName}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color={colors.textSecondary} fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">Item</Text>
                    <Text color={colors.textPrimary}>{entry.item}</Text>
                  </Box>
                </Stack>
                <Stack spacing={4}>
                  <Box>
                    <Text fontSize="xs" color={colors.textSecondary} fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">Amount</Text>
                    <Text fontSize="2xl" color={colors.textPrimary} fontWeight="bold">RM {entry.amount.toFixed(2)}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color={colors.textSecondary} fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">Entry Date</Text>
                    <Text color={colors.textPrimary}>{entry.date ? format(new Date(entry.date), 'dd MMMM yyyy') : '-'}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color={colors.textSecondary} fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">Status</Text>
                    <Badge
                      bg={entry.isPaid ? colors.badgePaidBg : colors.badgeUnpaidBg}
                      color={entry.isPaid ? colors.badgePaidColor : colors.badgeUnpaidColor}
                      borderRadius="full"
                      px={3}
                      py={1}
                      fontSize="sm"
                    >
                      {entry.isPaid ? '✓ Paid' : '✗ Unpaid'}
                    </Badge>
                  </Box>
                  {entry.paymentDate && (
                    <Box>
                      <Text fontSize="xs" color={colors.textSecondary} fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">Payment Date</Text>
                      <Text color={colors.textPrimary}>{format(new Date(entry.paymentDate), 'dd MMMM yyyy')}</Text>
                    </Box>
                  )}
                </Stack>
              </SimpleGrid>
            )}
          </Skeleton>
        </CardBody>
      </Card>
    </VStack>
  );
}
