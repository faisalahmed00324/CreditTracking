import React, { useState } from 'react';
import { userService } from '../../services/apiService';
import { getRoleName } from '../../utils/helpers';
import './CustomerSearch.css';

const CustomerSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (searchTerm.trim().length < 2) {
      alert('Please enter at least 2 characters to search');
      return;
    }

    setLoading(true);
    setSearched(true);
    
    try {
      const response = await userService.searchCustomers(searchTerm);
      setCustomers(response || []);
    } catch (error) {
      console.error('Error searching customers:', error);
      alert('Failed to search customers');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="customer-search-container">
      <div className="search-header">
        <h1>Search Customers</h1>
        <p>Find customers by name, email, or other details</p>
      </div>

      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-group">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter customer name, email, or IC number..."
            className="search-input"
          />
          <button type="submit" className="search-button" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {searched && (
        <div className="search-results">
          {loading ? (
            <p className="loading">Searching...</p>
          ) : customers.length > 0 ? (
            <div className="customers-grid">
              {customers.map((customer) => (
                <div key={customer.id} className="customer-card">
                  <div className="customer-header">
                    <h3>{customer.name}</h3>
                    <span className="role-badge">{getRoleName(customer.role)}</span>
                  </div>
                  <div className="customer-details">
                    <div className="detail-item">
                      <strong>Username:</strong> {customer.userName}
                    </div>
                    <div className="detail-item">
                      <strong>Email:</strong> {customer.email}
                    </div>
                    <div className="detail-item">
                      <strong>IC/Passport:</strong> {customer.icNoOrPassport}
                    </div>
                    <div className="detail-item">
                      <strong>Address:</strong> {customer.address}
                    </div>
                    {customer.latitude && customer.longitude && (
                      <div className="detail-item">
                        <strong>Location:</strong> {customer.latitude}, {customer.longitude}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-results">No customers found matching your search.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerSearch;
