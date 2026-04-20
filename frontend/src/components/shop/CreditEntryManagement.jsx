import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { creditEntryService, userService } from '../../services/apiService';
import { formatCurrency, formatDate } from '../../utils/helpers';
import './CreditEntryManagement.css';

const CreditEntryManagement = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalPages: 1,
    totalCount: 0,
  });
  
  const [formData, setFormData] = useState({
    customerId: '',
    item: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    isPaid: false,
    paymentDate: '',
  });

  useEffect(() => {
    fetchEntries();
  }, [pagination.pageNumber]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const response = await creditEntryService.getCreditEntriesByShop(
        user.id,
        pagination.pageNumber,
        pagination.pageSize
      );
      setEntries(response.items || []);
      setPagination(prev => ({
        ...prev,
        totalPages: response.totalPages || 1,
        totalCount: response.totalCount || 0,
      }));
    } catch (error) {
      console.error('Error fetching entries:', error);
      alert('Failed to fetch credit entries');
    } finally {
      setLoading(false);
    }
  };

  const searchCustomers = async (term) => {
    if (term.length < 2) {
      setCustomers([]);
      return;
    }
    try {
      const response = await userService.searchCustomers(term);
      setCustomers(response || []);
    } catch (error) {
      console.error('Error searching customers:', error);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    searchCustomers(value);
  };

  const handleCustomerSelect = (customer) => {
    setFormData({ ...formData, customerId: customer.id });
    setSearchTerm(customer.name);
    setCustomers([]);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.customerId) {
      alert('Please select a customer');
      return;
    }

    try {
      await creditEntryService.createCreditEntry({
        shopId: user.id,
        customerId: formData.customerId,
        item: formData.item,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date).toISOString(),
        isPaid: formData.isPaid,
        paymentDate: formData.paymentDate ? new Date(formData.paymentDate).toISOString() : null,
      });
      
      alert('Credit entry created successfully!');
      setShowModal(false);
      resetForm();
      fetchEntries();
    } catch (error) {
      console.error('Error creating entry:', error);
      alert('Failed to create credit entry');
    }
  };

  const handleUpdatePayment = async (entry) => {
    const isPaid = !entry.isPaid;
    const paymentDate = isPaid ? new Date().toISOString() : null;
    
    try {
      await creditEntryService.updateCreditEntry(entry.id, isPaid, paymentDate);
      alert('Payment status updated successfully!');
      fetchEntries();
    } catch (error) {
      console.error('Error updating entry:', error);
      alert('Failed to update payment status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) {
      return;
    }
    
    try {
      await creditEntryService.deleteCreditEntry(id);
      alert('Credit entry deleted successfully!');
      fetchEntries();
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert('Failed to delete credit entry');
    }
  };

  const resetForm = () => {
    setFormData({
      customerId: '',
      item: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      isPaid: false,
      paymentDate: '',
    });
    setSearchTerm('');
    setCustomers([]);
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, pageNumber: newPage }));
  };

  if (loading && entries.length === 0) {
    return <div className="loading">Loading credit entries...</div>;
  }

  return (
    <div className="credit-management-container">
      <div className="management-header">
        <h1>Credit Entry Management</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Add New Entry
        </button>
      </div>

      <div className="entries-list">
        {entries.length > 0 ? (
          <>
            <table className="entries-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Item</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Payment Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.customerName}</td>
                    <td>{entry.item}</td>
                    <td>{formatCurrency(entry.amount)}</td>
                    <td>{formatDate(entry.date)}</td>
                    <td>
                      <span className={`status-badge ${entry.isPaid ? 'paid' : 'unpaid'}`}>
                        {entry.isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                    <td>{entry.paymentDate ? formatDate(entry.paymentDate) : '-'}</td>
                    <td className="actions">
                      <button
                        className={`btn-small ${entry.isPaid ? 'btn-warning' : 'btn-success'}`}
                        onClick={() => handleUpdatePayment(entry)}
                      >
                        {entry.isPaid ? 'Mark Unpaid' : 'Mark Paid'}
                      </button>
                      <button
                        className="btn-small btn-danger"
                        onClick={() => handleDelete(entry.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination">
              <button
                onClick={() => handlePageChange(pagination.pageNumber - 1)}
                disabled={pagination.pageNumber === 1}
              >
                Previous
              </button>
              <span>
                Page {pagination.pageNumber} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.pageNumber + 1)}
                disabled={pagination.pageNumber >= pagination.totalPages}
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <p className="no-data">No credit entries found.</p>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Credit Entry</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit} className="entry-form">
              <div className="form-group">
                <label>Customer *</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search customer by name..."
                  required
                />
                {customers.length > 0 && (
                  <div className="customer-dropdown">
                    {customers.map((customer) => (
                      <div
                        key={customer.id}
                        className="customer-item"
                        onClick={() => handleCustomerSelect(customer)}
                      >
                        {customer.name} - {customer.email}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Item Description *</label>
                <input
                  type="text"
                  name="item"
                  value={formData.item}
                  onChange={handleInputChange}
                  placeholder="What was purchased?"
                  required
                />
              </div>

              <div className="form-group">
                <label>Amount *</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="isPaid"
                    checked={formData.isPaid}
                    onChange={handleInputChange}
                  />
                  Paid
                </label>
              </div>

              {formData.isPaid && (
                <div className="form-group">
                  <label>Payment Date</label>
                  <input
                    type="date"
                    name="paymentDate"
                    value={formData.paymentDate}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditEntryManagement;
