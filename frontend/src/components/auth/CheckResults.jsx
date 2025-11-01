import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar';
import TopBar from '../TopBar';
import { votingAPI } from '../../services/api';

const CheckResults = () => {
  // Inject spinner animation styles
  useEffect(() => {
    const styleSheet = document.createElement('style');
    styleSheet.type = 'text/css';
    styleSheet.innerText = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(styleSheet);
    
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [results, setResults] = useState(null);
  const [loadingElections, setLoadingElections] = useState(false);
  const [loadingResults, setLoadingResults] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchElections();
  }, []);

  useEffect(() => {
    if (selectedElection) {
      fetchResults(selectedElection.id);
    }
  }, [selectedElection]);

  const fetchElections = async () => {
    setLoadingElections(true);
    setError('');
    try {
      const data = await votingAPI.getElectionsForResults();
      setElections(data.elections || []);
      if (data.elections && data.elections.length > 0) {
        setSelectedElection(data.elections[0]);
      }
    } catch (err) {
      console.error('Error fetching elections:', err);
      setError('Failed to load elections. Please try again.');
    } finally {
      setLoadingElections(false);
    }
  };

  const fetchResults = async (electionId) => {
    setLoadingResults(true);
    setError('');
    try {
      const data = await votingAPI.getElectionResults(electionId);
      setResults(data);
    } catch (err) {
      console.error('Error fetching results:', err);
      setError('Failed to load results. Please try again.');
      setResults(null);
    } finally {
      setLoadingResults(false);
    }
  };

  const calculatePercentage = (voteCount, totalVotes) => {
    if (totalVotes === 0) return 0;
    return ((voteCount / totalVotes) * 100).toFixed(1);
  };

  const handleElectionChange = (electionId) => {
    const election = elections.find(e => e.id === electionId);
    setSelectedElection(election);
  };

  return (
    <div style={layoutStyle}>
      <Sidebar />
      <div style={mainContentStyle}>
        <TopBar />
        <div style={contentWrapperStyle}>
          <div style={containerStyle}>
            <h1 style={titleStyle}>📊 Election Results</h1>
            <p style={subtitleStyle}>View real-time and historical election results</p>

            {error && (
              <div style={errorStyle}>
                <span style={errorIconStyle}>⚠️</span>
                <p>{error}</p>
              </div>
            )}

            {/* Election Selector */}
            <div style={selectorContainerStyle}>
              <label style={labelStyle}>Select Election:</label>
              {loadingElections ? (
                <div style={loadingStyle}>Loading elections...</div>
              ) : (
                <select
                  style={selectStyle}
                  value={selectedElection?.id || ''}
                  onChange={(e) => handleElectionChange(e.target.value)}
                  disabled={elections.length === 0}
                >
                  {elections.length === 0 ? (
                    <option value="">No elections available</option>
                  ) : (
                    <>
                      <option value="">-- Select an election --</option>
                      {elections.map((election) => (
                        <option key={election.id} value={election.id}>
                          {election.title} ({election.election_year || 'N/A'}) - {election.status}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              )}
            </div>

            {/* Results Display */}
            {loadingResults ? (
              <div style={loadingContainerStyle}>
                <div style={spinnerStyle}></div>
                <p>Loading results...</p>
              </div>
            ) : results ? (
              <div style={resultsContainerStyle}>
                {/* Election Info */}
                <div style={electionInfoStyle}>
                  <h2 style={electionTitleStyle}>{results.election.title}</h2>
                  <div style={electionMetaStyle}>
                    <span style={metaItemStyle}>📅 {results.election.election_year || 'N/A'}</span>
                    <span style={metaItemStyle}>📊 {results.election.status}</span>
                    <span style={metaItemStyle}>🗳️ {results.total_ballots_cast} ballots cast</span>
                  </div>
                </div>

                {/* Results by Position */}
                {results.results && results.results.length > 0 ? (
                  <div style={positionsContainerStyle}>
                    {results.results.map((positionResult) => (
                      <div key={positionResult.position_id} style={positionCardStyle}>
                        <h3 style={positionTitleStyle}>{positionResult.position_name}</h3>
                        <div style={positionStatsStyle}>
                          <span style={statItemStyle}>
                            Total Votes: <strong>{positionResult.total_votes}</strong>
                          </span>
                          {positionResult.none_of_the_above_votes > 0 && (
                            <span style={statItemStyle}>
                              None of the Above: <strong>{positionResult.none_of_the_above_votes}</strong>
                            </span>
                          )}
                        </div>

                        {/* Candidates List */}
                        {positionResult.candidates && positionResult.candidates.length > 0 ? (
                          <div style={candidatesListStyle}>
                            {positionResult.candidates.map((candidate, index) => {
                              const percentage = calculatePercentage(
                                candidate.vote_count,
                                positionResult.total_votes
                              );
                              const isWinner = index === 0 && candidate.vote_count > 0;
                              
                              return (
                                <div
                                  key={candidate.candidate_id}
                                  style={{
                                    ...candidateCardStyle,
                                    ...(isWinner ? winnerCardStyle : {})
                                  }}
                                >
                                  <div style={candidateHeaderStyle}>
                                    <div style={candidateRankStyle}>
                                      <span style={rankNumberStyle}>#{index + 1}</span>
                                      {isWinner && <span style={winnerBadgeStyle}>🏆 Winner</span>}
                                    </div>
                                    <div style={candidateVotesStyle}>
                                      <span style={voteCountStyle}>{candidate.vote_count}</span>
                                      <span style={voteLabelStyle}>votes</span>
                                    </div>
                                  </div>

                                  <div style={candidateBodyStyle}>
                                    {candidate.photo_url && (
                                      <img
                                        src={`http://localhost:5000${candidate.photo_url}`}
                                        alt={candidate.candidate_name}
                                        style={candidatePhotoStyle}
                                        onError={(e) => {
                                          e.target.style.display = 'none';
                                        }}
                                      />
                                    )}
                                    <div style={candidateInfoStyle}>
                                      <h4 style={candidateNameStyle}>{candidate.candidate_name}</h4>
                                      <div style={candidateDetailsStyle}>
                                        <span>{candidate.department || 'N/A'}</span>
                                        <span>•</span>
                                        <span>{candidate.year_of_study}</span>
                                      </div>
                                      {candidate.platform_statement && (
                                        <p style={platformStyle}>{candidate.platform_statement}</p>
                                      )}
                                    </div>
                                  </div>

                                  {/* Vote Progress Bar */}
                                  <div style={progressBarContainerStyle}>
                                    <div
                                      style={{
                                        ...progressBarStyle,
                                        width: `${percentage}%`,
                                        backgroundColor: isWinner ? '#10b981' : '#3b82f6'
                                      }}
                                    />
                                    <span style={percentageStyle}>{percentage}%</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div style={noCandidatesStyle}>
                            <p>No approved candidates for this position.</p>
                          </div>
                        )}

                        {/* None of the Above */}
                        {positionResult.none_of_the_above_votes > 0 && (
                          <div style={noneOfAboveStyle}>
                            <div style={noneOfAboveHeaderStyle}>
                              <span>None of the Above</span>
                              <span style={noneOfAboveVotesStyle}>
                                {positionResult.none_of_the_above_votes} votes (
                                {calculatePercentage(
                                  positionResult.none_of_the_above_votes,
                                  positionResult.total_votes
                                )}%)
                              </span>
                            </div>
                            <div style={progressBarContainerStyle}>
                              <div
                                style={{
                                  ...progressBarStyle,
                                  width: `${calculatePercentage(
                                    positionResult.none_of_the_above_votes,
                                    positionResult.total_votes
                                  )}%`,
                                  backgroundColor: '#6b7280'
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={noResultsStyle}>
                    <p>No results available for this election.</p>
                  </div>
                )}
              </div>
            ) : selectedElection ? (
              <div style={noResultsStyle}>
                <p>Select an election to view results.</p>
              </div>
            ) : null}
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
};

const subtitleStyle = {
  fontSize: '16px',
  color: '#6b7280',
  margin: '0 0 32px',
};

const errorStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '16px',
  marginBottom: '24px',
  background: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: '8px',
  color: '#991b1b',
};

const errorIconStyle = {
  fontSize: '20px',
};

const selectorContainerStyle = {
  marginBottom: '32px',
};

const labelStyle = {
  display: 'block',
  fontSize: '14px',
  fontWeight: '600',
  color: '#374151',
  marginBottom: '8px',
};

const selectStyle = {
  width: '100%',
  padding: '12px 16px',
  fontSize: '16px',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  background: '#ffffff',
  color: '#111827',
  cursor: 'pointer',
};

const loadingStyle = {
  padding: '16px',
  textAlign: 'center',
  color: '#6b7280',
};

const loadingContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '16px',
  padding: '48px',
};

const spinnerStyle = {
  width: '40px',
  height: '40px',
  border: '4px solid #e5e7eb',
  borderTop: '4px solid #3b82f6',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
};

const resultsContainerStyle = {
  marginTop: '24px',
};

const electionInfoStyle = {
  marginBottom: '32px',
  paddingBottom: '24px',
  borderBottom: '2px solid #e5e7eb',
};

const electionTitleStyle = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0 0 12px',
};

const electionMetaStyle = {
  display: 'flex',
  gap: '24px',
  flexWrap: 'wrap',
};

const metaItemStyle = {
  fontSize: '14px',
  color: '#6b7280',
};

const positionsContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '32px',
};

const positionCardStyle = {
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  padding: '24px',
  background: '#ffffff',
};

const positionTitleStyle = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0 0 16px',
};

const positionStatsStyle = {
  display: 'flex',
  gap: '24px',
  marginBottom: '24px',
  paddingBottom: '16px',
  borderBottom: '1px solid #e5e7eb',
};

const statItemStyle = {
  fontSize: '14px',
  color: '#6b7280',
};

const candidatesListStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const candidateCardStyle = {
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '20px',
  background: '#ffffff',
  transition: 'all 0.2s',
};

const winnerCardStyle = {
  border: '2px solid #10b981',
  background: '#f0fdf4',
};

const candidateHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '16px',
};

const candidateRankStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
};

const rankNumberStyle = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#3b82f6',
};

const winnerBadgeStyle = {
  padding: '4px 12px',
  background: '#10b981',
  color: '#ffffff',
  borderRadius: '12px',
  fontSize: '12px',
  fontWeight: '600',
};

const candidateVotesStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
};

const voteCountStyle = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#111827',
};

const voteLabelStyle = {
  fontSize: '12px',
  color: '#6b7280',
};

const candidateBodyStyle = {
  display: 'flex',
  gap: '16px',
  marginBottom: '16px',
};

const candidatePhotoStyle = {
  width: '80px',
  height: '80px',
  borderRadius: '8px',
  objectFit: 'cover',
  border: '1px solid #e5e7eb',
};

const candidateInfoStyle = {
  flex: 1,
};

const candidateNameStyle = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#111827',
  margin: '0 0 8px',
};

const candidateDetailsStyle = {
  display: 'flex',
  gap: '8px',
  fontSize: '14px',
  color: '#6b7280',
  marginBottom: '8px',
};

const platformStyle = {
  fontSize: '14px',
  color: '#374151',
  margin: '8px 0 0',
  fontStyle: 'italic',
};

const progressBarContainerStyle = {
  position: 'relative',
  width: '100%',
  height: '24px',
  background: '#e5e7eb',
  borderRadius: '12px',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
};

const progressBarStyle = {
  height: '100%',
  borderRadius: '12px',
  transition: 'width 0.3s ease',
};

const percentageStyle = {
  position: 'absolute',
  right: '8px',
  fontSize: '12px',
  fontWeight: '600',
  color: '#374151',
};

const noCandidatesStyle = {
  padding: '24px',
  textAlign: 'center',
  color: '#6b7280',
};

const noResultsStyle = {
  padding: '48px',
  textAlign: 'center',
  color: '#6b7280',
};

const noneOfAboveStyle = {
  marginTop: '24px',
  padding: '16px',
  background: '#f9fafb',
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
};

const noneOfAboveHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '12px',
  fontSize: '14px',
  fontWeight: '600',
  color: '#374151',
};

const noneOfAboveVotesStyle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#6b7280',
};

export default CheckResults;
