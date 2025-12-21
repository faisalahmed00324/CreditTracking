import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Header.css';

const Header = () => {
  const { user, logout, isAuthenticated, isShop, isCustomer } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <Link to="/" className="logo">
            CreditTracker
          </Link>
          <nav className="nav">
            {isShop() && (
              <>
                <Link to="/shop/dashboard" className="nav-link">Dashboard</Link>
                <Link to="/shop/credit-entries" className="nav-link">Credit Entries</Link>
                <Link to="/shop/customers" className="nav-link">Customers</Link>
              </>
            )}
            {isCustomer() && (
              <>
                <Link to="/customer/dashboard" className="nav-link">Dashboard</Link>
                <Link to="/customer/credit-entries" className="nav-link">My Credits</Link>
              </>
            )}
          </nav>
        </div>
        <div className="header-right">
          <span className="user-info">
            {user?.name} ({user?.role === 1 ? 'Shop' : 'Customer'})
          </span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
