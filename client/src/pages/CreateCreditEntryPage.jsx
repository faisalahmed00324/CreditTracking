import React, { useState } from 'react';
import {
  Box,
  Heading,
  Card,
  CardBody,
  useToast,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createCreditEntryApi } from '../api/creditEntryApi';
import CreditEntryForm from '../components/CreditEntryForm';

export default function CreateCreditEntryPage() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      await createCreditEntryApi(formData);
      toast({
        title: 'Credit entry created',
        description: 'The credit entry has been successfully created.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/credit-entries');
    } catch (err) {
      toast({
        title: 'Failed to create entry',
        description: err.response?.data?.message || err.response?.data || 'Please try again.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Heading size="lg" mb={6}>
        Create Credit Entry
      </Heading>
      <Card maxW="2xl" shadow="sm">
        <CardBody>
          <CreditEntryForm
            shopId={user?.id}
            onSubmit={handleSubmit}
            loading={loading}
          />
        </CardBody>
      </Card>
    </Box>
  );
}
