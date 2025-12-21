// Format date to readable string
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Get role name
export const getRoleName = (role) => {
  switch (role) {
    case 1:
      return 'Shop';
    case 2:
      return 'Customer';
    default:
      return 'Unknown';
  }
};

// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Handle API errors
export const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.errors) {
    return Object.values(error.response.data.errors).flat().join(', ');
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};
