import React, { useState } from 'react';
import { apiCall } from '../utils/api';

const OTPStep = ({ phoneNumber, onSuccess }) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!/^\d{6}$/.test(otp)) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await apiCall('/api/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber, otp })
      });

      onSuccess(result.user, result.token);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{ textAlign: 'center', marginBottom: '25px' }}>
        <i className="fas fa-lock" style={{ fontSize: '2.5rem', color: '#4CAF50', marginBottom: '15px' }}></i>
        <h2 style={{ marginBottom: '15px', color: '#2E7D32' }}>🔐 Secure Farm Access</h2>
        <p style={{ color: '#388E3C', marginBottom: '20px' }}>
          <i className="fas fa-sms"></i> Check your SMS for the 6-digit verification code
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="otp">
            <i className="fas fa-key"></i> Farm Access Code
          </label>
          <input
            type="text"
            id="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="6-digit farm access code"
            maxLength="6"
            required
          />
        </div>

        <button type="submit" className="btn" disabled={loading}>
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i> Verifying...
            </>
          ) : (
            <>
              <i className="fas fa-check-circle"></i> Verify & Enter Farm
            </>
          )}
        </button>

        {error && (
          <div style={{ 
            padding: '15px 20px', 
            borderRadius: '8px', 
            margin: '15px 0', 
            fontWeight: '500',
            background: '#fee',
            color: '#c33',
            border: '1px solid #fcc'
          }}>
            {error}
          </div>
        )}
      </form>
    </>
  );
};

export default OTPStep;