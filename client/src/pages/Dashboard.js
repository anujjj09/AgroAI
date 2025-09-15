import React, { useState } from 'react';
import WeatherTab from './WeatherTab';
import MarketTab from './MarketTab';
import ChatTab from './ChatTab';
import PestTab from './PestTab';

const Dashboard = ({ user, token, onLogout }) => {
  const [activeTab, setActiveTab] = useState('weather');

  return (
    <div className="container">
      
      <div className="card" style={{ background: 'linear-gradient(135deg, #E8F5E8 0%, #F1F8E9 100%)', border: '2px solid #81C784', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ color: '#2E7D32', marginBottom: '5px' }}>
              <i className="fas fa-tractor"></i> Welcome to your Farm Dashboard
            </h2>
            <p style={{ color: '#388E3C', margin: '0' }}>
              <i className="fas fa-map-marker-alt"></i> {user.district} • 
              <i className="fas fa-calendar"></i> {new Date().toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <div style={{ fontSize: '3rem', color: '#4CAF50' }}>🌾</div>
        </div>
      </div>

      <div className="tabs" style={{ display: 'flex', background: 'white', borderRadius: '10px', overflow: 'hidden', margin: '20px 0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        {[
          { id: 'weather', icon: 'fas fa-cloud-sun', label: 'Farm Weather' },
          { id: 'market', icon: 'fas fa-chart-line', label: 'Crop Prices' },
          { id: 'chat', icon: 'fas fa-robot', label: 'AI Assistant' },
          { id: 'pest', icon: 'fas fa-bug', label: 'Pest Detection' }
        ].map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: '16px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              background: activeTab === tab.id ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f8f9fa',
              color: activeTab === tab.id ? 'white' : 'inherit',
              border: 'none',
              transition: 'all 0.3s',
              fontWeight: '500'
            }}
          >
            <i className={tab.icon}></i> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'weather' && <WeatherTab user={user} token={token} />}
      {activeTab === 'market' && <MarketTab user={user} token={token} />}
      {activeTab === 'chat' && <ChatTab user={user} token={token} />}
      {activeTab === 'pest' && <PestTab user={user} token={token} />}
    </div>
  );
};

export default Dashboard;