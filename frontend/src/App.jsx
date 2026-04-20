import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/shared/Header';
import ProtectedRoute from './components/shared/ProtectedRoute';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import VerifyOtp from './components/auth/VerifyOtp';
import ShopDashboard from './components/shop/ShopDashboard';
import CreditEntryManagement from './components/shop/CreditEntryManagement';
import CustomerSearch from './components/shop/CustomerSearch';
import CustomerDashboard from './components/customer/CustomerDashboard';
import CustomerCreditList from './components/customer/CustomerCreditList';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Header />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-otp" element={<VerifyOtp />} />

              {/* Shop Routes */}
              <Route
                path="/shop/dashboard"
                element={
                  <ProtectedRoute requiredRole={1}>
                    <ShopDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/shop/credit-entries"
                element={
                  <ProtectedRoute requiredRole={1}>
                    <CreditEntryManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/shop/customers"
                element={
                  <ProtectedRoute requiredRole={1}>
                    <CustomerSearch />
                  </ProtectedRoute>
                }
              />

              {/* Customer Routes */}
              <Route
                path="/customer/dashboard"
                element={
                  <ProtectedRoute requiredRole={2}>
                    <CustomerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/credit-entries"
                element={
                  <ProtectedRoute requiredRole={2}>
                    <CustomerCreditList />
                  </ProtectedRoute>
                }
              />

              {/* Default Route */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
