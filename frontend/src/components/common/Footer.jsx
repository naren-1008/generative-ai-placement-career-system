import React from 'react';

const Footer = () => {
  return (
    <footer style={{
      padding: '16px 28px',
      borderTop: '1px solid var(--border-color)',
      backgroundColor: '#ffffff',
      fontSize: '0.8125rem',
      color: 'var(--text-muted)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '12px'
    }}>
      <div>
        <strong style={{ color: 'var(--text-main)' }}>Generative AI Placement & Career System</strong> &copy; {new Date().getFullYear()} — Academic Final-Year Engineering Project
      </div>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <span>Status: <strong style={{ color: 'var(--success)' }}>Operational</strong></span>
        <span>Version 1.0.0</span>
      </div>
    </footer>
  );
};

export default Footer;
