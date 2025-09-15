import React, { useState } from 'react';
import { apiCall } from '../utils/api';

const PhoneStep = ({ onSuccess }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid phone number with at least 10 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await apiCall('/api/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber })
      });

      onSuccess(phoneNumber);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{ textAlign: 'center', marginBottom: '25px' }}>
        <i className="fas fa-tractor" style={{ fontSize: '3rem', color: '#4CAF50', marginBottom: '15px' }}></i>
        <h2 style={{ marginBottom: '15px', color: '#2E7D32' }}>🌾 Join AgroAI Community</h2>
        <p style={{ color: '#388E3C', marginBottom: '20px', fontSize: '1.1rem' }}>
          <i className="fas fa-mobile-alt"></i> Enter your mobile number to access smart farming insights
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="phoneNumber">
            <i className="fas fa-mobile-alt"></i> Farmer's Mobile Number
          </label>
          <input
            type="tel"
            id="phoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Your mobile number (10 digits)"
            maxLength="10"
            required
          />
        </div>

        <button type="submit" className="btn" disabled={loading}>
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i> Sending Code...
            </>
          ) : (
            <>
              <i className="fas fa-paper-plane"></i> Send Farm Access Code
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

export default PhoneStep;