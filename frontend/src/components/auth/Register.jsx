import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    year_of_study: '',
    department_id: '',
  });
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch departments from backend
    const fetchDepartments = async () => {
      try {
        const res = await axios.get('/api/auth/departments');
        setDepartments(res.data.departments || []);
      } catch (err) {
        console.error('Failed to load departments', err);
      }
    };
    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...registrationData } = formData;
      const result = await register(registrationData);

      if (result.success) {
        localStorage.setItem('pendingEmail', formData.email);
        localStorage.setItem('userId', result.data.user_id);
        navigate('/verify-email');
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const { first_name, last_name, email, phone, password, confirmPassword, year_of_study, department_id } = formData;

    if (!first_name.trim()) return 'First name is required';
    if (!last_name.trim()) return 'Last name is required';
    if (!email.trim()) return 'Email is required';
    if (!phone.trim()) return 'Phone number is required';
    if (!password) return 'Password is required';
    if (!year_of_study) return 'Year of study is required';
    if (!department_id) return 'Department is required';
    if (!isValidEmail(email)) return 'Please enter a valid email address';
    if (!isValidPhone(phone)) return 'Please enter a valid phone number';
    if (password.length < 8) return 'Password must be at least 8 characters long';
    if (!isValidPassword(password))
      return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    if (password !== confirmPassword) return 'Passwords do not match';
    return null;
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPhone = (phone) => /^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/\s/g, ''));
  const isValidPassword = (password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(password);

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Join DigiVote to participate in elections</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="first_name">First Name</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Enter your first name"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="last_name">Last Name</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Enter your last name"
                required
                disabled={loading}
              />
            </div>
          </div>

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
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              required
              disabled={loading}
            />
          </div>

          {/* ✅ New Field: Year of Study */}
          <div className="form-group">
            <label htmlFor="year_of_study">Year of Study</label>
            <select
              id="year_of_study"
              name="year_of_study"
              value={formData.year_of_study}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="">Select Year</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>

          {/* ✅ New Field: Department */}
          <div className="form-group">
            <label htmlFor="department_id">Department</label>
            <select
              id="department_id"
              name="department_id"
              value={formData.department_id}
              onChange={handleChange}
              required
              disabled={loading || departments.length === 0}
            >
              <option value="">{departments.length === 0 ? 'Loading departments...' : 'Select Department'}</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              required
              disabled={loading}
            />
            {formData.password && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div className={`strength-fill strength-${passwordStrength}`}></div>
                </div>
                <span className="strength-text">
                  {passwordStrength < 3 ? 'Weak' : passwordStrength < 5 ? 'Good' : 'Strong'}
                </span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
              disabled={loading}
            />
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <div className="field-error">Passwords do not match</div>
            )}
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="auth-button primary" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
