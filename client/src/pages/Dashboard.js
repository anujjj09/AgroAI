import React, { useState } from 'react';
import '../DesignSystem.css';
import WeatherTab from './WeatherTab';
import MarketTab from './MarketTab';
import ChatTab from './ChatTab';
import PestDetectionTab from './PestDetectionTab';
import AdvisoryTab from './AdvisoryTab';
import { useLanguage } from '../contexts/LanguageContext';

const Dashboard = ({ user, token, onLogout }) => {
  const [activeTab, setActiveTab] = useState('advisory');
  const { t } = useLanguage();

  return (
    <div className="container">
      
  <div className="card-surface" style={{ background: 'linear-gradient(135deg, #E8F5E8 0%, #F1F8E9 100%)', border: '2px solid #81C784', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ color: '#388E3C', margin: '0', fontSize: '16px', fontWeight: '500' }}>
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

      <div className="tab-bar" style={{ margin: '20px 0' }}>
        {[
          { id: 'advisory', icon: 'fas fa-seedling', label: 'Smart Advisory' },
          { id: 'weather', icon: 'fas fa-cloud-sun', label: t('home.weatherInfo') },
          { id: 'market', icon: 'fas fa-chart-line', label: t('market.title') },
          { id: 'chat', icon: 'fas fa-robot', label: t('home.aiChat') },
          { id: 'pest', icon: 'fas fa-bug', label: t('nav.pestDetection') }
        ].map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <i className={tab.icon}></i> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'advisory' && <AdvisoryTab user={user} token={token} />}
      {activeTab === 'weather' && <WeatherTab user={user} token={token} />}
      {activeTab === 'market' && <MarketTab user={user} token={token} />}
      {activeTab === 'chat' && <ChatTab user={user} token={token} />}
      {activeTab === 'pest' && <PestDetectionTab user={user} token={token} />}
    </div>
  );
};

export default Dashboard;