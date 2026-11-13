import React from 'react';
import { Box, Heading, Text, Button, VStack, Icon } from '@chakra-ui/react';
import { FiInbox } from 'react-icons/fi';

export default function EmptyState({
  title = 'No items found',
  description = '',
  actionLabel,
  onAction,
  icon,
}) {
  return (
    <Box textAlign="center" py={16} px={6}>
      <VStack spacing={4}>
        <Icon as={icon || FiInbox} boxSize={16} color="gray.400" />
        <Heading size="md" color="gray.600">
          {title}
        </Heading>
        {description && (
          <Text color="gray.500" maxW="sm">
            {description}
          </Text>
        )}
        {actionLabel && onAction && (
          <Button colorScheme="blue" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </VStack>
    </Box>
  );
}
