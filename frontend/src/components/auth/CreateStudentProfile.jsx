import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { studentAPI } from '../../services/api';

const CreateStudentProfile = () => {
  const [formData, setFormData] = useState({
    year_of_study: '',
    department_id: '',
  });
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  
  const { createStudentProfile, user } = useAuth();
  const navigate = useNavigate();

  // Load departments on component mount
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        setDepartmentsLoading(true);
        const response = await studentAPI.getDepartments();
        setDepartments(response.departments || []);
      } catch (error) {
        console.error('Error loading departments:', error);
        setError('Failed to load departments. Please refresh the page.');
      } finally {
        setDepartmentsLoading(false);
      }
    };

    loadDepartments();
  }, []);

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
    setLoading(true);

    // Validation
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      const result = await createStudentProfile(formData);
      
      if (result.success) {
        navigate('/dashboard');
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
    const { year_of_study, department_id } = formData;

    // Required fields
    if (!year_of_study.trim()) return 'Year of study is required';
    if (!department_id) return 'Department is required';

    // Year validation
    const validYears = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'];
    if (!validYears.includes(year_of_study)) {
      return 'Please select a valid year of study';
    }

    return null;
  };

  const yearOptions = [
    '1st Year',
    '2nd Year', 
    '3rd Year',
    '4th Year',
    '5th Year'
  ];

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Complete Your Profile</h1>
          <p>Add your academic information to complete your student profile</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="year_of_study">Year of Study</label>
            <select
              id="year_of_study"
              name="year_of_study"
              value={formData.year_of_study}
              onChange={handleChange}
              required
              disabled={loading}
              className="form-select"
            >
              <option value="">Select your year of study</option>
              {yearOptions.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="department_id">Department</label>
            <select
              id="department_id"
              name="department_id"
              value={formData.department_id}
              onChange={handleChange}
              required
              disabled={loading || departmentsLoading}
              className="form-select"
            >
              <option value="">
                {departmentsLoading ? 'Loading departments...' : 'Select your department'}
              </option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="auth-button primary"
            disabled={loading || departmentsLoading}
          >
            {loading ? 'Creating Profile...' : 'Complete Profile'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Need help? Contact the administration team.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateStudentProfile;
