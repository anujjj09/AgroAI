import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const MarketTab = ({ user }) => {
  const { t } = useLanguage();
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('grains');

  useEffect(() => {
    fetchMarketData();
  }, [selectedCategory]);

  const fetchMarketData = () => {
    setLoading(true);
    
    // Mock market data - in production this would come from your backend API
    setTimeout(() => {
      // Updated realistic Punjab market prices (September 2025)
      const mockData = {
        grains: [
          { name: 'Wheat', price: 2275, unit: 'per quintal', change: '+3.2%', trend: 'up', icon: '🌾' },
          { name: 'Rice (Basmati)', price: 5200, unit: 'per quintal', change: '+4.5%', trend: 'up', icon: '🍚' },
          { name: 'Rice (Non-Basmati)', price: 3150, unit: 'per quintal', change: '+2.1%', trend: 'up', icon: '🍚' },
          { name: 'Maize', price: 1950, unit: 'per quintal', change: '+1.8%', trend: 'up', icon: '🌽' },
          { name: 'Mustard', price: 5800, unit: 'per quintal', change: '+2.7%', trend: 'up', icon: '�' }
        ],
        vegetables: [
          { name: 'Onion', price: 2800, unit: 'per quintal', change: '+12.5%', trend: 'up', icon: '🧅' },
          { name: 'Potato', price: 1650, unit: 'per quintal', change: '-3.2%', trend: 'down', icon: '🥔' },
          { name: 'Tomato', price: 3200, unit: 'per quintal', change: '+6.8%', trend: 'up', icon: '🍅' },
          { name: 'Cauliflower', price: 1800, unit: 'per quintal', change: '+4.1%', trend: 'up', icon: '🥬' },
          { name: 'Green Peas', price: 4500, unit: 'per quintal', change: '+8.2%', trend: 'up', icon: '🟢' }
        ],
        fruits: [
          { name: 'Kinnow', price: 2500, unit: 'per quintal', change: '+3.5%', trend: 'up', icon: '�' },
          { name: 'Guava', price: 3200, unit: 'per quintal', change: '+2.1%', trend: 'up', icon: '🥭' },
          { name: 'Pomegranate', price: 7500, unit: 'per quintal', change: '+1.8%', trend: 'up', icon: '🟥' },
          { name: 'Grapes', price: 6200, unit: 'per quintal', change: '-1.2%', trend: 'down', icon: '🍇' }
        ]
      };
      
      setMarketData(mockData);
      setLoading(false);
    }, 800);
  };

  const categories = [
    { id: 'grains', name: t('market.categories.grains'), icon: 'fas fa-seedling' },
    { id: 'vegetables', name: t('market.categories.vegetables'), icon: 'fas fa-carrot' },
    { id: 'fruits', name: t('market.categories.fruits'), icon: 'fas fa-apple-alt' }
  ];

  const currentData = marketData?.[selectedCategory] || [];

  return (
    <div className="market-container">
      <div className="market-header">
        <h2>
          <i className="fas fa-chart-line"></i>
          {t('market.title')} - Punjab
        </h2>
        <div className="market-info">
          <span className="last-updated">
            <i className="fas fa-clock"></i>
            {t('market.lastUpdated')}: {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Category Selector */}
      <div className="category-selector">
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.id)}
          >
            <i className={category.icon}></i>
            {category.name}
          </button>
        ))}
      </div>

      {/* Market Data */}
      {loading ? (
        <div className="loading-container">
          <i className="fas fa-spinner fa-spin"></i>
          <p>{t('market.loading')}</p>
        </div>
      ) : (
        <div className="market-grid">
          {currentData.map((item, index) => (
            <div key={index} className="market-card">
              <div className="item-header">
                <div className="item-info">
                  <span className="item-icon">{item.icon}</span>
                  <h3>{item.name}</h3>
                </div>
                <div className={`price-change ${item.trend}`}>
                  <i className={`fas fa-arrow-${item.trend === 'up' ? 'up' : 'down'}`}></i>
                  {item.change}
                </div>
              </div>
              
              <div className="price-info">
                <div className="current-price">
                  ₹{item.price.toLocaleString()}
                  <span className="unit">{item.unit}</span>
                </div>
              </div>


            </div>
          ))}
        </div>
      )}

      {/* Market Tips */}
      <div className="market-tips">
        <h3>
          <i className="fas fa-lightbulb"></i>
          {t('market.marketTips')}
        </h3>
        <div className="tips-grid">
          <div className="tip-card">
            <i className="fas fa-clock"></i>
            <h4>{t('market.tips.bestTime.title')}</h4>
            <p>{t('market.tips.bestTime.desc')}</p>
          </div>
          <div className="tip-card">
            <i className="fas fa-balance-scale"></i>
            <h4>{t('market.tips.quality.title')}</h4>
            <p>{t('market.tips.quality.desc')}</p>
          </div>
          <div className="tip-card">
            <i className="fas fa-truck"></i>
            <h4>{t('market.tips.transportation.title')}</h4>
            <p>{t('market.tips.transportation.desc')}</p>
          </div>
          <div className="tip-card">
            <i className="fas fa-calendar-alt"></i>
            <h4>{t('market.tips.seasonal.title')}</h4>
            <p>{t('market.tips.seasonal.desc')}</p>
          </div>
        </div>
      </div>

      <style>{`
        .market-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .market-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          flex-wrap: wrap;
          gap: 15px;
        }

        .market-header h2 {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #2E7D32;
          margin: 0;
        }

        .last-updated {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #666;
          font-size: 0.9rem;
        }

        .category-selector {
          display: flex;
          gap: 15px;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }

        .category-btn {
          background: white;
          border: 2px solid #E0E0E0;
          padding: 12px 20px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .category-btn:hover {
          border-color: #4CAF50;
          color: #4CAF50;
        }

        .category-btn.active {
          background: #4CAF50;
          color: white;
          border-color: #4CAF50;
        }

        .loading-container {
          text-align: center;
          padding: 50px;
          color: #666;
        }

        .loading-container i {
          font-size: 2rem;
          color: #4CAF50;
          margin-bottom: 15px;
        }

        .market-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .market-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          transition: transform 0.3s ease;
        }

        .market-card:hover {
          transform: translateY(-5px);
        }

        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .item-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .item-icon {
          font-size: 1.5rem;
        }

        .item-info h3 {
          margin: 0;
          color: #2E7D32;
          font-size: 1.1rem;
        }

        .price-change {
          display: flex;
          align-items: center;
          gap: 5px;
          font-weight: bold;
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 0.9rem;
        }

        .price-change.up {
          color: #4CAF50;
          background: #E8F5E8;
        }

        .price-change.down {
          color: #f44336;
          background: #FFEBEE;
        }

        .price-info {
          margin-bottom: 20px;
        }

        .current-price {
          font-size: 1.8rem;
          font-weight: bold;
          color: #2E7D32;
          display: flex;
          align-items: baseline;
          gap: 8px;
        }

        .unit {
          font-size: 0.8rem;
          color: #666;
          font-weight: normal;
        }



        .market-tips {
          background: linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%);
          padding: 30px;
          border-radius: 15px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .market-tips h3 {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #E65100;
          margin: 0 0 25px 0;
        }

        .tips-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .tip-card {
          background: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .tip-card i {
          color: #FF9800;
          font-size: 1.5rem;
          margin-bottom: 10px;
        }

        .tip-card h4 {
          color: #2E7D32;
          margin: 0 0 10px 0;
          font-size: 1rem;
        }

        .tip-card p {
          color: #666;
          margin: 0;
          line-height: 1.5;
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .market-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .category-selector {
            overflow-x: auto;
            padding-bottom: 10px;
          }

          .market-grid {
            grid-template-columns: 1fr;
          }



          .tips-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default MarketTab;