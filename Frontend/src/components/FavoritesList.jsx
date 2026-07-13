import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const FavoritesList = ({ onSelectCity, refreshTrigger }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchFavorites = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setFavorites([]);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/favorites`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setFavorites(response.data);
    } catch (error) {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        localStorage.removeItem('token');
        window.location.href = '/'; 
      } else {
            console.error("Error fetching favorites:", error);
        }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [refreshTrigger]);

  const handleDelete = async (e, cityId) => {
    e.stopPropagation(); 
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await axios.delete(`${BACKEND_URL}/api/favorites/${cityId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setFavorites(favorites.filter(fav => fav.id !== cityId));
    } catch (error) {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            alert("Your session has expired. Please login again.");
            localStorage.removeItem('token');
            window.location.reload();
        } else {
            console.error("Error deleting favorite:", error);
            alert("Failed to delete city.");
        }
    }
  };

  const token = localStorage.getItem('token');
  if (!token) return null; 

  return (
    <div className="premium-glass-card" style={{ 
      width: '100%', 
      maxWidth: '650px', 
      margin: '20px auto',
      boxSizing: 'border-box'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        borderBottom: '2px solid rgba(0,0,0,0.1)', 
        paddingBottom: '20px', 
        marginBottom: '25px' 
      }}>
        <h3 style={{ margin: 0, color: '#0f172a', fontWeight: '800', fontSize: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          ⭐ Your Saved Cities
        </h3>
      </div>

      {loading && (
        <p style={{ textAlign: 'center', color: '#64748b', fontWeight: '700', margin: '30px 0', fontSize: '16px' }}>
          ⏳ Loading your favorites...
        </p>
      )}
      
      {!loading && favorites.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 15px', background: 'rgba(255,255,255,0.4)', borderRadius: '20px', border: '1px dashed #cbd5e1' }}>
          <span style={{ fontSize: '36px', display: 'block', marginBottom: '15px' }}>🏙️</span>
          <p style={{ color: '#64748b', fontWeight: '600', margin: 0, fontSize: '15px' }}>
            No cities saved yet. Search and click "Save City" to add them here!
          </p>
        </div>
      )}

      {/*  Mobile-Friendly Responsive Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
        gap: '16px' 
      }}>
        {favorites.map((fav) => (
          <div 
            key={fav.id}
            onClick={() => {
              onSelectCity(fav.name);
              navigate('/');  
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.7)',
              border: '1px solid rgba(255,255,255,0.9)',
              padding: '18px 20px',
              borderRadius: '20px',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 4px 10px rgba(0,0,0,0.02)',
              transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.06)';
              e.currentTarget.style.borderColor = '#bfdbfe';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.02)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.9)';
            }}
          >
            <span style={{ fontWeight: '800', color: '#1e293b', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '20px', color: '#ef4444' }}>📍</span> {fav.name}
            </span>
            
            <button 
              onClick={(e) => handleDelete(e, fav.id)}
              style={{
                background: '#fff1f2',
                border: '1px solid #ffe4e6',
                color: '#e11d48',
                cursor: 'pointer',
                fontSize: '13px',
                padding: '6px 14px',
                borderRadius: '12px',
                transition: 'all 0.2s',
                fontWeight: '700'
              }}
              onMouseOver={(e) => {
                  e.target.style.background = '#ffe4e6';
                  e.target.style.borderColor = '#fecdd3';
              }}
              onMouseOut={(e) => {
                  e.target.style.background = '#fff1f2';
                  e.target.style.borderColor = '#ffe4e6';
              }}
              title="Remove City"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FavoritesList;