import React from 'react';
import Sidebar from '../Sidebar';
import TopBar from '../TopBar';

const Announcements = () => {
  return (
    <div style={layoutStyle}>
      <Sidebar />
      <div style={mainContentStyle}>
        <TopBar />
        <div style={contentWrapperStyle}>
          <div style={containerStyle}>
            <h1 style={titleStyle}>📢 Election Announcements</h1>
            <p style={subtitleStyle}>Stay updated with the latest election news and updates</p>
            <div style={comingSoonStyle}>
              <span style={comingSoonIconStyle}>🚧</span>
              <p>Coming Soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const layoutStyle = {
  display: 'flex',
  minHeight: '100vh',
  background: '#f9fafb',
};

const mainContentStyle = {
  flex: 1,
  marginLeft: '280px',
  display: 'flex',
  flexDirection: 'column',
};

const contentWrapperStyle = {
  marginTop: '70px',
  padding: '32px',
  maxWidth: '1400px',
  width: '100%',
  margin: '70px auto 0',
};

const containerStyle = {
  background: '#ffffff',
  borderRadius: '12px',
  padding: '48px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  border: '1px solid #e5e7eb',
  textAlign: 'center',
};

const titleStyle = {
  fontSize: '32px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0 0 12px',
};

const subtitleStyle = {
  fontSize: '16px',
  color: '#6b7280',
  margin: '0 0 32px',
};

const comingSoonStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '16px',
  padding: '48px',
};

const comingSoonIconStyle = {
  fontSize: '64px',
};

export default Announcements;

