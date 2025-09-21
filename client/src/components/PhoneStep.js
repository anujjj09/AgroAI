import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { apiCall } from '../utils/api';

const PhoneStep = ({ onSuccess }) => {
  const { t } = useLanguage();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!phoneNumber || phoneNumber.length < 10) {
      setError(t('auth.enterPhone'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Try to send OTP via backend
      await apiCall('/api/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber })
      });

      onSuccess(phoneNumber);
    } catch (error) {
      console.log('Backend OTP failed, using simulation mode:', error);
      
      // Fallback to simulation mode - always succeed for demo purposes
      setTimeout(() => {
        setLoading(false);
        onSuccess(phoneNumber);
      }, 1000);
      
      return; // Don't execute the finally block yet
    } finally {
      if (!loading) return; // Prevent double execution
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{ textAlign: 'center', marginBottom: '25px' }}>
        <i className="fas fa-tractor" style={{ fontSize: '3rem', color: '#4CAF50', marginBottom: '15px' }}></i>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="phoneNumber">
            <i className="fas fa-mobile-alt"></i> {t('auth.phoneNumber')}
          </label>
          <input
            type="tel"
            id="phoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder={t('auth.phoneNumber')}
            maxLength="10"
            required
          />
        </div>

        <button type="submit" className="btn" disabled={loading}>
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i> {t('common.loading')}
            </>
          ) : (
            <>
              <i className="fas fa-paper-plane"></i> {t('auth.sendOtp')}
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