import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { id: 'home', label: 'Home', icon: '🏠', path: '/home' },
    { id: 'apply', label: 'Candidate Apply', icon: '📝', path: '/apply' },
    { id: 'results', label: 'Check Results', icon: '📊', path: '/results' },
    { id: 'voting', label: 'Candidate Voting', icon: '🗳️', path: '/voting' },
    { id: 'announcements', label: 'Election Announcements', icon: '📢', path: '/announcements' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div style={sidebarStyle}>
      <div style={sidebarHeaderStyle}>
        <h2 style={logoStyle}>DigiVote</h2>
      </div>
      
      <nav style={navStyle}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            style={{
              ...menuItemStyle,
              ...(isActive(item.path) ? activeMenuItemStyle : {}),
            }}
          >
            <span style={iconStyle}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div style={sidebarFooterStyle}>
        <button
          onClick={handleLogout}
          style={logoutButtonStyle}
        >
          <span style={iconStyle}>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

const sidebarStyle = {
  width: '280px',
  height: '100vh',
  background: 'linear-gradient(180deg, #1b263b 0%, #0d1b2a 100%)',
  display: 'flex',
  flexDirection: 'column',
  position: 'fixed',
  left: 0,
  top: 0,
  zIndex: 1000,
  boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
};

const sidebarHeaderStyle = {
  padding: '24px 20px',
  borderBottom: '1px solid rgba(255,255,255,0.1)',
};

const logoStyle = {
  margin: 0,
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#ffffff',
  textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
};

const navStyle = {
  flex: 1,
  padding: '20px 0',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  overflowY: 'auto',
};

const menuItemStyle = {
  width: '100%',
  padding: '14px 20px',
  background: 'transparent',
  border: 'none',
  color: 'rgba(255,255,255,0.8)',
  fontSize: '16px',
  fontWeight: '500',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  transition: 'all 0.2s ease',
  textAlign: 'left',
  margin: '0 8px',
  borderRadius: '8px',
};

const activeMenuItemStyle = {
  background: 'linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)',
  color: '#ffffff',
  boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
};

const iconStyle = {
  fontSize: '20px',
  width: '24px',
  textAlign: 'center',
};

const sidebarFooterStyle = {
  padding: '20px',
  borderTop: '1px solid rgba(255,255,255,0.1)',
};

const logoutButtonStyle = {
  width: '100%',
  padding: '14px 20px',
  background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
  border: 'none',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  borderRadius: '8px',
  transition: 'all 0.2s ease',
  boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)',
};

export default Sidebar;

