import React, { useState } from 'react';
import { apiCall } from '../utils/api';

const AdvisoryTab = ({ user, token }) => {
  const [selectedCrop, setSelectedCrop] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(user?.district || '');
  const [loading, setLoading] = useState(false);
  const [advisory, setAdvisory] = useState(null);
  const [error, setError] = useState('');

  const crops = [
    { value: 'wheat', label: '🌾 Wheat (गेहूं)', labelPa: '🌾 ਕਣਕ' },
    { value: 'rice', label: '🌾 Rice (चावल)', labelPa: '🌾 ਚਾਵਲ' },
    { value: 'cotton', label: '🌿 Cotton (कपास)', labelPa: '🌿 ਕਪਾਸ' },
    { value: 'maize', label: '🌽 Maize (मक्का)', labelPa: '🌽 ਮਕਈ' },
    { value: 'sugarcane', label: '🎋 Sugarcane (गन्ना)', labelPa: '🎋 ਗੰਨਾ' },
    { value: 'soybean', label: '🫘 Soybean (सोयाबीन)', labelPa: '🫘 ਸੋਇਆਬੀਨ' },
    { value: 'mustard', label: '🌻 Mustard (सरसों)', labelPa: '🌻 ਸਰੀਂਹ' },
    { value: 'potato', label: '🥔 Potato (आलू)', labelPa: '🥔 ਆਲੂ' }
  ];

  const districts = [
    'Amritsar', 'Barnala', 'Bathinda', 'Faridkot', 'Fatehgarh Sahib',
    'Fazilka', 'Ferozepur', 'Gurdaspur', 'Hoshiarpur', 'Jalandhar',
    'Kapurthala', 'Ludhiana', 'Mansa', 'Moga', 'Muktsar', 'Nawanshahr',
    'Pathankot', 'Patiala', 'Rupnagar', 'Sangrur', 'Tarn Taran'
  ];

  const generateAdvisory = async () => {
    if (!selectedCrop || !selectedLocation) {
      setError('Please select both crop and location');
      return;
    }

    setLoading(true);
    setError('');
    setAdvisory(null);

    try {
      console.log('Making advisory request with payload:', { crop: selectedCrop, location: selectedLocation });
      
      const data = await apiCall('/api/advisory', {
        method: 'POST',
        body: JSON.stringify({
          crop: selectedCrop,
          location: selectedLocation
        })
      });

      setAdvisory(data);
    } catch (err) {
      console.error('Advisory generation error:', err);
      console.error('Error details:', {
        message: err.message,
        stack: err.stack
      });
      setError(`Failed to generate advisory: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="advisory-container">
      {/* Header */}
      <div className="card" style={{ 
        background: 'linear-gradient(135deg, #E8F5E8 0%, #F1F8E9 100%)', 
        border: '2px solid #81C784', 
        marginBottom: '20px' 
      }}>
        <h3 style={{ color: '#2E7D32', marginBottom: '10px' }}>
          <i className="fas fa-seedling"></i> Smart Crop Advisory
        </h3>
        <p style={{ color: '#388E3C', margin: '0' }}>
          Get personalized farming advice based on weather, market prices, and AI insights
        </p>
      </div>

      {/* Selection Form */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h4 style={{ marginBottom: '15px', color: '#2E7D32' }}>
          <i className="fas fa-clipboard-list"></i> Select Your Crop & Location
        </h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>
              Crop Type:
            </label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px'
              }}
            >
              <option value="">Select a crop...</option>
              {crops.map(crop => (
                <option key={crop.value} value={crop.value}>
                  {crop.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>
              District:
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px'
              }}
            >
              <option value="">Select district...</option>
              {districts.map(district => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={generateAdvisory}
          disabled={loading || !selectedCrop || !selectedLocation}
          style={{
            background: loading ? '#ccc' : 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
            color: 'white',
            border: 'none',
            padding: '12px 30px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            width: '100%',
            transition: 'all 0.3s'
          }}
        >
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i> Generating Advisory...
            </>
          ) : (
            <>
              <i className="fas fa-magic"></i> Generate Smart Advisory
            </>
          )}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="card" style={{ 
          background: '#ffebee', 
          border: '2px solid #f44336', 
          marginBottom: '20px' 
        }}>
          <div style={{ color: '#d32f2f' }}>
            <i className="fas fa-exclamation-triangle"></i> {error}
          </div>
        </div>
      )}

      {/* Advisory Results */}
      {advisory && (
        <div className="advisory-results">
          {/* Current Conditions */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <h4 style={{ color: '#2E7D32', marginBottom: '15px' }}>
              <i className="fas fa-thermometer-half"></i> Current Conditions
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <div style={{ textAlign: 'center', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                <div style={{ fontSize: '24px', color: '#FF6B6B' }}>🌡️</div>
                <div style={{ fontWeight: 'bold' }}>{advisory.data.weather.temperature}°C</div>
                <div style={{ fontSize: '14px', color: '#666' }}>Temperature</div>
              </div>
              <div style={{ textAlign: 'center', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                <div style={{ fontSize: '24px', color: '#4ECDC4' }}>💧</div>
                <div style={{ fontWeight: 'bold' }}>{advisory.data.weather.humidity}%</div>
                <div style={{ fontSize: '14px', color: '#666' }}>Humidity</div>
              </div>
              <div style={{ textAlign: 'center', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                <div style={{ fontSize: '24px', color: '#45B7D1' }}>🌧️</div>
                <div style={{ fontWeight: 'bold' }}>{advisory.data.weather.rainfall}mm</div>
                <div style={{ fontSize: '14px', color: '#666' }}>Rainfall (24h)</div>
              </div>
              <div style={{ textAlign: 'center', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                <div style={{ fontSize: '24px', color: '#F7DC6F' }}>💰</div>
                <div style={{ fontWeight: 'bold' }}>{formatPrice(advisory.data.market.currentPrice)}</div>
                <div style={{ fontSize: '14px', color: '#666' }}>Current Price</div>
              </div>
            </div>
          </div>

          {/* Weather Forecast */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <h4 style={{ color: '#2E7D32', marginBottom: '15px' }}>
              <i className="fas fa-calendar-week"></i> 5-Day Weather Forecast
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px' }}>
              {advisory.data.forecast.map((day, index) => (
                <div key={index} style={{ 
                  textAlign: 'center', 
                  padding: '10px', 
                  background: '#f8f9fa', 
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0'
                }}>
                  <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '5px' }}>{day.date}</div>
                  <div style={{ fontSize: '18px', margin: '5px 0' }}>
                    {day.description.includes('rain') ? '🌧️' : 
                     day.description.includes('cloud') ? '☁️' : '☀️'}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                    {day.tempMax}°/{day.tempMin}°
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {day.rainfall}mm rain
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Market Information */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <h4 style={{ color: '#2E7D32', marginBottom: '15px' }}>
              <i className="fas fa-chart-line"></i> Market Price Analysis
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
              <div style={{ textAlign: 'center', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2E7D32' }}>
                  {formatPrice(advisory.data.market.currentPrice)}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>Current Price</div>
              </div>
              <div style={{ textAlign: 'center', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#666' }}>
                  {formatPrice(advisory.data.market.lastWeekAverage)}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>Last Week Avg</div>
              </div>
              <div style={{ textAlign: 'center', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                <div style={{ 
                  fontSize: '20px', 
                  fontWeight: 'bold', 
                  color: advisory.data.market.change >= 0 ? '#4CAF50' : '#f44336' 
                }}>
                  {advisory.data.market.change >= 0 ? '+' : ''}{formatPrice(advisory.data.market.change)}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>Change</div>
              </div>
              <div style={{ textAlign: 'center', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                <div style={{ 
                  fontSize: '20px', 
                  fontWeight: 'bold', 
                  color: advisory.data.market.changePercent >= 0 ? '#4CAF50' : '#f44336' 
                }}>
                  {advisory.data.market.changePercent >= 0 ? '+' : ''}{advisory.data.market.changePercent}%
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>% Change</div>
              </div>
            </div>
          </div>

          {/* AI Advisory */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <h4 style={{ color: '#2E7D32', marginBottom: '15px' }}>
              <i className="fas fa-robot"></i> AI-Powered Recommendations
            </h4>
            
            {/* Immediate Actions */}
            <div style={{ marginBottom: '20px' }}>
              <h5 style={{ color: '#FF6B6B', marginBottom: '10px' }}>
                <i className="fas fa-exclamation-circle"></i> Immediate Actions (Next 48 hours)
              </h5>
              <ul style={{ paddingLeft: '20px', margin: '0' }}>
                {advisory.advisory.immediateActions.map((action, index) => (
                  <li key={index} style={{ marginBottom: '8px', lineHeight: '1.5' }}>
                    {action}
                  </li>
                ))}
              </ul>
            </div>

            {/* Long-term Strategy */}
            <div style={{ marginBottom: '20px' }}>
              <h5 style={{ color: '#45B7D1', marginBottom: '10px' }}>
                <i className="fas fa-calendar-alt"></i> Long-Term Strategy (This Week)
              </h5>
              <ul style={{ paddingLeft: '20px', margin: '0' }}>
                {advisory.advisory.longTermStrategy.map((strategy, index) => (
                  <li key={index} style={{ marginBottom: '8px', lineHeight: '1.5' }}>
                    {strategy}
                  </li>
                ))}
              </ul>
            </div>

            {/* Financial Insight */}
            <div style={{ 
              background: '#FFF9C4', 
              border: '2px solid #F9A825', 
              borderRadius: '8px', 
              padding: '15px' 
            }}>
              <h5 style={{ color: '#F57F17', marginBottom: '10px' }}>
                <i className="fas fa-dollar-sign"></i> Financial Insight
              </h5>
              <p style={{ margin: '0', lineHeight: '1.5', color: '#333' }}>
                {advisory.advisory.financialInsight}
              </p>
            </div>
          </div>

          {/* Generated timestamp */}
          <div style={{ textAlign: 'center', color: '#666', fontSize: '14px' }}>
            <i className="fas fa-clock"></i> Advisory generated on {new Date(advisory.data.timestamp).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvisoryTab;