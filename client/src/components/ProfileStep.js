import React, { useState } from 'react';

const ProfileStep = ({ onSuccess }) => {
  const [name, setName] = useState('');
  const [district, setDistrict] = useState('Amritsar');
  const [language, setLanguage] = useState('en');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    const userData = {
      name: name.trim(),
      district,
      language,
      isVerified: true
    };

    const token = localStorage.getItem('authToken');
    onSuccess(userData, token);
  };

  const districts = [
    'Amritsar', 'Barnala', 'Bathinda', 'Faridkot', 'Fatehgarh Sahib',
    'Fazilka', 'Ferozepur', 'Gurdaspur', 'Hoshiarpur', 'Jalandhar',
    'Kapurthala', 'Ludhiana', 'Mansa', 'Moga', 'Muktsar', 'Pathankot',
    'Patiala', 'Rupnagar', 'Sahibzada Ajit Singh Nagar', 'Sangrur',
    'Shaheed Bhagat Singh Nagar', 'Tarn Taran'
  ];

  return (
    <>
      <div style={{ textAlign: 'center', marginBottom: '25px' }}>
        <i className="fas fa-user-tie" style={{ fontSize: '2.5rem', color: '#4CAF50', marginBottom: '15px' }}></i>
        <h2 style={{ marginBottom: '15px', color: '#2E7D32' }}>🚜 Farm Profile Setup</h2>
        <p style={{ color: '#388E3C', marginBottom: '20px' }}>
          Help us personalize your farming experience
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="name">
            <i className="fas fa-user"></i> Farmer Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="language">
            <i className="fas fa-language"></i> Preferred Language
          </label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="en">🇬🇧 English</option>
            <option value="hi">🇮🇳 हिन्दी (Hindi)</option>
            <option value="pa">🇮🇳 ਪੰਜਾਬੀ (Punjabi)</option>
          </select>
        </div>

        <div className="input-group">
          <label htmlFor="district">
            <i className="fas fa-map-marker-alt"></i> Farm District (Punjab)
          </label>
          <select
            id="district"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          >
            {districts.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn">
          Complete Profile & Continue
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

export default ProfileStep;