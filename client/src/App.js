import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Navbar from './components/Navbar';
import { LanguageProvider } from './contexts/LanguageContext';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('currentUser');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
  };

  return (
    <LanguageProvider>
      <Router>
        <div className="App">
          {user && token && <Navbar user={user} onLogout={handleLogout} />}
          <div className={user && token ? "dashboard-layout" : ""}>
            <div className={user && token ? "main-content" : ""}>
              <Routes>
                <Route 
                  path="/" 
                  element={
                    user && token ? (
                      <Navigate to="/dashboard" replace />
                    ) : (
                      <AuthPage onLogin={handleLogin} />
                    )
                  } 
                />
                <Route 
                  path="/dashboard" 
                  element={
                    user && token ? (
                      <Dashboard user={user} token={token} onLogout={handleLogout} />
                    ) : (
                      <Navigate to="/" replace />
                    )
                  } 
                />

              </Routes>
            </div>
          </div>
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;