import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { creditEntryService } from '../../services/apiService';
import { formatCurrency } from '../../utils/helpers';
import './ShopDashboard.css';

const ShopDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalEntries: 0,
    totalAmount: 0,
    paidAmount: 0,
    unpaidAmount: 0,
  });
  const [recentEntries, setRecentEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await creditEntryService.getCreditEntriesByShop(user.id, 1, 10);
      const entries = response.items || [];
      
      // Calculate statistics
      const totalAmount = entries.reduce((sum, entry) => sum + entry.amount, 0);
      const paidAmount = entries
        .filter(entry => entry.isPaid)
        .reduce((sum, entry) => sum + entry.amount, 0);
      const unpaidAmount = totalAmount - paidAmount;

      setStats({
        totalEntries: response.totalCount || entries.length,
        totalAmount,
        paidAmount,
        unpaidAmount,
      });

      setRecentEntries(entries.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Shop Dashboard</h1>
        <p>Welcome back, {user?.name}!</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Total Entries</h3>
            <p className="stat-value">{stats.totalEntries}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Total Amount</h3>
            <p className="stat-value">{formatCurrency(stats.totalAmount)}</p>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">✓</div>
          <div className="stat-content">
            <h3>Paid Amount</h3>
            <p className="stat-value">{formatCurrency(stats.paidAmount)}</p>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>Unpaid Amount</h3>
            <p className="stat-value">{formatCurrency(stats.unpaidAmount)}</p>
          </div>
        </div>
      </div>

      <div className="recent-entries">
        <h2>Recent Credit Entries</h2>
        {recentEntries.length > 0 ? (
          <div className="entries-table">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Item</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.customerName}</td>
                    <td>{entry.item}</td>
                    <td>{formatCurrency(entry.amount)}</td>
                    <td>
                      <span className={`status-badge ${entry.isPaid ? 'paid' : 'unpaid'}`}>
                        {entry.isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="no-data">No credit entries yet.</p>
        )}
      </div>
    </div>
  );
};

export default ShopDashboard;
