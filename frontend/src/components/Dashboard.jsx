import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user, student, logout } = useAuth();

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>DigiVote Dashboard</h1>
        <button onClick={logout} className="auth-button primary">
          Logout
        </button>
      </div>

      <div style={{ display: 'grid', gap: '1rem', maxWidth: '600px' }}>
        <div style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', background: 'var(--background)' }}>
          <h2>Welcome, {user?.first_name} {user?.last_name}!</h2>
          <p>Email: {user?.email}</p>
          <p>Status: {user?.is_verified ? '✅ Verified' : '❌ Not Verified'}</p>
          <p>Role: {user?.is_admin ? '👑 Admin' : '👤 Student'}</p>
        </div>

        {student && (
          <div style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', background: 'var(--background)' }}>
            <h3>Student Profile</h3>
            <p>Year of Study: {student.year_of_study}</p>
            <p>Department: {student.department?.name || 'Not specified'}</p>
          </div>
        )}

        <div style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', background: 'var(--background)' }}>
          <h3>Quick Actions</h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="auth-button primary" disabled>
              View Elections
            </button>
            <button className="auth-button primary" disabled>
              Apply as Candidate
            </button>
            <button className="auth-button primary" disabled>
              Vote
            </button>
          </div>
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            These features will be available in the next update.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
