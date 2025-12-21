import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

const VerifyOtp = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { verifyOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId;

  if (!userId) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">Invalid Access</h1>
          <p>Please register first to verify OTP.</p>
          <Link to="/register" className="auth-link">Go to Registration</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await verifyOtp(userId, otp);
      
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(result.error || 'OTP verification failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">✓ Success!</h1>
          <p className="success-message">Your account has been verified successfully.</p>
          <p>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Verify OTP</h1>
        <p className="auth-description">
          Please enter the OTP sent to your email to verify your account.
        </p>
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="otp">OTP Code</label>
            <input
              type="text"
              id="otp"
              name="otp"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value);
                setError('');
              }}
              required
              placeholder="Enter 6-digit OTP"
              maxLength="6"
              pattern="[0-9]{6}"
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/login" className="auth-link">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
