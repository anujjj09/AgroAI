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
    <div className="container">
      <div className="auth-header" style={{ textAlign: 'center', color: 'white', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '15px', textShadow: '3px 3px 6px rgba(0,0,0,0.4)' }}>
          <i className="fas fa-seedling"></i> AgroAI
        </h1>
        <p style={{ fontSize: '1.3rem', opacity: '0.95', textShadow: '1px 1px 3px rgba(0,0,0,0.3)' }}>
          🌱 Intelligent Farming Solutions for Modern Agriculture 🚜
        </p>
      </div>

      <div className="card">
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