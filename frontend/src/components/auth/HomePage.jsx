import React from 'react';
import Sidebar from '../Sidebar';
import TopBar from '../TopBar';

const HomePage = () => {
  return (
    <div style={layoutStyle}>
      <Sidebar />
      <div style={mainContentStyle}>
        <TopBar />
        <div style={contentWrapperStyle}>
          {/* Hero Section */}
          <div style={heroSectionStyle}>
            <h1 style={heroTitleStyle}>Welcome to DigiVote</h1>
            <p style={heroSubtitleStyle}>
              Your digital platform for democratic participation and transparent elections
            </p>
          </div>

          {/* Announcements Section */}
          <div style={sectionStyle}>
            <div style={sectionHeaderStyle}>
              <h2 style={sectionTitleStyle}>📢 Latest Announcements</h2>
              <span style={updateBadgeStyle}>Updated Today</span>
            </div>
            <div style={announcementsGridStyle}>
              <div style={cardStyle}>
                <div style={cardIconStyle}>🎓</div>
                <h3 style={cardTitleStyle}>Election Registration Open</h3>
                <p style={cardDescriptionStyle}>
                  Student government elections for the academic year 2024-25 are now open for candidate registration.
                </p>
                <span style={cardDateStyle}>3 hours ago</span>
              </div>

              <div style={cardStyle}>
                <div style={cardIconStyle}>🗳️</div>
                <h3 style={cardTitleStyle}>Voting Period Starting</h3>
                <p style={cardDescriptionStyle}>
                  Voting will begin on February 1st and close on February 7th. Make sure to cast your vote!
                </p>
                <span style={cardDateStyle}>1 day ago</span>
              </div>

              <div style={cardStyle}>
                <div style={cardIconStyle}>🏆</div>
                <h3 style={cardTitleStyle}>Results Declaration</h3>
                <p style={cardDescriptionStyle}>
                  Official election results will be announced on February 10th after the counting process.
                </p>
                <span style={cardDateStyle}>2 days ago</span>
              </div>
            </div>
          </div>

          {/* Quick Stats Section */}
          <div style={sectionStyle}>
            <div style={sectionHeaderStyle}>
              <h2 style={sectionTitleStyle}>📊 Quick Statistics</h2>
            </div>
            <div style={statsGridStyle}>
              <div style={statCardStyle}>
                <div style={statValueStyle}>1,234</div>
                <div style={statLabelStyle}>Total Voters</div>
              </div>
              <div style={statCardStyle}>
                <div style={statValueStyle}>45</div>
                <div style={statLabelStyle}>Candidates</div>
              </div>
              <div style={statCardStyle}>
                <div style={statValueStyle}>8</div>
                <div style={statLabelStyle}>Positions</div>
              </div>
              <div style={statCardStyle}>
                <div style={statValueStyle}>3</div>
                <div style={statLabelStyle}>Active Elections</div>
              </div>
            </div>
          </div>

          {/* News & Images Section */}
          <div style={sectionStyle}>
            <div style={sectionHeaderStyle}>
              <h2 style={sectionTitleStyle}>📰 Campus News & Highlights</h2>
            </div>
            <div style={newsGridStyle}>
              <div style={featureCardStyle}>
                <div style={imagePlaceholderStyle}>
                  <span style={imagePlaceholderText}>🏛️</span>
                </div>
                <div style={featureCardContentStyle}>
                  <h3 style={cardTitleStyle}>Campus Election Campaign Begins</h3>
                  <p style={cardDescriptionStyle}>
                    Candidates have started their campaign activities across campus. 
                    Check out the event schedule and meet the candidates.
                  </p>
                </div>
              </div>

              <div style={featureCardStyle}>
                <div style={imagePlaceholderStyle}>
                  <span style={imagePlaceholderText}>🎉</span>
                </div>
                <div style={featureCardContentStyle}>
                  <h3 style={cardTitleStyle}>Student Democracy Week</h3>
                  <p style={cardDescriptionStyle}>
                    Join us for a week-long celebration of student democracy with workshops, 
                    debates, and special events.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Styles
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

const heroSectionStyle = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  borderRadius: '16px',
  padding: '48px',
  marginBottom: '32px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
};

const heroTitleStyle = {
  fontSize: '42px',
  fontWeight: 'bold',
  color: '#ffffff',
  margin: '0 0 12px',
  textShadow: '0 2px 4px rgba(0,0,0,0.2)',
};

const heroSubtitleStyle = {
  fontSize: '18px',
  color: 'rgba(255,255,255,0.95)',
  margin: 0,
};

const sectionStyle = {
  marginBottom: '40px',
};

const sectionHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '20px',
};

const sectionTitleStyle = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#111827',
  margin: 0,
};

const updateBadgeStyle = {
  fontSize: '12px',
  fontWeight: '600',
  color: '#059669',
  background: '#d1fae5',
  padding: '4px 12px',
  borderRadius: '12px',
};

const announcementsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '20px',
};

const cardStyle = {
  background: '#ffffff',
  borderRadius: '12px',
  padding: '24px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  border: '1px solid #e5e7eb',
  transition: 'all 0.2s ease',
  cursor: 'pointer',
};

const cardIconStyle = {
  fontSize: '36px',
  marginBottom: '12px',
};

const cardTitleStyle = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#111827',
  margin: '0 0 8px',
};

const cardDescriptionStyle = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0 0 12px',
  lineHeight: '1.6',
};

const cardDateStyle = {
  fontSize: '12px',
  color: '#9ca3af',
  fontWeight: '500',
};

const statsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '20px',
};

const statCardStyle = {
  background: '#ffffff',
  borderRadius: '12px',
  padding: '24px',
  textAlign: 'center',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  border: '1px solid #e5e7eb',
};

const statValueStyle = {
  fontSize: '36px',
  fontWeight: 'bold',
  color: '#667eea',
  marginBottom: '8px',
};

const statLabelStyle = {
  fontSize: '14px',
  color: '#6b7280',
  fontWeight: '500',
};

const newsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
  gap: '24px',
};

const featureCardStyle = {
  background: '#ffffff',
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  border: '1px solid #e5e7eb',
  transition: 'all 0.2s ease',
  cursor: 'pointer',
};

const imagePlaceholderStyle = {
  width: '100%',
  height: '200px',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const imagePlaceholderText = {
  fontSize: '72px',
};

const featureCardContentStyle = {
  padding: '24px',
};

export default HomePage;
