import React, { useEffect, useState } from "react";
import Sidebar from '../Sidebar';
import TopBar from '../TopBar';

const CandidateVoting = () => {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [loadingElections, setLoadingElections] = useState(false);
  const [candidatesByPosition, setCandidatesByPosition] = useState({});
  const [selectedCandidates, setSelectedCandidates] = useState({}); // { positionId: candidateId }
  const [submitted, setSubmitted] = useState(false);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [submittingVote, setSubmittingVote] = useState(false);
  const [error, setError] = useState('');
  const [studentId, setStudentId] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);

  // Get student ID on mount
  useEffect(() => {
    const fetchStudentId = async () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          
          // If student_id is already in user object, use it
          if (user.student_id) {
            setStudentId(user.student_id);
            return;
          }
          
          // Otherwise, fetch student profile using user_id
          if (user.id) {
            try {
              const response = await fetch(`/api/auth/student-profile/${user.id}`);
              if (response.ok) {
                const data = await response.json();
                if (data.student && data.student.id) {
                  setStudentId(data.student.id);
                  // Update user object with student_id
                  user.student_id = data.student.id;
                  localStorage.setItem('user', JSON.stringify(user));
                }
              }
            } catch (err) {
              console.error('Error fetching student profile:', err);
            }
          }
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
    };
    
    fetchStudentId();
  }, []);

  // Fetch elections on mount
  useEffect(() => {
    fetchElections();
  }, []);

  // Fetch candidates and check voting status when election is selected
  useEffect(() => {
    if (selectedElection && studentId) {
      fetchCandidates(selectedElection.id);
      checkVotingStatus(selectedElection.id);
    }
  }, [selectedElection, studentId]);

  const fetchElections = async () => {
    setLoadingElections(true);
    try {
      const response = await fetch("/api/candidates/voting/elections");
      if (response.ok) {
        const data = await response.json();
        setElections(data.elections || []);
      }
    } catch (err) {
      console.error("Error fetching elections:", err);
    } finally {
      setLoadingElections(false);
    }
  };

  const fetchCandidates = async (electionId) => {
    setLoadingCandidates(true);
    try {
      const response = await fetch(`/api/candidates/voting/elections/${electionId}/candidates`);
      if (response.ok) {
        const data = await response.json();
        setCandidatesByPosition(data.candidates_by_position || {});
      }
    } catch (err) {
      console.error("Error fetching candidates:", err);
    } finally {
      setLoadingCandidates(false);
    }
  };

  const handleElectionSelect = (electionId) => {
    const election = elections.find(e => e.id === electionId);
    setSelectedElection(election);
    setSelectedCandidates({});
  };

  const handleCandidateSelect = (positionId, candidateId) => {
    setSelectedCandidates(prev => ({
      ...prev,
      [positionId]: candidateId
    }));
  };

  const checkVotingStatus = async (electionId) => {
    if (!studentId) return;
    
    try {
      const response = await fetch(`/api/voting/status/${studentId}/${electionId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.has_voted) {
          setHasVoted(true);
          setSubmitted(true);
        }
      }
    } catch (err) {
      console.error('Error checking voting status:', err);
    }
  };

  const handleVote = async () => {
    if (!studentId) {
      setError('Student ID not found. Please log in again.');
      return;
    }

    const positionCount = Object.keys(candidatesByPosition).length;
    const selectedCount = Object.keys(selectedCandidates).length;

    if (selectedCount < positionCount) {
      setError(`Please select a candidate for all ${positionCount} positions before submitting!`);
      return;
    }

    setError('');
    setSubmittingVote(true);

    try {
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      
      const response = await fetch('/api/voting/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          election_id: selectedElection.id,
          student_id: studentId,
          user_id: user?.id,  // Include user_id as fallback
          votes: selectedCandidates
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
        setHasVoted(true);
      } else {
        setError(data.error || 'Failed to submit vote. Please try again.');
        setSubmittingVote(false);
      }
    } catch (err) {
      console.error('Error submitting vote:', err);
      setError('Failed to submit vote. Please try again.');
      setSubmittingVote(false);
    }
  };

  const handleGoBack = () => {
    setSelectedElection(null);
    setCandidatesByPosition({});
    setSelectedCandidates({});
    setSubmitted(false);
    setHasVoted(false);
    setError('');
  };

  const positions = Object.keys(candidatesByPosition);
  const totalPositions = positions.length;

  return (
    <div style={layoutStyle}>
      <Sidebar />
      <div style={mainContentStyle}>
        <TopBar />
        <div style={contentWrapperStyle}>
          <div style={containerStyle}>
            <h1 style={titleStyle}>🗳️ Candidate Voting</h1>

      {!submitted ? (
              !selectedElection ? (
                // Election Selection
                <div>
                  <p style={subtitleStyle}>Select an election to view candidates</p>
                  
                  {loadingElections ? (
                    <div style={loadingStyle}>
                      <div className="loading-spinner"></div>
                      <p>Loading elections...</p>
                    </div>
                  ) : elections.length > 0 ? (
                    <div style={electionsGridStyle}>
                      {elections.map(election => (
                        <div
                          key={election.id}
                          onClick={() => handleElectionSelect(election.id)}
                          style={electionCardStyle}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#667eea';
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 8px 16px rgba(102, 126, 234, 0.2)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'transparent';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          <div style={electionIconStyle}>🎯</div>
                          <h3 style={electionTitleStyle}>{election.title}</h3>
                          {election.election_year && (
                            <p style={electionYearStyle}>{election.election_year}</p>
                          )}
                          <div style={electionBadgeStyle}>
                            <span style={{
                              ...badgeStyle,
                              background: election.status === 'ACTIVE' ? '#10b981' : '#6366f1'
                            }}>
                              {election.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={emptyStateStyle}>
                      <span style={emptyIconStyle}>📭</span>
                      <p>No elections available at this time</p>
                    </div>
                  )}
                </div>
                  ) : (
                // Candidate Selection
                <div>
                  <div style={headerSectionStyle}>
                    <button onClick={handleGoBack} style={backButtonStyle}>
                      ← Back to Elections
                    </button>
                    <h2 style={electionTitleStyle}>
                      {selectedElection.title}
                      {selectedElection.election_year && ` (${selectedElection.election_year})`}
                    </h2>
                    {hasVoted && (
                      <div style={alreadyVotedStyle}>
                        ✓ You have already voted in this election
                      </div>
                    )}
                  </div>
                  
                  {error && (
                    <div style={errorStyle}>
                      <span>⚠️</span>
                      <span>{error}</span>
                    </div>
                  )}

                  {loadingCandidates ? (
                    <div style={loadingStyle}>
                      <div className="loading-spinner"></div>
                      <p>Loading candidates...</p>
                    </div>
                  ) : positions.length > 0 ? (
                    <div>
                      <p style={subtitleStyle}>
                        Select your preferred candidate for each position ({positions.length} position{positions.length !== 1 ? 's' : ''} available)
                      </p>
                      
                      <div style={positionsContainerStyle}>
                        {positions.map(positionName => {
                          const candidates = candidatesByPosition[positionName];
                          const positionId = candidates[0]?.position_id;
                          const isSelected = selectedCandidates[positionId];
                          
                          return (
                            <div key={positionId} style={positionSectionStyle}>
                              <h3 style={positionTitleStyle}>
                                {positionName}
                                {!isSelected && <span style={requiredStyle}> *</span>}
                              </h3>
                              
                              <div style={candidatesGridStyle}>
          {candidates.map(candidate => (
            <label
              key={candidate.id}
              style={{
                                      ...candidateCardStyle,
                                      background: isSelected === candidate.id ? '#e0e7ff' : '#ffffff',
                                      borderColor: isSelected === candidate.id ? '#667eea' : '#e5e7eb',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    <div style={candidateInfoStyle}>
              <input
                type="radio"
                                        name={`position-${positionId}`}
                value={candidate.id}
                                        checked={isSelected === candidate.id}
                                        onChange={() => handleCandidateSelect(positionId, candidate.id)}
                                        style={radioStyle}
                                      />
                                      <div style={candidateDetailsStyle}>
                                        {candidate.photo_url && (
                                          <img 
                                            src={candidate.photo_url.startsWith('http') ? candidate.photo_url : `${window.location.protocol}//${window.location.hostname}:5000${candidate.photo_url}`}
                                            alt={candidate.name}
                                            style={candidateImageStyle}
                                            onError={(e) => {
                                              e.target.style.display = 'none';
                                            }}
                                          />
                                        )}
                                        <span style={candidateNameStyle}>
                                          {candidate.name}
                                        </span>
                                        {candidate.platform_statement && (
                                          <p style={platformStyle}>
                                            {candidate.platform_statement}
                                          </p>
                                        )}
                                      </div>
                                    </div>
            </label>
          ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div style={submitContainerStyle}>
                        <p style={progressStyle}>
                          Selected: {Object.keys(selectedCandidates).length} / {totalPositions} positions
                        </p>
          <button
            onClick={handleVote}
                          disabled={hasVoted || submittingVote || Object.keys(selectedCandidates).length < totalPositions}
            style={{
                            ...submitButtonStyle,
                            opacity: (hasVoted || submittingVote || Object.keys(selectedCandidates).length < totalPositions) ? 0.5 : 1,
                            cursor: (hasVoted || submittingVote || Object.keys(selectedCandidates).length < totalPositions) ? 'not-allowed' : 'pointer',
                          }}
                        >
                          {submittingVote ? 'Submitting...' : hasVoted ? 'Already Voted' : 'Submit Votes'}
          </button>
        </div>
                    </div>
                  ) : (
                    <div style={emptyStateStyle}>
                      <span style={emptyIconStyle}>👥</span>
                      <p>No approved candidates available for this election</p>
                    </div>
                  )}
                </div>
              )
            ) : (
              // Success Message
              <div style={successMessageStyle}>
                <span style={successIconStyle}>✅</span>
                <h2>Thank you for voting!</h2>
                <p>Your votes have been recorded successfully.</p>
                <button onClick={handleGoBack} style={backToElectionsButtonStyle}>
                  Vote in Another Election
                </button>
              </div>
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

const loadingStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '16px',
  padding: '48px',
};

const electionsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
  gap: '20px',
};

const electionCardStyle = {
  background: '#f9fafb',
  borderRadius: '12px',
  padding: '24px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  border: '2px solid transparent',
  textAlign: 'center',
};

const electionIconStyle = {
  fontSize: '48px',
  marginBottom: '12px',
};

const electionTitleStyle = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#111827',
  margin: '0 0 8px',
};

const electionYearStyle = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0 0 12px',
};

const electionBadgeStyle = {
  display: 'flex',
  justifyContent: 'center',
};

const badgeStyle = {
  padding: '4px 12px',
  borderRadius: '12px',
  fontSize: '12px',
  fontWeight: '600',
  color: '#ffffff',
};

const emptyStateStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '16px',
  padding: '48px',
  color: '#9ca3af',
};

const emptyIconStyle = {
  fontSize: '64px',
};

const headerSectionStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '12px',
  marginBottom: '32px',
};

const backButtonStyle = {
  padding: '8px 16px',
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
  background: '#ffffff',
  color: '#6b7280',
  fontSize: '14px',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};

const positionsContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '32px',
  marginBottom: '32px',
};

const positionSectionStyle = {
  borderBottom: '1px solid #e5e7eb',
  paddingBottom: '32px',
};

const positionTitleStyle = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#111827',
  margin: '0 0 16px',
};

