import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const WeatherDisplay = ({ data, onSaveSuccess }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false); 

  const getWeatherIcon = (condition) => {
    if (!condition) return '🌤️';
    const lowerCond = condition.toLowerCase();
    
    if (lowerCond.includes('cloud')) return '☁️';
    if (lowerCond.includes('rain') || lowerCond.includes('drizzle')) return '🌧️';
    if (lowerCond.includes('clear')) return '☀️';
    if (lowerCond.includes('thunder') || lowerCond.includes('storm')) return '⛈️';
    if (lowerCond.includes('snow')) return '❄️';
    if (lowerCond.includes('mist') || lowerCond.includes('haze') || lowerCond.includes('fog')) return '🌫️';
    
    return '🌤️'; 
  };

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!data) return;
      
      const token = localStorage.getItem('token');
      if (!token) {
          setIsFavorite(false);
          return;
      }

      try {
        const response = await axios.get(`${BACKEND_URL}/api/favorites`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const currentCity = data.city || data.name;
        const isSaved = response.data.some(
            fav => fav.name.toLowerCase() === currentCity.toLowerCase()
        );
        
        setIsFavorite(isSaved);
      } catch (error) {
        console.error("Error checking favorite status", error);
      }
    };

    checkFavoriteStatus();
  }, [data]);

  const handleToggleFavorite = async () => {
    const cityName = data.city || data.name;
    const token = localStorage.getItem('token');
    
    if (!token) {
        alert("Please login with Google to save favorites!");
        return;
    }

    setLoading(true);
    try {
        if (!isFavorite) {
            await axios.post(`${BACKEND_URL}/api/favorites`, 
                { name: cityName }, 
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            setIsFavorite(true); 
            if (onSaveSuccess) onSaveSuccess();
        }
    } catch (error) {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            alert("Your session has expired for security reasons. Please login again.");
            localStorage.removeItem('token');
            window.location.reload(); 
        } else if (error.response && error.response.status === 409) {
            setIsFavorite(true); 
        } else {
            console.error("Error updating favorite", error);
            alert("Failed to add favorite. Backend issue.");
        }
    } finally {
        setLoading(false);
    }
  };

  if (!data) return null;

  const displayHumidity = data.humidity !== undefined ? data.humidity : (data.main && data.main.humidity);
  const displayWindSpeed = data.windSpeed !== undefined ? data.windSpeed : (data.wind_speed !== undefined ? data.wind_speed : (data.wind && data.wind.speed));

  return (
    <div className="premium-glass-card" style={{
      width: '100%',
      maxWidth: '650px',
      margin: '20px auto',
      boxSizing: 'border-box'
    }}>
      
      {/* Cache Status Badge */}
      <div style={{ textAlign: 'center', marginBottom: '25px' }}>
        {data.source && (
            <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: data.source === 'Redis Cache' ? 'linear-gradient(135deg, #dcfce7, #bbf7d0)' : 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
            color: data.source === 'Redis Cache' ? '#166534' : '#3730a3',
            padding: '6px 16px',
            borderRadius: '30px',
            fontSize: '12px',
            fontWeight: '700',
            boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
            letterSpacing: '0.3px'
            }}>
            {data.source === 'Redis Cache' ? '⚡ Lightning Fast: Redis Cache' : '☁️ Fetched from Live External API'}
            </div>
        )}
      </div>

      {/* Header: City & Add to Favorite Button */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        flexWrap: 'wrap', 
        gap: '15px'
      }}>
        <h2 style={{ margin: 0, fontSize: '28px', color: '#0f172a', fontWeight: '800', letterSpacing: '-0.5px' }}>
          {data.city || data.name}
        </h2>
        
        <button 
          onClick={handleToggleFavorite}
          disabled={isFavorite || loading}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            background: isFavorite ? '#fff1f2' : (isHovered ? '#eff6ff' : '#ffffff'),
            border: isFavorite ? '1px solid #fecdd3' : (isHovered ? '1px solid #bfdbfe' : '1px solid #e2e8f0'),
            color: isFavorite ? '#e11d48' : (isHovered ? '#2563eb' : '#475569'),
            padding: '10px 22px',
            borderRadius: '30px',
            cursor: isFavorite ? 'default' : 'pointer',
            fontWeight: '700',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: (isHovered && !isFavorite) ? '0 6px 15px rgba(37,99,235,0.15)' : '0 2px 5px rgba(0,0,0,0.03)',
            transform: (isHovered && !isFavorite) ? 'translateY(-2px)' : 'translateY(0)',
            transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
            outline: 'none'
          }}
        >
          {loading ? '⏳ Saving...' : (isFavorite ? '❤️ Saved' : '🤍 Save City')}
        </button>
      </div>
      
      {/* Main Temperature & Condition */}
      <div style={{ textAlign: 'center', margin: '40px 0' }}>
        <h1 style={{ fontSize: '76px', margin: '0', color: '#0f172a', fontWeight: '800', lineHeight: '1', letterSpacing: '-2px' }}>
          {data.temperature}
        </h1>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '12px' }}>
          <p style={{ fontSize: '22px', color: '#64748b', margin: '0', fontWeight: '600', textTransform: 'capitalize' }}>
            {data.condition}
          </p>
          <span style={{ fontSize: '26px' }}>{getWeatherIcon(data.condition)}</span>
        </div>
      </div>
      
      {/* Weather Details Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', 
        gap: '15px', 
        marginBottom: '40px'
      }}>
        {[
          { icon: '💧', label: 'Humidity', value: displayHumidity !== undefined ? `${displayHumidity}` : 'N/A' },
          { icon: '💨', label: 'Wind Speed', value: displayWindSpeed !== undefined ? `${displayWindSpeed}` : 'N/A' },
          { icon: getWeatherIcon(data.condition), label: 'Condition', value: data.condition }
        ].map((item, index) => (
          <div key={index} style={{ 
            background: 'rgba(255, 255, 255, 0.5)', 
            backdropFilter: 'blur(10px)',
            padding: '20px 10px', 
            borderRadius: '24px', 
            textAlign: 'center', 
            border: '1px solid rgba(255,255,255,0.6)',
            boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
          }}>
              <span style={{ fontSize: '28px', display: 'block', marginBottom: '10px' }}>{item.icon}</span>
              <strong style={{ fontSize: '18px', color: '#1e293b', display: 'block', fontWeight: '700' }}>
                  {item.value}
              </strong>
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '6px', fontWeight: '600' }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* DYNAMIC 3-DAY FORECAST SECTION */}
      {data.forecast && data.forecast.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3 style={{ textAlign: 'left', marginBottom: '20px', color: '#334155', fontSize: '18px', fontWeight: '800' }}>
            3-Day Forecast
          </h3>
          <div className="mobile-scroll" style={{ 
            display: 'flex', 
            gap: '15px', 
            overflowX: 'auto', 
            paddingBottom: '12px'
          }}>
            {data.forecast.map((f, i) => (
              <div key={i} style={{ 
                flex: '1', 
                minWidth: '105px',
                background: 'rgba(255, 255, 255, 0.6)', 
                backdropFilter: 'blur(5px)',
                padding: '20px 15px', 
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.7)',
                textAlign: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.02)',
                transition: 'transform 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {f.day}
                </div>
                <div style={{ fontSize: '36px', margin: '15px 0' }}>
                  {getWeatherIcon(f.condition)}
                </div>
                <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '20px' }}>
                  {f.temp}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default WeatherDisplay;