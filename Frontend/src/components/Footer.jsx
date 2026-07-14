import React from 'react';

const Footer = () => {
  return (
    <footer style={{
      marginTop: 'auto', 
      padding: '20px 15px',
      textAlign: 'center',
      background: 'rgba(255, 255, 255, 0.6)',
      backdropFilter: 'blur(10px)',
      borderTop: '1px solid rgba(226, 232, 240, 0.8)',
      borderRadius: '24px 24px 0 0',
      width: '100%',
      boxSizing: 'border-box',
      boxShadow: '0 -4px 20px rgba(0,0,0,0.03)'
    }}>
      <p style={{ 
        margin: '0 0 10px 0', 
        color: '#334155', 
        fontSize: '14px', 
        fontWeight: '600' 
      }}>
        Designed & Developed by <span style={{ color: '#1e3c72', fontWeight: '800' }}>Samay Gandhi</span> 💻
      </p>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '20px', 
        fontSize: '13px',
        flexWrap: 'wrap' 
      }}>
        <a 
          href="https://github.com/your-github-username" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ color: '#0f172a', textDecoration: 'none', fontWeight: '700', transition: 'color 0.2s' }}
        >
          GitHub 
        </a>
        <span style={{ color: '#cbd5e1' }}>|</span>
        <a 
          href="https://linkedin.com/in/your-linkedin-username" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ color: '#0f172a', textDecoration: 'none', fontWeight: '700', transition: 'color 0.2s' }}
        >
          LinkedIn
        </a>
      </div>
    </footer>
  );
};

export default Footer;