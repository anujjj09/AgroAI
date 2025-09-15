import React, { useState, useEffect } from 'react';

const WeatherTab = ({ user }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // For demo purposes, using mock data since we don't have weather API integration
      // In production, this would call your backend weather endpoint
      setTimeout(() => {
        setWeatherData({
          location: user?.district || 'Punjab',
          current: {
            temperature: 28,
            condition: 'Partly Cloudy',
            humidity: 65,
            windSpeed: 12,
            icon: 'fas fa-cloud-sun'
          },
          forecast: [
            { day: 'Today', high: 32, low: 22, condition: 'Sunny', icon: 'fas fa-sun' },
            { day: 'Tomorrow', high: 29, low: 20, condition: 'Cloudy', icon: 'fas fa-cloud' },
            { day: 'Day 3', high: 26, low: 18, condition: 'Rain', icon: 'fas fa-cloud-rain' },
            { day: 'Day 4', high: 31, low: 23, condition: 'Sunny', icon: 'fas fa-sun' },
            { day: 'Day 5', high: 28, low: 19, condition: 'Partly Cloudy', icon: 'fas fa-cloud-sun' }
          ],
          agriculture: {
            soilMoisture: 'Moderate',
            recommendation: 'Good conditions for wheat cultivation. Consider irrigation for vegetable crops.',
            alerts: ['Light rain expected in 2 days', 'Temperature ideal for winter crops']
          }
        });
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Failed to fetch weather data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#4CAF50' }}></i>
        <p style={{ marginTop: '20px', color: '#666' }}>Loading weather data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <i className="fas fa-exclamation-triangle" style={{ fontSize: '2rem', color: '#f44336' }}></i>
        <p style={{ marginTop: '20px', color: '#f44336' }}>{error}</p>
        <button onClick={fetchWeatherData} style={{ marginTop: '15px', padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="weather-container">
      <div className="weather-header">
        <h2>
          <i className="fas fa-cloud-sun"></i>
          Weather for {weatherData.location}
        </h2>
        <button onClick={fetchWeatherData} className="refresh-btn">
          <i className="fas fa-sync-alt"></i>
          Refresh
        </button>
      </div>

      {/* Current Weather */}
      <div className="current-weather">
        <div className="current-temp">
          <i className={weatherData.current.icon} style={{ fontSize: '3rem', color: '#FF9800' }}></i>
          <div>
            <h1>{weatherData.current.temperature}°C</h1>
            <p>{weatherData.current.condition}</p>
          </div>
        </div>
        
        <div className="weather-details">
          <div className="detail-item">
            <i className="fas fa-tint"></i>
            <span>Humidity: {weatherData.current.humidity}%</span>
          </div>
          <div className="detail-item">
            <i className="fas fa-wind"></i>
            <span>Wind: {weatherData.current.windSpeed} km/h</span>
          </div>
        </div>
      </div>

      {/* 5-Day Forecast */}
      <div className="forecast-section">
        <h3>5-Day Forecast</h3>
        <div className="forecast-grid">
          {weatherData.forecast.map((day, index) => (
            <div key={index} className="forecast-card">
              <h4>{day.day}</h4>
              <i className={day.icon} style={{ fontSize: '1.5rem', color: '#FF9800', margin: '10px 0' }}></i>
              <p className="temp-range">{day.high}° / {day.low}°</p>
              <p className="condition">{day.condition}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Agricultural Recommendations */}
      <div className="agri-section">
        <h3>
          <i className="fas fa-seedling"></i>
          Agricultural Insights
        </h3>
        
        <div className="agri-card">
          <div className="soil-moisture">
            <i className="fas fa-droplet"></i>
            <span>Soil Moisture: <strong>{weatherData.agriculture.soilMoisture}</strong></span>
          </div>
          
          <div className="recommendation">
            <h4>Farming Recommendation:</h4>
            <p>{weatherData.agriculture.recommendation}</p>
          </div>
          
          <div className="alerts">
            <h4>Weather Alerts:</h4>
            <ul>
              {weatherData.agriculture.alerts.map((alert, index) => (
                <li key={index}>
                  <i className="fas fa-info-circle"></i>
                  {alert}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <style jsx>{`
        .weather-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
        }

        .weather-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .weather-header h2 {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #2E7D32;
          margin: 0;
        }

        .refresh-btn {
          background: #4CAF50;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 5px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .refresh-btn:hover {
          background: #45a049;
        }

        .current-weather {
          background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%);
          padding: 30px;
          border-radius: 15px;
          margin-bottom: 30px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .current-temp {
          display: flex;
          align-items: center;
          gap: 30px;
          margin-bottom: 20px;
        }

        .current-temp h1 {
          font-size: 3rem;
          margin: 0;
          color: #1976D2;
        }

        .current-temp p {
          font-size: 1.2rem;
          color: #666;
          margin: 0;
        }

        .weather-details {
          display: flex;
          gap: 30px;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #666;
          font-weight: 500;
        }

        .forecast-section {
          margin-bottom: 30px;
        }

        .forecast-section h3 {
          color: #2E7D32;
          margin-bottom: 20px;
        }

        .forecast-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 15px;
        }

        .forecast-card {
          background: white;
          padding: 20px;
          border-radius: 10px;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: transform 0.3s ease;
        }

        .forecast-card:hover {
          transform: translateY(-5px);
        }

        .forecast-card h4 {
          margin: 0 0 10px 0;
          color: #2E7D32;
        }

        .temp-range {
          font-size: 1.1rem;
          font-weight: bold;
          color: #1976D2;
          margin: 10px 0;
        }

        .condition {
          color: #666;
          margin: 0;
        }

        .agri-section {
          background: linear-gradient(135deg, #E8F5E8 0%, #C8E6C9 100%);
          padding: 30px;
          border-radius: 15px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .agri-section h3 {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #2E7D32;
          margin: 0 0 20px 0;
        }

        .agri-card {
          background: white;
          padding: 25px;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .soil-moisture {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
          color: #666;
          font-size: 1.1rem;
        }

        .recommendation {
          margin-bottom: 20px;
        }

        .recommendation h4 {
          color: #2E7D32;
          margin: 0 0 10px 0;
        }

        .recommendation p {
          color: #666;
          line-height: 1.6;
          margin: 0;
        }

        .alerts h4 {
          color: #2E7D32;
          margin: 0 0 15px 0;
        }

        .alerts ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .alerts li {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 0;
          color: #666;
        }

        .alerts li i {
          color: #FF9800;
        }

        @media (max-width: 768px) {
          .weather-header {
            flex-direction: column;
            gap: 15px;
            align-items: flex-start;
          }

          .current-temp {
            flex-direction: column;
            gap: 15px;
            text-align: center;
          }

          .weather-details {
            justify-content: center;
            flex-wrap: wrap;
            gap: 15px;
          }

          .forecast-grid {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          }
        }
      `}</style>
    </div>
  );
};

export default WeatherTab;