const requiredStyle = {
  color: '#dc2626',
};

const candidatesGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
  gap: '16px',
};

const candidateCardStyle = {
  padding: '20px',
  borderRadius: '12px',
  border: '2px solid #e5e7eb',
  transition: 'all 0.2s ease',
};

const candidateInfoStyle = {
  display: 'flex',
  gap: '12px',
};

const radioStyle = {
  width: '20px',
  height: '20px',
  cursor: 'pointer',
  flexShrink: 0,
};

const candidateDetailsStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  flex: 1,
};

const candidateNameStyle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#111827',
};

const candidateImageStyle = {
  width: '60px',
  height: '60px',
  borderRadius: '50%',
  objectFit: 'cover',
  marginBottom: '8px',
  border: '2px solid #e5e7eb',
};

const platformStyle = {
  fontSize: '14px',
  color: '#6b7280',
  margin: 0,
  lineHeight: '1.5',
};

const submitContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '16px',
  marginTop: '32px',
};

const progressStyle = {
  fontSize: '14px',
  color: '#6b7280',
  fontWeight: '500',
};

const submitButtonStyle = {
  padding: '14px 32px',
  borderRadius: '8px',
  border: 'none',
  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
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

const backToElectionsButtonStyle = {
  padding: '12px 24px',
  borderRadius: '8px',
  border: 'none',
  background: '#667eea',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};

const alreadyVotedStyle = {
  padding: '8px 16px',
  borderRadius: '8px',
  background: '#d1fae5',
  color: '#065f46',
  fontSize: '14px',
  fontWeight: '500',
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
  marginBottom: '16px',
};

export default CandidateVoting;
