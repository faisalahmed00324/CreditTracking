import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { creditEntryService } from '../../services/apiService';
import { formatCurrency, formatDate } from '../../utils/helpers';
import './CustomerCreditList.css';

const CustomerCreditList = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalPages: 1,
    totalCount: 0,
  });

  useEffect(() => {
    fetchEntries();
  }, [pagination.pageNumber]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const response = await creditEntryService.getCreditEntriesByCustomer(
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

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, pageNumber: newPage }));
  };

  if (loading && entries.length === 0) {
    return <div className="loading">Loading your credit entries...</div>;
  }

  return (
    <div className="customer-credit-container">
      <div className="credit-header">
        <h1>My Credit Entries</h1>
        <p>View all your credit purchases from shops</p>
      </div>

      <div className="entries-list">
        {entries.length > 0 ? (
          <>
            <table className="entries-table">
              <thead>
                <tr>
                  <th>Shop</th>
                  <th>Item</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Payment Date</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.shopName}</td>
                    <td>{entry.item}</td>
                    <td>{formatCurrency(entry.amount)}</td>
                    <td>{formatDate(entry.date)}</td>
                    <td>
                      <span className={`status-badge ${entry.isPaid ? 'paid' : 'unpaid'}`}>
                        {entry.isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                    <td>{entry.paymentDate ? formatDate(entry.paymentDate) : '-'}</td>
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
                ({pagination.totalCount} total entries)
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
          <div className="no-data">
            <p>No credit entries found.</p>
            <p className="info-text">When shops add credit entries for you, they will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerCreditList;
