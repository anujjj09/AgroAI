import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const Navbar = ({ user, onLogout }) => {
  const { t, language, changeLanguage } = useLanguage();

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/dashboard" className="nav-logo">
          <i className="fas fa-seedling"></i>
          {t('nav.brand')}
        </Link>
        
        <div className="nav-links">
          <Link 
            to="/dashboard" 
            className="nav-link active"
          >
            <i className="fas fa-tachometer-alt"></i>
            {t('nav.dashboard')}
          </Link>
        </div>

        <div className="nav-user">
          <div className="language-selector">
            <select 
              value={language} 
              onChange={(e) => changeLanguage(e.target.value)}
              className="language-select"
            >
              <option value="en">{t('languages.en')}</option>
              <option value="hi">{t('languages.hi')}</option>
              <option value="pa">{t('languages.pa')}</option>
            </select>
          </div>
          <div className="user-info">
            <i className="fas fa-user-circle"></i>
            <span>{user?.name || 'Farmer'}</span>
            <small>{user?.district || 'Punjab'}</small>
          </div>
          <button onClick={onLogout} className="logout-btn">
            <i className="fas fa-sign-out-alt"></i>
            {t('nav.logout')}
          </button>
        </div>
      </div>

      <style>{`
        .navbar {
          background: linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%);
          padding: 0;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          height: 70px;
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          color: white;
          text-decoration: none;
          font-weight: bold;
          font-size: 1.3rem;
        }

        .nav-logo:hover {
          color: #C8E6C9;
        }

        .nav-links {
          display: flex;
          gap: 30px;
          flex: 1;
          justify-content: center;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 8px;
          color: white;
          text-decoration: none;
          padding: 10px 15px;
          border-radius: 6px;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .nav-link:hover {
          background: rgba(255,255,255,0.1);
          color: #C8E6C9;
        }

        .nav-link.active {
          background: rgba(255,255,255,0.2);
          color: #E8F5E8;
        }

        .nav-user {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .language-selector {
          display: flex;
          align-items: center;
        }

        .language-select {
          background: rgba(255,255,255,0.1);
          color: white;
          border: 1px solid rgba(255,255,255,0.3);
          padding: 6px 10px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .language-select option {
          background: #2E7D32;
          color: white;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 8px;
          color: white;
        }

        .user-info small {
          opacity: 0.8;
          font-size: 0.8rem;
        }

        .logout-btn {
          background: rgba(255,255,255,0.1);
          color: white;
          border: 1px solid rgba(255,255,255,0.3);
          padding: 8px 15px;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .logout-btn:hover {
          background: rgba(255,255,255,0.2);
          border-color: rgba(255,255,255,0.5);
        }

        @media (max-width: 768px) {
          .nav-links {
            gap: 15px;
          }
          
          .nav-link {
            padding: 8px 10px;
            font-size: 0.9rem;
          }
          
          .nav-link span {
            display: none;
          }
          
          .user-info span,
          .user-info small {
            display: none;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;