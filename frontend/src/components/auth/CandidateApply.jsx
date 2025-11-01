import React, { useEffect, useState } from 'react';
import Sidebar from '../Sidebar';
import TopBar from '../TopBar';
// import '../../styles/ElectionDropdown.css';

const CandidateApply = () => {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState('');
  const [platformStatement, setPlatformStatement] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [studentId, setStudentId] = useState(null);

  useEffect(() => {
    fetchElections();
    // Get student ID from localStorage or context (adjust based on your auth setup)
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setStudentId(user.student_id || user.id);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  const fetchElections = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/candidates/apply/elections');
      if (response.ok) {
        const data = await response.json();
        setElections(data.elections || []);
      }
    } catch (err) {
      console.error('Error fetching elections:', err);
      setError('Failed to load elections');
    } finally {
      setLoading(false);
    }
  };

  const handleElectionSelect = (electionId) => {
    // Accept string or number and match by string form to support UUIDs
    const election = elections.find(e => String(e.id) === String(electionId));
    setSelectedElection(election || null);
    setSelectedPosition('');
    setPhotoFile(null);
    setPhotoPreview(null);
    setPlatformStatement('');
    setError('');
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a valid image file (PNG, JPG, GIF, or WEBP)');
        return;
      }
      
      // Validate file size (max 16MB)
      if (file.size > 16 * 1024 * 1024) {
        setError('Image size should be less than 16MB');
        return;
      }
      
      setPhotoFile(file);
      setError('');
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!studentId) {
      setError('Student ID not found. Please log in again.');
      return;
    }
    
    if (!selectedElection || !selectedPosition) {
      setError('Please select an election and position');
      return;
    }
    
    if (!platformStatement.trim()) {
      setError('Please provide a platform statement');
      return;
    }
    
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('student_id', studentId);
      formData.append('election_id', selectedElection.id);
      formData.append('position_id', selectedPosition);
      formData.append('platform_statement', platformStatement);
      
      if (photoFile) {
        formData.append('photo', photoFile);
      }
      
      const response = await fetch('/api/candidates/apply', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(true);
        setSelectedElection(null);
        setSelectedPosition('');
        setPlatformStatement('');
        setPhotoFile(null);
        setPhotoPreview(null);
      } else {
        setError(data.error || 'Failed to submit application');
      }
    } catch (err) {
      console.error('Error submitting application:', err);
      setError('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedElection(null);
    setSelectedPosition('');
    setPlatformStatement('');
    setPhotoFile(null);
    setPhotoPreview(null);
    setError('');
    setSuccess(false);
  };

  // Debugging: Log the current elections state
  console.log('Current elections state:', elections);

  return (
    <div style={layoutStyle}>
      <Sidebar />
      <div style={mainContentStyle}>
        <TopBar />
        <div style={contentWrapperStyle}>
          <div style={containerStyle}>
            <h1 style={titleStyle}>🎯 Candidate Application</h1>
            <p style={subtitleStyle}>Apply to become a candidate in upcoming elections</p>

            {success ? (
              <div style={successMessageStyle}>
                <span style={successIconStyle}>✅</span>
                <h2>Application Submitted!</h2>
                <p>Your application has been submitted successfully and is pending admin approval.</p>
                <button onClick={handleReset} style={buttonStyle}>
                  Apply for Another Position
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={formStyle}>
                {error && (
                  <div style={errorStyle}>
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                {/* Election Selection */}
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Select Election *</label>
                  {loading && !selectedElection ? (
                    <div style={loadingStyle}>Loading elections...</div>
                  ) : (
                    <select
                      value={selectedElection?.id || ''}
                      onChange={(e) => handleElectionSelect(e.target.value)} // don't parseInt
                      style={selectStyle}
                      required
                    >
                      <option value="">Select election</option>
                      {elections.map(ev => (
                        <option key={ev.id} value={ev.id}>
                          {ev.title}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Position Selection */}
                {selectedElection && (
                  <div style={formGroupStyle}>
                    <label style={labelStyle}>Select Position *</label>
                    <select
                      value={selectedPosition || ''}
                      onChange={(e) => setSelectedPosition(e.target.value)}
                      style={selectStyle}
                      required
                    >
                      <option value="">Select position</option>
                      {selectedElection?.positions?.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Platform Statement */}
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Platform Statement *</label>
                  <textarea
                    value={platformStatement}
                    onChange={(e) => setPlatformStatement(e.target.value)}
                    placeholder="Describe your platform and goals if elected..."
                    style={textareaStyle}
                    rows={6}
                    required
                  />
                </div>

                {/* Photo Upload */}
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Candidate Photo</label>
                  <div style={photoUploadStyle}>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                      onChange={handlePhotoChange}
                      style={fileInputStyle}
                      id="photo-upload"
                    />
                    <label htmlFor="photo-upload" style={fileInputLabelStyle}>
                      {photoPreview ? 'Change Photo' : 'Choose Photo'}
                    </label>
                    {photoPreview && (
                      <div style={previewContainerStyle}>
                        <img src={photoPreview} alt="Preview" style={previewImageStyle} />
                        <button
                          type="button"
                          onClick={() => {
                            setPhotoFile(null);
                            setPhotoPreview(null);
                            document.getElementById('photo-upload').value = '';
                          }}
                          style={removePhotoButtonStyle}
                        >
                          ✕ Remove
                        </button>
                      </div>
                    )}
                  </div>
                  <p style={helpTextStyle}>Recommended: Square image, max 16MB (PNG, JPG, GIF, WEBP)</p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    ...submitButtonStyle,
                    opacity: loading ? 0.6 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
              </form>
            )}
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
  maxWidth: '800px',
  width: '100%',
  margin: '70px auto 0',
};

const containerStyle = {
  background: '#ffffff',
  borderRadius: '12px',
  padding: '48px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  border: '1px solid #e5e7eb',
};

const titleStyle = {
  fontSize: '32px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0 0 12px',
  textAlign: 'center',
};

const subtitleStyle = {
  fontSize: '16px',
  color: '#6b7280',
  margin: '0 0 32px',
  textAlign: 'center',
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
};

const formGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  borderRadius: '10px'
  
  
};

const labelStyle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#374151',
};

const selectStyle = {
  padding: '12px',
  borderRadius: '10px',
  border: '1px solid #d1d5db',
  fontSize: '16px',
  color: '#ffffff',
  background: '#454444ff',
  cursor: 'pointer',

};

const textareaStyle = {
  padding: '12px',
  borderRadius: '8px',
  border: '1px solid #d1d5db',
  fontSize: '16px',
  fontFamily: 'inherit',
  resize: 'vertical',
};

const photoUploadStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const fileInputStyle = {
  display: 'none',
};

const fileInputLabelStyle = {
  padding: '12px 24px',
  borderRadius: '8px',
  border: '2px dashed #d1d5db',
  background: '#f9fafb',
  color: '#6b7280',
  fontSize: '14px',
  fontWeight: '500',
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};

const previewContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '12px',
  padding: '16px',
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
  background: '#f9fafb',
};

const previewImageStyle = {
  width: '150px',
  height: '150px',
  objectFit: 'cover',
  borderRadius: '8px',
  border: '2px solid #e5e7eb',
};

const removePhotoButtonStyle = {
  padding: '6px 12px',
  borderRadius: '6px',
  border: '1px solid #dc2626',
  background: '#ffffff',
  color: '#dc2626',
  fontSize: '12px',
  fontWeight: '500',
  cursor: 'pointer',
};

const helpTextStyle = {
  fontSize: '12px',
  color: '#6b7280',
  margin: 0,
};

const submitButtonStyle = {
  padding: '14px 32px',
  borderRadius: '8px',
  border: 'none',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  marginTop: '8px',
};

const errorStyle = {
  padding: '12px 16px',
  borderRadius: '8px',
  background: '#fef2f2',
  border: '1px solid #fecaca',
  color: '#dc2626',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '14px',
};

const successMessageStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '16px',
  padding: '48px',
  textAlign: 'center',
};

const successIconStyle = {
  fontSize: '64px',
};

const buttonStyle = {
  padding: '12px 24px',
  borderRadius: '8px',
  border: 'none',
  background: '#667eea',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
};

const loadingStyle = {
  padding: '12px',
  textAlign: 'center',
  color: '#6b7280',
};

export default CandidateApply;
