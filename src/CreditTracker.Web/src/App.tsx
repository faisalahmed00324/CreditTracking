import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { VerifyOtpPage } from './pages/VerifyOtpPage';
import { ShopDashboard } from './pages/shop/ShopDashboard';
import { ShopEntries } from './pages/shop/ShopEntries';
import { CreateCreditEntry } from './pages/shop/CreateCreditEntry';
import { EditCreditEntry } from './pages/shop/EditCreditEntry';
import { CreditEntryDetail } from './pages/shop/CreditEntryDetail';
import { CustomerSearch } from './pages/shop/CustomerSearch';
import { CustomerDashboard } from './pages/customer/CustomerDashboard';
import { CustomerEntries } from './pages/customer/CustomerEntries';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />

          {/* Shop routes */}
          <Route element={<ProtectedRoute allowedRole="Shop" />}>
            <Route element={<AppLayout />}>
              <Route path="/shop/dashboard" element={<ShopDashboard />} />
              <Route path="/shop/entries" element={<ShopEntries />} />
              <Route path="/shop/entries/new" element={<CreateCreditEntry />} />
              <Route path="/shop/entries/:id" element={<CreditEntryDetail />} />
              <Route path="/shop/entries/:id/edit" element={<EditCreditEntry />} />
              <Route path="/shop/customers" element={<CustomerSearch />} />
            </Route>
          </Route>

          {/* Customer routes */}
          <Route element={<ProtectedRoute allowedRole="Customer" />}>
            <Route element={<AppLayout />}>
              <Route path="/customer/dashboard" element={<CustomerDashboard />} />
              <Route path="/customer/entries" element={<CustomerEntries />} />
              <Route path="/customer/entries/:id" element={<CreditEntryDetail />} />
            </Route>
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
