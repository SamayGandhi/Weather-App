import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import SearchBar from './components/SearchBar';
import WeatherDisplay from './components/WeatherDisplay';
import FavoritesList from './components/FavoritesList';
import NotificationSettings from './components/NotificationSettings';
import './App.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function App() {
  // --- STATE MANAGEMENT ---
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Real-time alert states
  const [realTimeAlert, setRealTimeAlert] = useState('');
  const [isAlertDismissed, setIsAlertDismissed] = useState(false);
  const [hasSearched, setHasSearched] = useState(false); 

  // Auth (Google Login) State
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  const [refreshFavorites, setRefreshFavorites] = useState(false);

  // ===================================================================
  // Authentication & Token Capture Logic
  // ===================================================================
  useEffect(() => {
    // Check URL for token after Google Login redirect
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');

    if (urlToken) {
      // Save token to local storage
      localStorage.setItem('token', urlToken);
      setToken(urlToken);
      
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  const handleLogin = () => {
    // Redirect user to backend Google Auth route
    window.location.href = `${BACKEND_URL}/auth/google`;
  };

  const handleLogout = () => {
    // Clear token and logout
    localStorage.removeItem('token');
    setToken(null);
  };

  // ===================================================================
  // WebSockets Connection
  // ===================================================================
  useEffect(() => {
    // Connect to backend WebSocket server using dynamic URL
    const socket = io(BACKEND_URL);

    // Listen for 'weatherAlert' events sent from the backend
    socket.on('weatherAlert', (data) => {
      setRealTimeAlert(data.message);
      
      // Auto-hide the alert after 8 seconds so it doesn't stay forever
      setTimeout(() => setRealTimeAlert(''), 8000);
    });

    // Cleanup connection when component unmounts
    return () => socket.disconnect();
  }, []);

  /*
  ===================================================================
   REST API FETCH LOGIC (Step 1)
  ===================================================================
  const handleSearch = async (cityName) => {
    if (!cityName.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get(`${BACKEND_URL}/api/weather/${cityName}`);
      setWeatherData(response.data);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError('City not found. Please try a valid city name.');
      } else {
        setError('Failed to fetch weather data. Backend might be offline.');
      }
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };
  */

  /*
  ===================================================================
   GRAPHQL FETCH LOGIC (Step 2)
  ===================================================================
  const handleSearch = async (cityName) => {
    if (!cityName.trim()) return;
    
    setLoading(true);
    setError('');
    setIsAlertDismissed(false);
    setHasSearched(true); 
    
    try {
      // 1. Define the exact GraphQL Query
      const graphqlQuery = {
        query: `
          query {
            getWeather(city: "${cityName}") {
              city
              temperature
              condition
              humidity
              windSpeed
            }
          }
        `
      };

      // 2. Send POST request to GraphQL endpoint using dynamic URL
      const response = await axios.post(`${BACKEND_URL}/graphql`, graphqlQuery);
      
      // 3. Handle GraphQL specific error structure
      if (response.data.errors) {
        setError('City not found. Please try a valid city name.');
        setWeatherData(null);
      } else {
        // Data comes nested inside response.data.data.getWeather
        setWeatherData(response.data.data.getWeather);
      }
    } catch (err) {
      setError('Failed to fetch weather data. Backend might be offline.');
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };
  */

  // ===================================================================
  // REDIS (FAST CACHE) API FETCH LOGIC (step 3)
  // ===================================================================
  const handleSearch = async (cityName) => {
    if (!cityName.trim()) return;
    
    setLoading(true);
    setError('');
    setIsAlertDismissed(false);
    setHasSearched(true); 
    
    try {
       const response = await axios.get(`${BACKEND_URL}/api/cache-weather/${cityName}`);
       const weatherDetails = response.data.data ? response.data.data : response.data;
       
       setWeatherData({
          source: response.data.source || "Live External API",
          ...weatherDetails
      });
    } catch (err) {
      setError(`Oops! We couldn't find weather data for "${cityName}". Please check the spelling or try adding the country name (e.g., "${cityName}, IN").`);
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  const selectFavoriteCity = (cityName) => {
    handleSearch(cityName);
  };

  const getUserData = () => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1])); 
      return payload;
    } catch (e) {
      return null;
    }
  };
  const user = getUserData();

  return (
    <Router>
      <div className="app-container" style={{ padding: '0 15px' }}>
        
        <header className="premium-header-mobile" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '20px 30px', 
          background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', 
          color: 'white',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          borderRadius: '0 0 24px 24px',
          marginBottom: '35px',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '28px' }}>⛅</span>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700', letterSpacing: '0.5px' }}>
              Weather Forecast
            </h1>
          </div>
          
          <div className="header-auth-section">
            {token ? (
              <div className="auth-user-wrap" style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '12px', opacity: 0.85 }}>Welcome back,</span>
                  <strong style={{ fontSize: '15px', letterSpacing: '0.3px' }}>{user?.name || user?.displayName || 'User'}</strong>
                </div>
                
                <button 
                  onClick={handleLogout} 
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.15)', 
                    color: 'white', 
                    border: '1px solid rgba(255, 255, 255, 0.4)', 
                    padding: '10px 22px', 
                    borderRadius: '25px', 
                    cursor: 'pointer', 
                    fontWeight: '700',
                    fontSize: '14px',
                    transition: 'all 0.3s',
                    backdropFilter: 'blur(5px)'
                  }}
                  onMouseOver={(e) => {
                      e.target.style.backgroundColor = '#ff4d4f';
                      e.target.style.borderColor = '#ff4d4f';
                      e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                      e.target.style.transform = 'translateY(0)';
                  }}
                >
                  Logout 
                </button>
              </div>
            ) : (
              <button 
                onClick={handleLogin} 
                style={{ 
                  backgroundColor: 'white', 
                  color: '#1e3c72', 
                  border: 'none', 
                  padding: '10px 24px', 
                  borderRadius: '30px', 
                  cursor: 'pointer', 
                  fontWeight: '800',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
                }}
                onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                }}
              >
                <img 
                  src="https://developers.google.com/identity/images/g-logo.png" 
                  alt="Google" 
                  style={{ width: '18px' }}
                />
                Sign in with Google
              </button>
            )}
          </div>
        </header>

        {realTimeAlert && hasSearched && !isAlertDismissed && (
          <div style={{ 
            backgroundColor: '#fffbeb', 
            padding: '16px 20px', 
            borderRadius: '12px', 
            marginBottom: '25px', 
            color: '#92400e', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 8px 20px rgba(217, 119, 6, 0.15)',
            border: '1px solid #fde68a',
            borderLeft: '5px solid #f59e0b',
            fontWeight: '600',
            fontSize: '15px',
            animation: 'slideDownFade 0.5s ease-out'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '20px' }}>⚠️</span>
              <span>{realTimeAlert}</span>
            </div>
            <button 
              onClick={() => {
                setRealTimeAlert('');
                setIsAlertDismissed(true);
              }} 
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#b45309' }}
            >
              ✖
            </button>
          </div>
        )}
        
        <nav className="nav-links premium-nav" style={{ flexWrap: 'wrap', display: 'flex', justifyContent: 'center' }}>
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/about">About</NavLink>
          {token && <NavLink to="/favorites">My Favorites</NavLink>}
          {token && <NavLink to="/settings">Settings</NavLink>}
        </nav>

        <Routes>
          <Route path="/" element={
            <main style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <SearchBar onSearch={handleSearch} />
              
              {loading && <p className="loading-text" style={{ textAlign: 'center', marginTop: '20px', fontWeight: 'bold', color: '#555' }}>Fetching live weather...</p>}
              
              {error && (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '30px 20px', 
                  background: '#fff0f0', 
                  borderRadius: '16px', 
                  color: '#d32f2f', 
                  margin: '20px auto', 
                  maxWidth: '500px', 
                  boxShadow: '0 8px 24px rgba(220, 53, 69, 0.1)',
                  border: '1px solid #ffcdd2',
                  animation: 'slideUpFade 0.4s ease-out forwards'
                }}>
                  <span style={{ fontSize: '48px', display: 'block', marginBottom: '15px' }}>🤷‍♂️</span>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', fontWeight: '800' }}>City Not Found</h3>
                  <p style={{ margin: 0, fontWeight: '500', lineHeight: '1.5', color: '#5a1015' }}>{error}</p>
                </div>
              )}

              {weatherData && !loading && (
                <WeatherDisplay 
                  data={weatherData} 
                  onSaveSuccess={() => setRefreshFavorites(!refreshFavorites)} 
                />
              )}
            </main>
          } />
          
          <Route path="/about" element={
            <div className="premium-glass-card" style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '32px',
        padding: '40px 30px',
        boxShadow: '0 12px 35px rgba(0,0,0,0.06), inset 0 2px 4px rgba(255,255,255,0.7)',
        border: '1px solid rgba(226, 232, 240, 0.9)',
        width: '100%',
        maxWidth: '650px',
        margin: '20px auto',
        textAlign: 'center',
        boxSizing: 'border-box',
        animation: 'slideUpFade 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards'
      }}>
        <h2 style={{ fontSize: '28px', color: '#0f172a', fontWeight: '800', marginBottom: '20px' }}>
          About This App
        </h2>
        <p style={{ fontSize: '16px', color: '#475569', lineHeight: '1.7', fontWeight: '500', marginBottom: '25px' }}>
          A full-stack Weather Forecast System built with modern web technologies like React and Node.js.
        </p>
        
        <div style={{ background: '#f8fafc', padding: '25px', borderRadius: '24px', border: '1px dashed #cbd5e1' }}>
          <h3 style={{ fontSize: '15px', color: '#334155', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>
            Core Features
          </h3>
          <p style={{ fontSize: '15px', color: '#64748b', lineHeight: '1.8', fontWeight: '600', margin: 0 }}>
            Redis Caching, Message Queues (Twilio/MailHog), MongoDB, OAuth2, WebSockets, and GraphQL.
          </p>
        </div>
      </div>
            } />

            <Route path="/favorites" element={
              <FavoritesList 
                onSelectCity={selectFavoriteCity} 
                refreshTrigger={refreshFavorites} 
              />
            } />
            <Route path="/settings" element={<NotificationSettings />} />
          </Routes>
        </div>
    </Router>
  );
}

export default App;