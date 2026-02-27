import {
  Button, Card, CardBody, FormControl, FormLabel, Heading, Input,
  Stack, Switch, Text, VStack, HStack, useToast, Skeleton
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getCreditEntryApi, updateCreditEntryApi, type CreditEntryDto } from '../../lib/api';
import { useThemeColors } from '../../hooks/useThemeColors';
import { format } from 'date-fns';

interface EditForm {
  isPaid: boolean;
  paymentDate: string;
}

export function EditCreditEntry() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const colors = useThemeColors();
  const { register, handleSubmit, setValue, watch } = useForm<EditForm>();
  const [entry, setEntry] = useState<CreditEntryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const isPaid = watch('isPaid');

  useEffect(() => {
    if (!id) return;
    getCreditEntryApi(id)
      .then((res) => {
        const e = res.data?.creditEntry;
        if (e) {
          setEntry(e);
          setValue('isPaid', e.isPaid);
          if (e.paymentDate) {
            setValue('paymentDate', format(new Date(e.paymentDate), 'yyyy-MM-dd'));
          }
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function onSubmit(data: EditForm) {
    if (!id) return;
    setSaving(true);
    try {
      await updateCreditEntryApi(
        id,
        data.isPaid,
        data.isPaid && data.paymentDate ? new Date(data.paymentDate).toISOString() : new Date().toISOString()
      );
      toast({ title: 'Entry updated', status: 'success', duration: 3000, isClosable: true });
      navigate('/shop/entries');
    } catch {
      toast({ title: 'Update failed', status: 'error', duration: 3000, isClosable: true });
    } finally {
      setSaving(false);
    }
  }

  return (
    <VStack spacing={6} align="stretch">
      <HStack justify="space-between">
        <Heading size="lg" color={colors.textPrimary}>Edit Credit Entry</Heading>
        <Button variant="ghost" onClick={() => navigate('/shop/entries')}>Cancel</Button>
      </HStack>

      <Card bg={colors.cardBg} shadow="sm">
        <CardBody>
          <Skeleton isLoaded={!loading}>
            {entry && (
              <Stack spacing={4} mb={4} p={4} bg={colors.tableHeaderBg} borderRadius="md">
                <Text color={colors.textPrimary}><strong>Customer:</strong> {entry.customerName}</Text>
                <Text color={colors.textPrimary}><strong>Item:</strong> {entry.item}</Text>
                <Text color={colors.textPrimary}><strong>Amount:</strong> RM {entry.amount.toFixed(2)}</Text>
                <Text color={colors.textPrimary}><strong>Date:</strong> {entry.date ? format(new Date(entry.date), 'dd MMM yyyy') : '-'}</Text>
              </Stack>
            )}
          </Skeleton>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={4}>
              <FormControl>
                <FormLabel color={colors.textPrimary}>Payment Status</FormLabel>
                <HStack>
                  <Switch {...register('isPaid')} colorScheme="green" />
                  <Text color={colors.textPrimary}>{isPaid ? 'Paid' : 'Unpaid'}</Text>
                </HStack>
              </FormControl>

              {isPaid && (
                <FormControl>
                  <FormLabel color={colors.textPrimary}>Payment Date</FormLabel>
                  <Input
                    {...register('paymentDate')}
                    type="date"
                    bg={colors.inputBg}
                  />
                </FormControl>
              )}

              <HStack justify="flex-end">
                <Button variant="ghost" onClick={() => navigate('/shop/entries')}>Cancel</Button>
                <Button type="submit" colorScheme="brand" isLoading={saving}>Save Changes</Button>
              </HStack>
            </Stack>
          </form>
        </CardBody>
      </Card>
    </VStack>
  );
}
