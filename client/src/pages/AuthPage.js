import React, { useState } from 'react';
import PhoneStep from '../components/PhoneStep';
import OTPStep from '../components/OTPStep';
import ProfileStep from '../components/ProfileStep';

const AuthPage = ({ onLogin }) => {
  const [currentStep, setCurrentStep] = useState('phone');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handlePhoneSuccess = (phone) => {
    setPhoneNumber(phone);
    setCurrentStep('otp');
  };

  const handleOTPSuccess = (userData, token) => {
    if (userData.name && userData.district) {
      onLogin(userData, token);
    } else {
      setCurrentStep('profile');
    }
  };

  const handleProfileSuccess = (userData, token) => {
    onLogin(userData, token);
  };

  return (
    <div className="auth-container">
      <div className="auth-header" style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ 
          fontSize: '3.5rem', 
          marginBottom: '15px', 
          background: 'linear-gradient(45deg, #2E7D32, #4CAF50, #66BB6A)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontWeight: '700',
          textShadow: '2px 2px 4px rgba(46, 125, 50, 0.3)' 
        }}>
          <i className="fas fa-seedling" style={{ color: '#4CAF50' }}></i> AgroAI
        </h1>
        <p style={{ 
          fontSize: '1.3rem', 
          color: '#E8F5E8',
          textShadow: '1px 1px 3px rgba(0,0,0,0.3)',
          fontWeight: '500'
        }}>
          🌱 Intelligent Farming Solutions for Modern Agriculture 🚜
        </p>
      </div>

      <div className="auth-card">
        {currentStep === 'phone' && (
          <PhoneStep onSuccess={handlePhoneSuccess} />
        )}
        {currentStep === 'otp' && (
          <OTPStep phoneNumber={phoneNumber} onSuccess={handleOTPSuccess} />
        )}
        {currentStep === 'profile' && (
          <ProfileStep onSuccess={handleProfileSuccess} />
        )}
      </div>
    </div>
  );
};

export default AuthPage;