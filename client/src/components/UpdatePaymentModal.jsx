import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  useToast,
} from '@chakra-ui/react';
import { updateCreditEntryPaymentApi } from '../api/creditEntryApi';

export default function UpdatePaymentModal({ isOpen, onClose, entry, onUpdated }) {
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await updateCreditEntryPaymentApi({
        id: entry.id,
        isPaid: true,
        paymentDate: new Date(paymentDate).toISOString(),
      });
      toast({
        title: 'Payment updated',
        description: 'Credit entry marked as paid.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onUpdated();
      onClose();
    } catch (err) {
      toast({
        title: 'Update failed',
        description: err.response?.data?.message || 'Could not update payment.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Mark as Paid</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl>
            <FormLabel>Payment Date</FormLabel>
            <Input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="green" isLoading={loading} onClick={handleConfirm}>
            Confirm Payment
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
