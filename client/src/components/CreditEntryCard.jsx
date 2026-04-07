import React from 'react';
import {
  Box,
  Badge,
  Text,
  HStack,
  VStack,
  IconButton,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { FiEdit2 } from 'react-icons/fi';
import { Icon } from '@chakra-ui/react';

export default function CreditEntryCard({ entry, isShop, onUpdate, onDelete }) {
  const cardBg = useColorModeValue('white', 'gray.700');

  const formattedAmount = new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR',
  }).format(entry.amount || 0);

  const formattedDate = entry.date
    ? new Date(entry.date).toLocaleDateString()
    : '-';

  const formattedPaymentDate = entry.paymentDate
    ? new Date(entry.paymentDate).toLocaleDateString()
    : '-';

  const isPaid = entry.isPaid;

  return (
    <Card bg={cardBg} shadow="sm" _hover={{ shadow: 'md' }} transition="all 0.2s">
      <CardHeader pb={2}>
        <HStack justify="space-between" align="start">
          <VStack align="start" spacing={1}>
            <Heading size="sm">{entry.item || 'Untitled Item'}</Heading>
            <Text fontSize="xs" color="gray.500">
              {isShop
                ? `Customer: ${entry.customerName || entry.customerId || '-'}`
                : `Shop: ${entry.shopName || entry.shopId || '-'}`}
            </Text>
          </VStack>
          <Badge
            colorScheme={isPaid ? 'green' : 'red'}
            variant="subtle"
            fontSize="xs"
            px={2}
            py={1}
            borderRadius="full"
          >
            {isPaid ? 'Paid' : 'Unpaid'}
          </Badge>
        </HStack>
      </CardHeader>
      <Divider />
      <CardBody pt={3}>
        <VStack align="stretch" spacing={2}>
          <HStack justify="space-between">
            <Text fontSize="sm" color="gray.500">
              Amount
            </Text>
            <Text fontSize="sm" fontWeight="bold" color="blue.600">
              {formattedAmount}
            </Text>
          </HStack>
          <HStack justify="space-between">
            <Text fontSize="sm" color="gray.500">
              Date
            </Text>
            <Text fontSize="sm">{formattedDate}</Text>
          </HStack>
          {isPaid && (
            <HStack justify="space-between">
              <Text fontSize="sm" color="gray.500">
                Payment Date
              </Text>
              <Text fontSize="sm" color="green.600">
                {formattedPaymentDate}
              </Text>
            </HStack>
          )}
          {isShop && (
            <>
              <Divider />
              <HStack justify="flex-end" spacing={2} pt={1}>
                {!isPaid && (
                  <IconButton
                    icon={<Icon as={FiEdit2} />}
                    size="sm"
                    variant="ghost"
                    colorScheme="blue"
                    aria-label="Mark as paid"
                    onClick={() => onUpdate && onUpdate(entry)}
                  />
                )}
                <IconButton
                  icon={<DeleteIcon />}
                  size="sm"
                  variant="ghost"
                  colorScheme="red"
                  aria-label="Delete entry"
                  onClick={() => onDelete && onDelete(entry)}
                />
              </HStack>
            </>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
}
