import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [customAlert, setCustomAlert] = useState('');

  useEffect(() => {
    const fetchCities = async () => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        setShowDropdown(false);
        return;
      }
      
      setLoading(true);
      setCustomAlert('');
      
      try {
        const response = await axios.get(`${BACKEND_URL}/api/cities?q=${query}`);
        setSuggestions(response.data);
        setShowDropdown(true);
      } catch (error) {
        console.error("Error fetching cities", error);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchCities();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleSelect = (city) => {
    const exactLocation = city.state 
      ? `${city.name}, ${city.state}, ${city.country}` 
      : `${city.name}, ${city.country}`;
    
    onSearch(exactLocation);
    
    setQuery(''); 
    setShowDropdown(false);
    setSuggestions([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    onSearch(query.trim());

    setQuery('');
    setShowDropdown(false);
    setSuggestions([]);
  };

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '600px', margin: '0 auto 30px auto', zIndex: 50 }}>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', position: 'relative', width: '100%' }}>
          <input 
            type="text" 
            placeholder="Search any real city (e.g., Ahmedabad)..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '16px 20px',
              borderRadius: '30px',
              border: '2px solid #e2e8f0',
              fontSize: '16px',
              outline: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              transition: 'all 0.3s ease',
              backgroundColor: '#ffffff',
              color: '#333'
            }}
            onFocus={(e) => {
                e.target.style.borderColor = '#2a5298';
                e.target.style.boxShadow = '0 6px 15px rgba(42, 82, 152, 0.15)';
            }}
            onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                setTimeout(() => setShowDropdown(false), 250);
            }}
          />
          {loading && (
            <span style={{ position: 'absolute', right: '20px', fontSize: '18px', animation: 'spin 1s linear infinite' }}>
              ⏳
            </span>
          )}
        </div>
      </form>

      {/* CUSTOM ERROR MESSAGE UI */}
      {customAlert && (
        <div style={{
          marginTop: '10px',
          padding: '12px 15px',
          backgroundColor: '#fff3cd',
          color: '#856404',
          borderRadius: '8px',
          borderLeft: '4px solid #ffa500',
          fontSize: '14px',
          fontWeight: '600',
          animation: 'slideDown 0.3s ease',
          textAlign: 'left',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
        }}>
          {customAlert}
        </div>
      )}

      {/* Suggestions Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <ul style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
          listStyle: 'none',
          padding: '10px 0',
          margin: '10px 0 0 0',
          maxHeight: '300px',
          overflowY: 'auto'
        }}>
          {suggestions.map((city, index) => (
            <li 
              key={`${city.name}-${city.state}-${city.country}-${index}`}
              onClick={() => handleSelect(city)}
              style={{
                padding: '12px 20px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #f1f5f9',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                <span style={{ fontWeight: '700', fontSize: '16px', color: '#1e293b' }}>
                  📍 {city.name}
                </span>
                <span style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                  {city.state ? `${city.state}, ` : ''}{city.country}
                </span>
              </div>
              <span style={{ backgroundColor: '#e2e8f0', color: '#475569', padding: '4px 8px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>
                {city.country}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;