import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  Spinner,
  Center,
  HStack,
  Button,
  Text,
  useToast,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { useAuth } from '../context/AuthContext';
import {
  getCreditEntriesByShopApi,
  getCreditEntriesByCustomerApi,
  deleteCreditEntryApi,
} from '../api/creditEntryApi';
import CreditEntryCard from '../components/CreditEntryCard';
import UpdatePaymentModal from '../components/UpdatePaymentModal';
import EmptyState from '../components/EmptyState';
import { useNavigate } from 'react-router-dom';

const PAGE_SIZE = 10;

export default function CreditEntriesPage() {
  const { user, isShop } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Update payment modal
  const { isOpen: isUpdateOpen, onOpen: onUpdateOpen, onClose: onUpdateClose } = useDisclosure();
  const [selectedEntry, setSelectedEntry] = useState(null);

  // Delete confirmation
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [deleteEntry, setDeleteEntry] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const cancelRef = React.useRef();

  const loadEntries = useCallback(async () => {
    setLoading(true);
    try {
      let items;
      if (isShop) {
        items = await getCreditEntriesByShopApi(user.id, page, PAGE_SIZE);
      } else {
        items = await getCreditEntriesByCustomerApi(user.id, page, PAGE_SIZE);
      }
      setEntries(items);
      setHasMore(items.length === PAGE_SIZE);
    } catch (err) {
      toast({
        title: 'Failed to load entries',
        description: err.response?.data?.message || 'Please try again.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [isShop, user, page, toast]);

  useEffect(() => {
    if (user?.id) loadEntries();
  }, [user, page, loadEntries]);

  const handleUpdate = (entry) => {
    setSelectedEntry(entry);
    onUpdateOpen();
  };

  const handleDelete = (entry) => {
    setDeleteEntry(entry);
    onDeleteOpen();
  };

  const confirmDelete = async () => {
    if (!deleteEntry) return;
    setDeleting(true);
    try {
      await deleteCreditEntryApi(deleteEntry.id);
      toast({
        title: 'Entry deleted',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      onDeleteClose();
      loadEntries();
    } catch (err) {
      toast({
        title: 'Delete failed',
        description: err.response?.data?.message || 'Could not delete entry.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box>
      <Heading size="lg" mb={6}>
        Credit Entries
      </Heading>

      {loading ? (
        <Center py={20}>
          <Spinner size="xl" color="blue.500" />
        </Center>
      ) : entries.length === 0 ? (
        <EmptyState
          title="No credit entries"
          description={
            isShop
              ? 'Create your first credit entry to get started.'
              : 'No credit entries found for your account.'
          }
          actionLabel={isShop ? 'Create Entry' : undefined}
          onAction={isShop ? () => navigate('/create-entry') : undefined}
        />
      ) : (
        <>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} mb={6}>
            {entries.map((entry) => (
              <CreditEntryCard
                key={entry.id}
                entry={entry}
                isShop={isShop}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </SimpleGrid>

          {/* Pagination */}
          <HStack justify="center" spacing={4}>
            <Button
              leftIcon={<ChevronLeftIcon />}
              size="sm"
              isDisabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Text fontSize="sm" color="gray.600">
              Page {page}
            </Text>
            <Button
              rightIcon={<ChevronRightIcon />}
              size="sm"
              isDisabled={!hasMore}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </HStack>
        </>
      )}

      {/* Update Payment Modal */}
      {selectedEntry && (
        <UpdatePaymentModal
          isOpen={isUpdateOpen}
          onClose={onUpdateClose}
          entry={selectedEntry}
          onUpdated={loadEntries}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Delete Credit Entry</AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete this credit entry for{' '}
              <strong>{deleteEntry?.item}</strong>? This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                ml={3}
                isLoading={deleting}
                onClick={confirmDelete}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
