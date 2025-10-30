import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  if (!formData.email || !formData.password) {
    setError('Please fill in all fields');
    return;
  }

  if (!isValidEmail(formData.email)) {
    setError('Please enter a valid email address');
    return;
  }

  setLoading(true);

  try {
    const result = await login(formData);
    console.log('✅ Login successful!');

    if (!result.success) {
      // ✅ Keep the error visible
      setError(result.error || 'Invalid email or password');
      setLoading(false);
      return;
    }

    // ✅ Only navigate if successful
    const { user, student } = result.data;

    if (!user.is_verified) {
      navigate('/verify-email');
    } else if (student) {
      navigate('/dashboard');
    } else {
      navigate('/create-profile');
    }

  } catch (err) {
    console.error('Login error:', err);
    setError('An unexpected error occurred. Please try again.');
  } finally {
    setLoading(false);
  }
};


  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your DigiVote account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="auth-button primary"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
