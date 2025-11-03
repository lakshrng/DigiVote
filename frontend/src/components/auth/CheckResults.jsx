import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar';
import TopBar from '../TopBar';
import { votingAPI } from '../../services/api';

const CheckResults = () => {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [electionResults, setElectionResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingResults, setLoadingResults] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchElections();
  }, []);

  useEffect(() => {
    if (selectedElection) {
      fetchElectionResults(selectedElection.id);
    }
  }, [selectedElection]);

  const fetchElections = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await votingAPI.getElectionsForResults();
      setElections(response.elections || []);
    } catch (err) {
      console.error('Error fetching elections:', err);
      setError('Failed to load elections. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchElectionResults = async (electionId) => {
    setLoadingResults(true);
    setError('');
    try {
      const response = await votingAPI.getElectionResults(electionId);
      setElectionResults(response);
    } catch (err) {
      console.error('Error fetching election results:', err);
      setError('Failed to load election results. Please try again.');
      setElectionResults(null);
    } finally {
      setLoadingResults(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return { bg: '#dbeafe', text: '#1e40af' };
      case 'COMPLETED':
        return { bg: '#d1fae5', text: '#065f46' };
      case 'ARCHIVED':
        return { bg: '#f3f4f6', text: '#374151' };
      default:
        return { bg: '#f3f4f6', text: '#6b7280' };
    }
  };

  const calculatePercentage = (votes, total) => {
    if (total === 0) return 0;
    return ((votes / total) * 100).toFixed(1);
  };

  return (
    <div style={layoutStyle}>
      <Sidebar />
      <div style={mainContentStyle}>
        <TopBar />
        <div style={contentWrapperStyle}>
          <div style={headerStyle}>
            <h1 style={titleStyle}>📊 Election Results</h1>
            <p style={subtitleStyle}>View real-time and historical election results</p>
          </div>

          {error && (
            <div style={errorStyle}>
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Election Selection */}
          <div style={sectionStyle}>
            <h2 style={sectionTitleStyle}>Select Election</h2>
            {loading ? (
              <div style={loadingStyle}>Loading elections...</div>
            ) : elections.length === 0 ? (
              <div style={emptyStateStyle}>
                <span style={emptyIconStyle}>📭</span>
                <p>No elections available for viewing results.</p>
              </div>
            ) : (
              <div style={electionsGridStyle}>
                {elections.map((election) => {
                  const statusColor = getStatusColor(election.status);
                  const isSelected = selectedElection?.id === election.id;
                  return (
                    <div
                      key={election.id}
                      onClick={() => setSelectedElection(election)}
                      style={{
                        ...electionCardStyle,
                        ...(isSelected ? selectedCardStyle : {}),
                      }}
                    >
                      <div style={electionCardHeaderStyle}>
                        <h3 style={electionCardTitleStyle}>{election.title}</h3>
                        <span
                          style={{
                            ...statusBadgeStyle,
                            background: statusColor.bg,
                            color: statusColor.text,
                          }}
                        >
                          {election.status}
                        </span>
                      </div>
                      <div style={electionCardInfoStyle}>
                        <div style={electionCardInfoItemStyle}>
                          <span style={electionCardInfoLabelStyle}>Year:</span>
                          <span>{election.election_year}</span>
                        </div>
                        {election.start_time && (
                          <div style={electionCardInfoItemStyle}>
                            <span style={electionCardInfoLabelStyle}>Start:</span>
                            <span>{formatDate(election.start_time)}</span>
                          </div>
                        )}
                        {election.end_time && (
                          <div style={electionCardInfoItemStyle}>
                            <span style={electionCardInfoLabelStyle}>End:</span>
                            <span>{formatDate(election.end_time)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Election Results */}
          {selectedElection && (
            <div style={sectionStyle}>
              {loadingResults ? (
                <div style={loadingStyle}>Loading results...</div>
              ) : electionResults ? (
                <>
                  {/* Election Summary */}
                  <div style={summaryCardStyle}>
                    <div style={summaryHeaderStyle}>
                      <h2 style={summaryTitleStyle}>{electionResults.election.title}</h2>
                      <span
                        style={{
                          ...statusBadgeStyle,
                          background: getStatusColor(electionResults.election.status).bg,
                          color: getStatusColor(electionResults.election.status).text,
                        }}
                      >
                        {electionResults.election.status}
                      </span>
                    </div>
                    <div style={summaryStatsStyle}>
                      <div style={summaryStatItemStyle}>
                        <div style={summaryStatValueStyle}>{electionResults.total_ballots_cast}</div>
                        <div style={summaryStatLabelStyle}>Total Ballots Cast</div>
                      </div>
                      <div style={summaryStatItemStyle}>
                        <div style={summaryStatValueStyle}>{electionResults.results.length}</div>
                        <div style={summaryStatLabelStyle}>Positions</div>
                      </div>
                    </div>
                  </div>

                  {/* Results by Position */}
                  {electionResults.results.map((positionResult) => (
                    <div key={positionResult.position_id} style={positionCardStyle}>
                      <div style={positionHeaderStyle}>
                        <h3 style={positionTitleStyle}>{positionResult.position_name}</h3>
                        <div style={positionVoteCountStyle}>
                          Total Votes: {positionResult.total_votes}
                        </div>
                      </div>

                      {/* Candidates Results */}
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
                                ...(isWinner ? winnerCardStyle : {}),
                              }}
                            >
                              <div style={candidateHeaderStyle}>
                                <div style={candidateRankStyle}>#{index + 1}</div>
                                <div style={candidatePhotoContainerStyle}>
                                  {candidate.photo_url ? (
                                    <img
                                      src={candidate.photo_url}
                                      alt={candidate.candidate_name}
                                      style={candidatePhotoStyle}
                                    />
                                  ) : (
                                    <div style={candidatePhotoPlaceholderStyle}>
                                      {candidate.candidate_name
                                        .split(' ')
                                        .map((n) => n[0])
                                        .join('')}
                                    </div>
                                  )}
                                  {isWinner && <div style={winnerBadgeStyle}>🏆</div>}
                                </div>
                                <div style={candidateInfoStyle}>
                                  <h4 style={candidateNameStyle}>{candidate.candidate_name}</h4>
                                  <div style={candidateDetailsStyle}>
                                    {candidate.department && (
                                      <span style={candidateDetailItemStyle}>
                                        {candidate.department}
                                      </span>
                                    )}
                                    <span style={candidateDetailItemStyle}>
                                      Year {candidate.year_of_study}
                                    </span>
                                  </div>
                                  {candidate.platform_statement && (
                                    <p style={candidatePlatformStyle}>{candidate.platform_statement}</p>
                                  )}
                                </div>
                                <div style={candidateVotesStyle}>
                                  <div style={candidateVoteCountStyle}>{candidate.vote_count}</div>
                                  <div style={candidateVoteLabelStyle}>votes</div>
                                  <div style={candidateVotePercentageStyle}>{percentage}%</div>
                                </div>
                              </div>
                              <div style={voteBarContainerStyle}>
                                <div
                                  style={{
                                    ...voteBarStyle,
                                    width: `${percentage}%`,
                                    background: isWinner
                                      ? 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                                      : 'linear-gradient(90deg, #93c5fd 0%, #60a5fa 100%)',
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}

                        {/* None of the Above */}
                        {positionResult.none_of_the_above_votes > 0 && (
                          <div style={noneOfAboveCardStyle}>
                            <div style={candidateHeaderStyle}>
                              <div style={candidateInfoStyle}>
                                <h4 style={candidateNameStyle}>None of the Above</h4>
                              </div>
                              <div style={candidateVotesStyle}>
                                <div style={candidateVoteCountStyle}>
                                  {positionResult.none_of_the_above_votes}
                                </div>
                                <div style={candidateVoteLabelStyle}>votes</div>
                                <div style={candidateVotePercentageStyle}>
                                  {calculatePercentage(
                                    positionResult.none_of_the_above_votes,
                                    positionResult.total_votes
                                  )}
                                  %
                                </div>
                              </div>
                            </div>
                            <div style={voteBarContainerStyle}>
                              <div
                                style={{
                                  ...voteBarStyle,
                                  width: `${calculatePercentage(
                                    positionResult.none_of_the_above_votes,
                                    positionResult.total_votes
                                  )}%`,
                                  background: 'linear-gradient(90deg, #d1d5db 0%, #9ca3af 100%)',
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {positionResult.candidates.length === 0 &&
                          positionResult.none_of_the_above_votes === 0 && (
                            <div style={emptyStateStyle}>
                              <span style={emptyIconStyle}>📊</span>
                              <p>No votes cast for this position yet.</p>
                            </div>
                          )}
                      </div>
                    </div>
                  ))}
                </>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

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

const headerStyle = {
  marginBottom: '32px',
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
  margin: 0,
};

const sectionStyle = {
  marginBottom: '32px',
};

const sectionTitleStyle = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0 0 20px',
};

const errorStyle = {
  background: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: '8px',
  padding: '12px 16px',
  color: '#dc2626',
  marginBottom: '24px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const loadingStyle = {
  padding: '48px',
  textAlign: 'center',
  color: '#6b7280',
  fontSize: '16px',
};

const emptyStateStyle = {
  padding: '48px',
  textAlign: 'center',
  color: '#6b7280',
};

const emptyIconStyle = {
  fontSize: '48px',
  display: 'block',
  marginBottom: '16px',
};

const electionsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: '20px',
};

const electionCardStyle = {
  background: '#ffffff',
  borderRadius: '12px',
  padding: '20px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  border: '1px solid #e5e7eb',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};

const selectedCardStyle = {
  border: '2px solid #667eea',
  boxShadow: '0 4px 6px rgba(102, 126, 234, 0.2)',
};

const electionCardHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '16px',
};

const electionCardTitleStyle = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#111827',
  margin: 0,
  flex: 1,
};

const statusBadgeStyle = {
  fontSize: '11px',
  fontWeight: '600',
  padding: '4px 10px',
  borderRadius: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const electionCardInfoStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const electionCardInfoItemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '13px',
  color: '#6b7280',
};

const electionCardInfoLabelStyle = {
  fontWeight: '600',
  color: '#374151',
};

const summaryCardStyle = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  borderRadius: '12px',
  padding: '32px',
  marginBottom: '32px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
};

const summaryHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
};

const summaryTitleStyle = {
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#ffffff',
  margin: 0,
};

const summaryStatsStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
  gap: '24px',
};

const summaryStatItemStyle = {
  textAlign: 'center',
};

const summaryStatValueStyle = {
  fontSize: '36px',
  fontWeight: 'bold',
  color: '#ffffff',
  marginBottom: '8px',
};

const summaryStatLabelStyle = {
  fontSize: '14px',
  color: 'rgba(255,255,255,0.9)',
  fontWeight: '500',
};

const positionCardStyle = {
  background: '#ffffff',
  borderRadius: '12px',
  padding: '24px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  border: '1px solid #e5e7eb',
  marginBottom: '24px',
};

const positionHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
  paddingBottom: '16px',
  borderBottom: '2px solid #f3f4f6',
};

const positionTitleStyle = {
  fontSize: '22px',
  fontWeight: 'bold',
  color: '#111827',
  margin: 0,
};

const positionVoteCountStyle = {
  fontSize: '14px',
  color: '#6b7280',
  fontWeight: '600',
};

const candidatesListStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const candidateCardStyle = {
  background: '#ffffff',
  borderRadius: '8px',
  padding: '20px',
  border: '1px solid #e5e7eb',
  transition: 'all 0.2s ease',
};

const winnerCardStyle = {
  border: '2px solid #667eea',
  background: 'linear-gradient(to right, #ffffff, #f5f7ff)',
  boxShadow: '0 2px 4px rgba(102, 126, 234, 0.15)',
};

const candidateHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  marginBottom: '12px',
};

const candidateRankStyle = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#9ca3af',
  minWidth: '40px',
  textAlign: 'center',
};

const candidatePhotoContainerStyle = {
  position: 'relative',
  flexShrink: 0,
};

const candidatePhotoStyle = {
  width: '64px',
  height: '64px',
  borderRadius: '50%',
  objectFit: 'cover',
  border: '2px solid #e5e7eb',
};

const candidatePhotoPlaceholderStyle = {
  width: '64px',
  height: '64px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#ffffff',
  fontWeight: '600',
  fontSize: '20px',
};

const winnerBadgeStyle = {
  position: 'absolute',
  top: '-4px',
  right: '-4px',
  fontSize: '24px',
  background: '#ffffff',
  borderRadius: '50%',
  padding: '2px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
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
  gap: '12px',
  marginBottom: '8px',
  flexWrap: 'wrap',
};

const candidateDetailItemStyle = {
  fontSize: '13px',
  color: '#6b7280',
  background: '#f3f4f6',
  padding: '4px 10px',
  borderRadius: '6px',
};

const candidatePlatformStyle = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '8px 0 0',
  fontStyle: 'italic',
  lineHeight: '1.5',
};

const candidateVotesStyle = {
  textAlign: 'right',
  flexShrink: 0,
  minWidth: '100px',
};

const candidateVoteCountStyle = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#111827',
  marginBottom: '4px',
};

const candidateVoteLabelStyle = {
  fontSize: '12px',
  color: '#9ca3af',
  marginBottom: '4px',
};

const candidateVotePercentageStyle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#667eea',
};

const voteBarContainerStyle = {
  width: '100%',
  height: '8px',
  background: '#f3f4f6',
  borderRadius: '4px',
  overflow: 'hidden',
};

const voteBarStyle = {
  height: '100%',
  borderRadius: '4px',
  transition: 'width 0.3s ease',
};

const noneOfAboveCardStyle = {
  background: '#f9fafb',
  borderRadius: '8px',
  padding: '20px',
  border: '1px solid #e5e7eb',
};

export default CheckResults;

