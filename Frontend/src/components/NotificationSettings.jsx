import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const NotificationSettings = () => {
  const [phone, setPhone] = useState('');
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await axios.get(`${BACKEND_URL}/api/settings`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        setPhone(response.data.phone || '');
        setSmsAlerts(response.data.smsAlerts || false);
        setEmailAlerts(response.data.emailAlerts || false);
      } catch (error) {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            localStorage.removeItem('token');
            window.location.reload();
        } else {
            console.error("Error fetching settings:", error);
        }
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
        setMessage("Please login to save settings.");
        return;
    }

    setLoading(true);
    setMessage('');

    try {
      await axios.put(`${BACKEND_URL}/api/settings`, 
        { phone, smsAlerts, emailAlerts },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setMessage('✅ Settings saved successfully!');
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          alert("Your session has expired. Please login again.");
          localStorage.removeItem('token');
          window.location.reload();
    }  else {
    if (error.response && error.response.data && error.response.data.message) {
        setMessage(`❌ ${error.response.data.message}`);
    } else {
        setMessage('❌ Failed to save settings.');
    }
}
    } finally {
      setLoading(false);
    }
  };

  const token = localStorage.getItem('token');
  if (!token) {
      return (
          <div style={{ textAlign: 'center', marginTop: '40px', padding: '20px' }}>
              <h3>Please login to view Notification Settings</h3>
          </div>
      );
  }

  return (
    <div className="premium-glass-card" style={{
      width: '100%',
      maxWidth: '550px',
      margin: '20px auto',
      boxSizing: 'border-box'
    }}>
      <h2 style={{ margin: '0 0 30px 0', fontSize: '26px', color: '#0f172a', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px' }}>
        🔔 Alert Settings
      </h2>

      {/* Settings Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
        
        {/* Email Alerts */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '20px', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', color: '#1e293b', fontSize: '16px' }}>
              📧 Email Alerts
            </div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', fontWeight: '500' }}>Get severe weather warnings on your email.</div>
          </div>
          <input 
            type="checkbox" 
            checked={emailAlerts} 
            onChange={(e) => setEmailAlerts(e.target.checked)}
            style={{ width: '22px', height: '22px', cursor: 'pointer', accentColor: '#2563eb' }}
          />
        </div>

        {/* SMS Alerts */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '20px', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', color: '#1e293b', fontSize: '16px' }}>
              📱 SMS Alerts
            </div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', fontWeight: '500' }}>Instant SMS for extreme weather.</div>
          </div>
          <input 
            type="checkbox" 
            checked={smsAlerts} 
            onChange={(e) => setSmsAlerts(e.target.checked)}
            style={{ width: '22px', height: '22px', cursor: 'pointer', accentColor: '#2563eb' }}
          />
        </div>

        {/* Phone Input Card */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.5)', 
          padding: '20px', 
          borderRadius: '20px', 
          borderLeft: '4px solid #3b82f6',
          borderTop: '1px solid rgba(255,255,255,0.7)',
          borderRight: '1px solid rgba(255,255,255,0.7)',
          borderBottom: '1px solid rgba(255,255,255,0.7)',
        }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#334155', marginBottom: '10px' }}>
            Mobile Number (with Country Code)
          </label>
          <input 
            type="text" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+917990059807"
            style={{
              width: '100%',
              padding: '12px 15px',
              borderRadius: '12px',
              border: '1px solid #cbd5e1',
              fontSize: '16px',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s',
              fontFamily: 'inherit',
              fontWeight: '600'
            }}
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
          />
          <div style={{ fontSize: '12px', color: '#475569', marginTop: '8px', fontWeight: '600' }}>Example: +91 for India</div>
        </div>

        <button 
          onClick={handleSave} 
          disabled={loading}
          style={{
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            color: 'white',
            padding: '16px',
            borderRadius: '16px',
            border: 'none',
            fontSize: '16px',
            fontWeight: '800',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 8px 20px rgba(37, 99, 235, 0.25)',
            transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
            width: '100%',
            marginTop: '10px'
          }}
          onMouseOver={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)', e.currentTarget.style.boxShadow = '0 12px 25px rgba(37, 99, 235, 0.35)')}
          onMouseOut={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)', e.currentTarget.style.boxShadow = '0 8px 20px rgba(37, 99, 235, 0.25)')}
        >
          {loading ? '⏳ Saving...' : '💾 Save Settings'}
        </button>

        {message && (
          <div style={{ 
            marginTop: '15px', 
            padding: '14px', 
            borderRadius: '12px', 
            background: message.includes('❌') ? '#fef2f2' : '#f0fdf4',
            color: message.includes('❌') ? '#b91c1c' : '#15803d',
            textAlign: 'center',
            fontWeight: '700',
            border: `1px solid ${message.includes('❌') ? '#fecaca' : '#bbf7d0'}`,
            fontSize: '14px'
          }}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationSettings;