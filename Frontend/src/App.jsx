import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import SearchBar from './components/SearchBar';
import WeatherDisplay from './components/WeatherDisplay';
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
   REST API FETCH LOGIC
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

  // ===================================================================
  // GRAPHQL FETCH LOGIC
  // ===================================================================
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

  return (
    <Router>
      <div className="app-container">
        <header className="app-header">
          <h1>Weather Forecast System</h1>
        </header>

        {/* Real-Time WebSocket Alert Banner  */}
        {realTimeAlert && hasSearched && !isAlertDismissed && (
          <div style={{ 
            backgroundColor: '#fff3cd', 
            padding: '16px 20px', 
            borderRadius: '8px', 
            marginBottom: '25px', 
            color: '#856404', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            borderLeft: '5px solid #ffa500',
            fontWeight: '500',
            fontSize: '15px',
            animation: 'slideDown 0.5s ease-out'
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
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#856404' }}
            >
              ✖
            </button>
          </div>
        )}
        
        {/* Navigation */}
        <nav className="nav-links">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/about">About</NavLink>
        </nav>

        <Routes>
          {/* Main Home Route with Search and Display */}
          <Route path="/" element={
            <main>
              <SearchBar onSearch={handleSearch} />
              
              {loading && <p className="loading-text">Fetching live weather...</p>}
              {error && <p className="error-text">{error}</p>}
              {weatherData && !loading && <WeatherDisplay data={weatherData} />}
            </main>
          } />
          
          {/* About Route */}
          <Route path="/about" element={
            <div className="weather-card">
              <h2>About This App</h2>
              <p>A full-stack Weather Forecast System built with React and Node.js.</p>
              <p>Features: GraphQL, WebSockets (Real-Time), JWT, OAuth2, and RESTful CRUD.</p>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;