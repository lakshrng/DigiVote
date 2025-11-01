import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const TopBar = () => {
  const { user } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const userInitials = user
    ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`
    : 'U';

  return (
    <div style={topBarStyle}>
      <div style={topBarContentStyle}>
        {/* Left Section */}
        <div style={leftSectionStyle}>
          <input
            type="text"
            placeholder="Search elections, candidates, or announcements..."
            style={searchInputStyle}
          />
        </div>

        {/* Right Section */}
        <div style={rightSectionStyle}>
          {/* Notifications */}
          <button 
            style={iconButtonStyle} 
            title="Notifications"
            onMouseEnter={(e) => handleIconButtonHover(e, true)}
            onMouseLeave={(e) => handleIconButtonHover(e, false)}
          >
            <span style={iconSpanStyle}>🔔</span>
          </button>

          {/* Profile */}
          <div style={profileContainerStyle}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              style={profileButtonStyle}
            >
              <div style={avatarStyle}>
                {userInitials}
              </div>
              <span style={userNameStyle}>
                {user ? `${user.first_name} ${user.last_name}` : 'User'}
              </span>
              <span style={dropdownIconStyle}>▼</span>
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <div style={dropdownMenuStyle}>
                <div style={dropdownHeaderStyle}>
                  <div style={avatarStyle}>{userInitials}</div>
                  <div>
                    <div style={dropdownUserNameStyle}>
                      {user ? `${user.first_name} ${user.last_name}` : 'User'}
                    </div>
                    <div style={dropdownUserEmailStyle}>
                      {user?.email || ''}
                    </div>
                  </div>
                </div>
                <div style={dropdownDividerStyle} />
                <button style={dropdownMenuItemStyle}>
                  <span style={dropdownItemIconStyle}>👤</span>
                  My Profile
                </button>
                <button style={dropdownMenuItemStyle}>
                  <span style={dropdownItemIconStyle}>⚙️</span>
                  Settings
                </button>
                <div style={dropdownDividerStyle} />
                <button style={dropdownMenuItemStyle}>
                  <span style={dropdownItemIconStyle}>❓</span>
                  Help & Support
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showProfileMenu && (
        <div
          style={overlayStyle}
          onClick={() => setShowProfileMenu(false)}
        />
      )}
    </div>
  );
};

const topBarStyle = {
  height: '70px',
  background: '#ffffff',
  borderBottom: '1px solid #e5e7eb',
  display: 'flex',
  alignItems: 'center',
  position: 'fixed',
  top: 0,
  left: '280px',
  right: 0,
  zIndex: 999,
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
};

const topBarContentStyle = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 32px',
  gap: '24px',
};

const leftSectionStyle = {
  flex: 1,
  maxWidth: '600px',
};

const searchInputStyle = {
  width: '100%',
  padding: '10px 16px',
  paddingLeft: '40px',
  borderRadius: '8px',
  border: '1px solid #d1d5db',
  fontSize: '14px',
  background: '#f9fafb',
  transition: 'all 0.2s ease',
  position: 'relative',
};

const rightSectionStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
};

const iconButtonStyle = {
  width: '40px',
  height: '40px',
  borderRadius: '8px',
  border: 'none',
  background: '#f9fafb',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '20px',
  transition: 'all 0.2s ease',
};

// Add hover effect via JSX onClick handlers in the component
const handleIconButtonHover = (e, isEntering) => {
  if (isEntering) {
    e.currentTarget.style.background = '#e5e7eb';
    e.currentTarget.style.transform = 'scale(1.05)';
  } else {
    e.currentTarget.style.background = '#f9fafb';
    e.currentTarget.style.transform = 'scale(1)';
  }
};

const profileContainerStyle = {
  position: 'relative',
};

const profileButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '8px 12px',
  borderRadius: '12px',
  border: '1px solid #e5e7eb',
  background: '#f9fafb',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};

const avatarStyle = {
  width: '38px',
  height: '38px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#ffffff',
  fontWeight: '600',
  fontSize: '16px',
};

const userNameStyle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#111827',
};

const dropdownIconStyle = {
  fontSize: '10px',
  color: '#6b7280',
  transition: 'transform 0.2s ease',
};

const dropdownMenuStyle = {
  position: 'absolute',
  top: 'calc(100% + 8px)',
  right: 0,
  width: '260px',
  background: '#ffffff',
  borderRadius: '12px',
  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
  border: '1px solid #e5e7eb',
  zIndex: 1000,
  overflow: 'hidden',
};

const dropdownHeaderStyle = {
  padding: '16px',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  background: '#f9fafb',
};

const dropdownUserNameStyle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#111827',
  marginBottom: '2px',
};

const dropdownUserEmailStyle = {
  fontSize: '12px',
  color: '#6b7280',
};

const dropdownDividerStyle = {
  height: '1px',
  background: '#e5e7eb',
  margin: '8px 0',
};

const dropdownMenuItemStyle = {
  width: '100%',
  padding: '12px 16px',
  background: 'transparent',
  border: 'none',
  textAlign: 'left',
  fontSize: '14px',
  color: '#374151',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  transition: 'all 0.2s ease',
};

const dropdownItemIconStyle = {
  fontSize: '18px',
  width: '20px',
};

const iconSpanStyle = {
  fontSize: '18px',
};

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 998,
};

export default TopBar;

