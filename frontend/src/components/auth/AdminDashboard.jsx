import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar';
import TopBar from '../TopBar';
import { adminAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const AdminDashboard = () => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Dashboard state
  const [statistics, setStatistics] = useState(null);
  const [candidateStats, setCandidateStats] = useState(null);

  // Candidate Approval state
  const [pendingApplications, setPendingApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // Election Management state
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [showElectionForm, setShowElectionForm] = useState(false);
  const [electionForm, setElectionForm] = useState({
    title: '',
    election_year: '',
    description: '',
    start_time: '',
    end_time: '',
    status: 'UPCOMING',
    is_anonymous_tally: true,
  });

  // Position Management state
  const [positions, setPositions] = useState([]);
  const [showPositionForm, setShowPositionForm] = useState(false);
  const [positionForm, setPositionForm] = useState({ name: '' });
  const [editingPosition, setEditingPosition] = useState(null);

  useEffect(() => {
    if (!isAdmin()) {
      setError('Access denied. Admin privileges required.');
      return;
    }
    if (activeTab === 'positions' && !selectedElection) {
      // Load elections for positions tab
      loadElections();
    } else {
      loadDashboardData();
    }
  }, [activeTab, selectedElection]);

  useEffect(() => {
    if (activeTab === 'positions' && selectedElection) {
      loadDashboardData();
    }
  }, [selectedElection]);

  const loadElections = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminAPI.getAllElections();
      setElections(response.elections || []);
    } catch (err) {
      console.error('Error loading elections:', err);
      setError(err.response?.data?.error || 'Failed to load elections');
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'dashboard') {
        const [statsRes, candidateStatsRes] = await Promise.all([
          adminAPI.getStatistics(),
          adminAPI.getCandidateStatistics(),
        ]);
        setStatistics(statsRes);
        setCandidateStats(candidateStatsRes);
      } else if (activeTab === 'candidates') {
        const response = await adminAPI.getPendingApplications();
        setPendingApplications(response.pending_applications || []);
      } else if (activeTab === 'elections') {
        const response = await adminAPI.getAllElections();
        setElections(response.elections || []);
      } else if (activeTab === 'positions') {
        if (!elections.length) {
          // Load elections if not already loaded
          await loadElections();
        }
        if (selectedElection) {
          try {
            const response = await adminAPI.getElectionPositions(selectedElection.id);
            setPositions(response.positions || []);
          } catch (err) {
            // If it's a 403, user lost admin privileges or not admin
            if (err.response?.status === 403) {
              setError('You do not have admin privileges. Please log in again.');
            }
            throw err;
          }
        } else {
          setPositions([]);
        }
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveCandidate = async (candidateId) => {
    if (!window.confirm('Are you sure you want to approve this candidate?')) return;
    
    setLoading(true);
    setError('');
    try {
      await adminAPI.approveCandidate(candidateId);
      setSuccess('Candidate approved successfully');
      loadDashboardData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to approve candidate');
    } finally {
      setLoading(false);
      setTimeout(() => {
        setSuccess('');
        setError('');
      }, 3000);
    }
  };

  const handleRejectCandidate = async (candidateId) => {
    if (!rejectReason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }
    
    if (!window.confirm('Are you sure you want to reject this candidate?')) return;
    
    setLoading(true);
    setError('');
    try {
      await adminAPI.rejectCandidate(candidateId, rejectReason);
      setSuccess('Candidate rejected successfully');
      setSelectedApplication(null);
      setRejectReason('');
      loadDashboardData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reject candidate');
    } finally {
      setLoading(false);
      setTimeout(() => {
        setSuccess('');
        setError('');
      }, 3000);
    }
  };

  const handleCreateElection = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await adminAPI.createElection(electionForm);
      setSuccess('Election created successfully');
      setShowElectionForm(false);
      resetElectionForm();
      loadDashboardData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create election');
    } finally {
      setLoading(false);
      setTimeout(() => {
        setSuccess('');
        setError('');
      }, 3000);
    }
  };

  const handleUpdateElectionStatus = async (electionId, newStatus) => {
    if (!window.confirm(`Are you sure you want to change the election status to ${newStatus}?`)) return;
    
    setLoading(true);
    setError('');
    try {
      await adminAPI.updateElection(electionId, { status: newStatus });
      setSuccess('Election status updated successfully');
      loadDashboardData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update election status');
    } finally {
      setLoading(false);
      setTimeout(() => {
        setSuccess('');
        setError('');
      }, 3000);
    }
  };

  const handleDeleteElection = async (electionId) => {
    if (!window.confirm('Are you sure you want to delete this election? This action cannot be undone.')) return;
    
    setLoading(true);
    setError('');
    try {
      await adminAPI.deleteElection(electionId);
      setSuccess('Election deleted successfully');
      loadDashboardData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete election');
    } finally {
      setLoading(false);
      setTimeout(() => {
        setSuccess('');
        setError('');
      }, 3000);
    }
  };

  const handleCreatePosition = async (e) => {
    e.preventDefault();
    if (!selectedElection) {
      setError('Please select an election first');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      await adminAPI.createPosition(selectedElection.id, positionForm);
      setSuccess('Position created successfully');
      setShowPositionForm(false);
      setPositionForm({ name: '' });
      loadDashboardData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create position');
    } finally {
      setLoading(false);
      setTimeout(() => {
        setSuccess('');
        setError('');
      }, 3000);
    }
  };

  const handleUpdatePosition = async (e) => {
    e.preventDefault();
    if (!editingPosition) return;
    
    setLoading(true);
    setError('');
    try {
      await adminAPI.updatePosition(editingPosition.id, positionForm);
      setSuccess('Position updated successfully');
      setShowPositionForm(false);
      setEditingPosition(null);
      setPositionForm({ name: '' });
      loadDashboardData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update position');
    } finally {
      setLoading(false);
      setTimeout(() => {
        setSuccess('');
        setError('');
      }, 3000);
    }
  };

  const handleDeletePosition = async (positionId) => {
    if (!window.confirm('Are you sure you want to delete this position?')) return;
    
    setLoading(true);
    setError('');
    try {
      await adminAPI.deletePosition(positionId);
      setSuccess('Position deleted successfully');
      loadDashboardData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete position');
    } finally {
      setLoading(false);
      setTimeout(() => {
        setSuccess('');
        setError('');
      }, 3000);
    }
  };

  const resetElectionForm = () => {
    setElectionForm({
      title: '',
      election_year: '',
      description: '',
      start_time: '',
      end_time: '',
      status: 'UPCOMING',
      is_anonymous_tally: true,
    });
  };

  const openPositionForm = (position = null) => {
    if (position) {
      setEditingPosition(position);
      setPositionForm({ name: position.name });
    } else {
      setEditingPosition(null);
      setPositionForm({ name: '' });
    }
    setShowPositionForm(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'UPCOMING':
        return { bg: '#fef3c7', text: '#92400e' };
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isAdmin()) {
    return (
      <div style={layoutStyle}>
        <Sidebar />
        <div style={mainContentStyle}>
          <TopBar />
          <div style={contentWrapperStyle}>
            <div style={errorCardStyle}>
              <h2>Access Denied</h2>
              <p>You do not have admin privileges to access this page.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={layoutStyle}>
      <Sidebar />
      <div style={mainContentStyle}>
        <TopBar />
        <div style={contentWrapperStyle}>
          <div style={headerStyle}>
            <h1 style={titleStyle}>👑 Admin Dashboard</h1>
            <p style={subtitleStyle}>Manage elections, positions, and candidate approvals</p>
          </div>

          {error && (
            <div style={alertErrorStyle}>
              <span>⚠️</span> {error}
            </div>
          )}

          {success && (
            <div style={alertSuccessStyle}>
              <span>✅</span> {success}
            </div>
          )}

          {/* Tabs */}
          <div style={tabsStyle}>
            <button
              onClick={() => setActiveTab('dashboard')}
              style={{ ...tabStyle, ...(activeTab === 'dashboard' ? activeTabStyle : {}) }}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => setActiveTab('candidates')}
              style={{ ...tabStyle, ...(activeTab === 'candidates' ? activeTabStyle : {}) }}
            >
              👤 Candidate Approval
            </button>
            <button
              onClick={() => setActiveTab('elections')}
              style={{ ...tabStyle, ...(activeTab === 'elections' ? activeTabStyle : {}) }}
            >
              🗳️ Elections
            </button>
            <button
              onClick={() => setActiveTab('positions')}
              style={{ ...tabStyle, ...(activeTab === 'positions' ? activeTabStyle : {}) }}
            >
              📋 Positions
            </button>
          </div>

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div style={tabContentStyle}>
              {loading ? (
                <div style={loadingStyle}>Loading statistics...</div>
              ) : statistics && candidateStats ? (
                <>
                  <div style={statsGridStyle}>
                    <div style={statCardStyle}>
                      <div style={statValueStyle}>{statistics.elections.total}</div>
                      <div style={statLabelStyle}>Total Elections</div>
                      <div style={statSubLabelStyle}>
                        {statistics.elections.upcoming} Upcoming • {statistics.elections.active} Active • {statistics.elections.completed} Completed
                      </div>
                    </div>
                    <div style={statCardStyle}>
                      <div style={statValueStyle}>{candidateStats.overview.total_applications}</div>
                      <div style={statLabelStyle}>Total Applications</div>
                      <div style={statSubLabelStyle}>
                        {candidateStats.overview.approved_applications} Approved • {candidateStats.overview.pending_applications} Pending
                      </div>
                    </div>
                    <div style={statCardStyle}>
                      <div style={statValueStyle}>{statistics.positions.total}</div>
                      <div style={statLabelStyle}>Total Positions</div>
                    </div>
                    <div style={statCardStyle}>
                      <div style={statValueStyle}>{statistics.voting.total_ballots}</div>
                      <div style={statLabelStyle}>Total Ballots Cast</div>
                    </div>
                  </div>

                  {candidateStats.by_election && candidateStats.by_election.length > 0 && (
                    <div style={sectionStyle}>
                      <h2 style={sectionTitleStyle}>Applications by Election</h2>
                      <div style={tableContainerStyle}>
                        <table style={tableStyle}>
                          <thead>
                            <tr>
                              <th>Election</th>
                              <th>Year</th>
                              <th>Status</th>
                              <th>Total</th>
                              <th>Approved</th>
                              <th>Pending</th>
                            </tr>
                          </thead>
                          <tbody>
                            {candidateStats.by_election.map((stat) => {
                              const statusColor = getStatusColor(stat.status);
                              return (
                                <tr key={stat.election_id}>
                                  <td>{stat.title}</td>
                                  <td>{stat.election_year}</td>
                                  <td>
                                    <span style={{ ...statusBadgeStyle, ...statusColor }}>
                                      {stat.status}
                                    </span>
                                  </td>
                                  <td>{stat.total_applications}</td>
                                  <td style={{ color: '#059669', fontWeight: '600' }}>
                                    {stat.approved_applications}
                                  </td>
                                  <td style={{ color: '#d97706', fontWeight: '600' }}>
                                    {stat.pending_applications}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          )}

          {/* Candidate Approval Tab */}
          {activeTab === 'candidates' && (
            <div style={tabContentStyle}>
              {loading ? (
                <div style={loadingStyle}>Loading pending applications...</div>
              ) : pendingApplications.length === 0 ? (
                <div style={emptyStateStyle}>
                  <span style={emptyIconStyle}>✅</span>
                  <p>No pending applications. All candidates have been reviewed!</p>
                </div>
              ) : (
                <div style={applicationsListStyle}>
                  {pendingApplications.map((app) => (
                    <div key={app.id} style={applicationCardStyle}>
                      <div style={applicationHeaderStyle}>
                        <div style={applicationInfoStyle}>
                          <h3 style={applicationNameStyle}>
                            {app.student.user.first_name} {app.student.user.last_name}
                          </h3>
                          <div style={applicationDetailsStyle}>
                            <span>{app.student.department?.name || 'N/A'}</span>
                            <span>•</span>
                            <span>Year {app.student.year_of_study}</span>
                            <span>•</span>
                            <span>{app.student.user.email}</span>
                          </div>
                        </div>
                        <div style={applicationActionsStyle}>
                          <button
                            onClick={() => handleApproveCandidate(app.id)}
                            style={approveButtonStyle}
                            disabled={loading}
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => setSelectedApplication(app)}
                            style={rejectButtonStyle}
                            disabled={loading}
                          >
                            ✗ Reject
                          </button>
                        </div>
                      </div>
                      <div style={applicationBodyStyle}>
                        <div style={applicationSectionStyle}>
                          <strong>Position:</strong> {app.position.name}
                        </div>
                        <div style={applicationSectionStyle}>
                          <strong>Election:</strong> {app.election.title} ({app.election.election_year})
                        </div>
                        {app.platform_statement && (
                          <div style={applicationSectionStyle}>
                            <strong>Platform Statement:</strong>
                            <p style={platformStatementStyle}>{app.platform_statement}</p>
                          </div>
                        )}
                        {app.photo_url && (
                          <div style={applicationSectionStyle}>
                            <img src={app.photo_url} alt="Candidate" style={candidatePhotoStyle} />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reject Modal */}
              {selectedApplication && (
                <div style={modalOverlayStyle} onClick={() => setSelectedApplication(null)}>
                  <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                    <h3 style={modalTitleStyle}>Reject Candidate Application</h3>
                    <p style={modalTextStyle}>
                      Rejecting: {selectedApplication.student.user.first_name}{' '}
                      {selectedApplication.student.user.last_name}
                    </p>
                    <textarea
                      placeholder="Enter rejection reason (optional)"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      style={textAreaStyle}
                      rows={4}
                    />
                    <div style={modalActionsStyle}>
                      <button
                        onClick={() => {
                          setSelectedApplication(null);
                          setRejectReason('');
                        }}
                        style={cancelButtonStyle}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleRejectCandidate(selectedApplication.id)}
                        style={confirmRejectButtonStyle}
                        disabled={loading}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Elections Tab */}
          {activeTab === 'elections' && (
            <div style={tabContentStyle}>
              <div style={sectionHeaderStyle}>
                <h2 style={sectionTitleStyle}>Elections</h2>
                <button
                  onClick={() => {
                    resetElectionForm();
                    setShowElectionForm(true);
                  }}
                  style={primaryButtonStyle}
                >
                  + Create Election
                </button>
              </div>

              {loading ? (
                <div style={loadingStyle}>Loading elections...</div>
              ) : elections.length === 0 ? (
                <div style={emptyStateStyle}>
                  <span style={emptyIconStyle}>🗳️</span>
                  <p>No elections found. Create your first election!</p>
                </div>
              ) : (
                <div style={electionsGridStyle}>
                  {elections.map((election) => {
                    const statusColor = getStatusColor(election.status);
                    return (
                      <div key={election.id} style={electionCardStyle}>
                        <div style={electionCardHeaderStyle}>
                          <h3 style={electionCardTitleStyle}>{election.title}</h3>
                          <span style={{ ...statusBadgeStyle, ...statusColor }}>
                            {election.status}
                          </span>
                        </div>
                        <div style={electionCardBodyStyle}>
                          <div style={electionCardInfoStyle}>
                            <strong>Year:</strong> {election.election_year || 'N/A'}
                          </div>
                          <div style={electionCardInfoStyle}>
                            <strong>Start:</strong> {formatDate(election.start_time)}
                          </div>
                          <div style={electionCardInfoStyle}>
                            <strong>End:</strong> {formatDate(election.end_time)}
                          </div>
                          <div style={electionCardInfoStyle}>
                            <strong>Positions:</strong> {election.position_count}
                          </div>
                          <div style={electionCardInfoStyle}>
                            <strong>Candidates:</strong> {election.approved_candidate_count} / {election.candidate_count}
                          </div>
                        </div>
                        <div style={electionCardActionsStyle}>
                          <select
                            value={election.status}
                            onChange={(e) => handleUpdateElectionStatus(election.id, e.target.value)}
                            style={statusSelectStyle}
                            disabled={loading}
                          >
                            <option value="UPCOMING">UPCOMING</option>
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="COMPLETED">COMPLETED</option>
                            <option value="ARCHIVED">ARCHIVED</option>
                          </select>
                          <button
                            onClick={() => handleDeleteElection(election.id)}
                            style={deleteButtonStyle}
                            disabled={loading}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Create Election Form */}
              {showElectionForm && (
                <div style={modalOverlayStyle} onClick={() => setShowElectionForm(false)}>
                  <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                    <h3 style={modalTitleStyle}>Create New Election</h3>
                    <form onSubmit={handleCreateElection} style={formStyle}>
                      <div style={formGroupStyle}>
                        <label style={labelStyle}>Title *</label>
                        <input
                          type="text"
                          value={electionForm.title}
                          onChange={(e) => setElectionForm({ ...electionForm, title: e.target.value })}
                          required
                          style={inputStyle}
                        />
                      </div>
                      <div style={formGroupStyle}>
                        <label style={labelStyle}>Election Year</label>
                        <input
                          type="text"
                          value={electionForm.election_year}
                          onChange={(e) => setElectionForm({ ...electionForm, election_year: e.target.value })}
                          style={inputStyle}
                        />
                      </div>
                      <div style={formGroupStyle}>
                        <label style={labelStyle}>Description</label>
                        <textarea
                          value={electionForm.description}
                          onChange={(e) => setElectionForm({ ...electionForm, description: e.target.value })}
                          style={textAreaStyle}
                          rows={3}
                        />
                      </div>
                      <div style={formRowStyle}>
                        <div style={formGroupStyle}>
                          <label style={labelStyle}>Start Time *</label>
                          <input
                            type="datetime-local"
                            value={electionForm.start_time}
                            onChange={(e) => setElectionForm({ ...electionForm, start_time: e.target.value })}
                            required
                            style={inputStyle}
                          />
                        </div>
                        <div style={formGroupStyle}>
                          <label style={labelStyle}>End Time *</label>
                          <input
                            type="datetime-local"
                            value={electionForm.end_time}
                            onChange={(e) => setElectionForm({ ...electionForm, end_time: e.target.value })}
                            required
                            style={inputStyle}
                          />
                        </div>
                      </div>
                      <div style={formGroupStyle}>
                        <label style={labelStyle}>Status</label>
                        <select
                          value={electionForm.status}
                          onChange={(e) => setElectionForm({ ...electionForm, status: e.target.value })}
                          style={inputStyle}
                        >
                          <option value="UPCOMING">UPCOMING</option>
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="ARCHIVED">ARCHIVED</option>
                        </select>
                      </div>
                      <div style={modalActionsStyle}>
                        <button
                          type="button"
                          onClick={() => {
                            setShowElectionForm(false);
                            resetElectionForm();
                          }}
                          style={cancelButtonStyle}
                        >
                          Cancel
                        </button>
                        <button type="submit" style={primaryButtonStyle} disabled={loading}>
                          Create
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Positions Tab */}
          {activeTab === 'positions' && (
            <div style={tabContentStyle}>
              <div style={sectionHeaderStyle}>
                <h2 style={sectionTitleStyle}>Positions</h2>
                <div style={electionSelectStyle}>
                  <label style={labelStyle}>Select Election:</label>
                  <select
                    value={selectedElection?.id || ''}
                    onChange={(e) => {
                      const election = elections.find((el) => el.id === e.target.value);
                      setSelectedElection(election || null);
                    }}
                    style={inputStyle}
                  >
                    <option value="">-- Select Election --</option>
                    {elections.map((el) => (
                      <option key={el.id} value={el.id}>
                        {el.title} ({el.election_year})
                      </option>
                    ))}
                  </select>
                </div>
                {selectedElection && (
                  <button
                    onClick={() => openPositionForm()}
                    style={primaryButtonStyle}
                  >
                    + Add Position
                  </button>
                )}
              </div>

              {!selectedElection ? (
                <div style={emptyStateStyle}>
                  <span style={emptyIconStyle}>📋</span>
                  <p>Please select an election to manage positions</p>
                </div>
              ) : loading ? (
                <div style={loadingStyle}>Loading positions...</div>
              ) : positions.length === 0 ? (
                <div style={emptyStateStyle}>
                  <span style={emptyIconStyle}>📋</span>
                  <p>No positions found for this election. Add your first position!</p>
                </div>
              ) : (
                <div style={positionsGridStyle}>
                  {positions.map((position) => (
                    <div key={position.id} style={positionCardStyle}>
                      <div style={positionCardHeaderStyle}>
                        <h3 style={positionCardTitleStyle}>{position.name}</h3>
                        <div style={positionCardInfoStyle}>
                          {position.candidate_count} candidate(s)
                        </div>
                      </div>
                      <div style={positionCardActionsStyle}>
                        <button
                          onClick={() => openPositionForm(position)}
                          style={editButtonStyle}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePosition(position.id)}
                          style={deleteButtonStyle}
                          disabled={loading || position.candidate_count > 0}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Position Form Modal */}
              {showPositionForm && (
                <div style={modalOverlayStyle} onClick={() => setShowPositionForm(false)}>
                  <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                    <h3 style={modalTitleStyle}>
                      {editingPosition ? 'Edit Position' : 'Create New Position'}
                    </h3>
                    <form onSubmit={editingPosition ? handleUpdatePosition : handleCreatePosition} style={formStyle}>
                      <div style={formGroupStyle}>
                        <label style={labelStyle}>Position Name *</label>
                        <input
                          type="text"
                          value={positionForm.name}
                          onChange={(e) => setPositionForm({ ...positionForm, name: e.target.value })}
                          required
                          style={inputStyle}
                          placeholder="e.g., President, Secretary"
                        />
                      </div>
                      <div style={modalActionsStyle}>
                        <button
                          type="button"
                          onClick={() => {
                            setShowPositionForm(false);
                            setEditingPosition(null);
                            setPositionForm({ name: '' });
                          }}
                          style={cancelButtonStyle}
                        >
                          Cancel
                        </button>
                        <button type="submit" style={primaryButtonStyle} disabled={loading}>
                          {editingPosition ? 'Update' : 'Create'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
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
  maxWidth: '1600px',
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

const tabsStyle = {
  display: 'flex',
  gap: '8px',
  marginBottom: '24px',
  borderBottom: '2px solid #e5e7eb',
};

const tabStyle = {
  padding: '12px 24px',
  background: 'transparent',
  border: 'none',
  borderBottom: '2px solid transparent',
  fontSize: '16px',
  fontWeight: '500',
  color: '#6b7280',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};

const activeTabStyle = {
  color: '#667eea',
  borderBottomColor: '#667eea',
  fontWeight: '600',
};

const tabContentStyle = {
  background: '#ffffff',
  borderRadius: '12px',
  padding: '24px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  border: '1px solid #e5e7eb',
};

const loadingStyle = {
  padding: '48px',
  textAlign: 'center',
  color: '#6b7280',
  fontSize: '16px',
};

const errorCardStyle = {
  background: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: '12px',
  padding: '32px',
  textAlign: 'center',
  color: '#dc2626',
};

const alertErrorStyle = {
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

const alertSuccessStyle = {
  background: '#d1fae5',
  border: '1px solid #86efac',
  borderRadius: '8px',
  padding: '12px 16px',
  color: '#065f46',
  marginBottom: '24px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const statsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '20px',
  marginBottom: '32px',
};

const statCardStyle = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  borderRadius: '12px',
  padding: '24px',
  color: '#ffffff',
};

const statValueStyle = {
  fontSize: '36px',
  fontWeight: 'bold',
  marginBottom: '8px',
};

const statLabelStyle = {
  fontSize: '16px',
  fontWeight: '600',
  marginBottom: '4px',
};

const statSubLabelStyle = {
  fontSize: '12px',
  opacity: 0.9,
};

const sectionStyle = {
  marginTop: '32px',
};

const sectionHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px',
};

const sectionTitleStyle = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#111827',
  margin: 0,
};

const statusBadgeStyle = {
  fontSize: '11px',
  fontWeight: '600',
  padding: '4px 10px',
  borderRadius: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const tableContainerStyle = {
  overflowX: 'auto',
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
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

const applicationsListStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const applicationCardStyle = {
  background: '#ffffff',
  borderRadius: '12px',
  padding: '20px',
  border: '1px solid #e5e7eb',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
};

const applicationHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '16px',
};

const applicationInfoStyle = {
  flex: 1,
};

const applicationNameStyle = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#111827',
  margin: '0 0 8px',
};

const applicationDetailsStyle = {
  display: 'flex',
  gap: '8px',
  fontSize: '14px',
  color: '#6b7280',
};

const applicationActionsStyle = {
  display: 'flex',
  gap: '8px',
};

const approveButtonStyle = {
  padding: '8px 16px',
  background: '#059669',
  color: '#ffffff',
  border: 'none',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
};

const rejectButtonStyle = {
  padding: '8px 16px',
  background: '#dc2626',
  color: '#ffffff',
  border: 'none',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
};

const applicationBodyStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const applicationSectionStyle = {
  fontSize: '14px',
  color: '#374151',
  lineHeight: '1.6',
};

const platformStatementStyle = {
  margin: '8px 0 0',
  padding: '12px',
  background: '#f9fafb',
  borderRadius: '6px',
  fontStyle: 'italic',
};

const candidatePhotoStyle = {
  width: '150px',
  height: '150px',
  objectFit: 'cover',
  borderRadius: '8px',
  marginTop: '8px',
};

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalStyle = {
  background: '#ffffff',
  borderRadius: '12px',
  padding: '32px',
  maxWidth: '600px',
  width: '90%',
  maxHeight: '90vh',
  overflowY: 'auto',
};

const modalTitleStyle = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0 0 16px',
};

const modalTextStyle = {
  fontSize: '14px',
  color: '#6b7280',
  marginBottom: '16px',
};

const modalActionsStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '12px',
  marginTop: '24px',
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const formGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const formRowStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '16px',
};

const labelStyle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#374151',
};

const inputStyle = {
  padding: '10px 12px',
  borderRadius: '6px',
  border: '1px solid #d1d5db',
  fontSize: '14px',
};

const textAreaStyle = {
  padding: '10px 12px',
  borderRadius: '6px',
  border: '1px solid #d1d5db',
  fontSize: '14px',
  fontFamily: 'inherit',
  resize: 'vertical',
};

const primaryButtonStyle = {
  padding: '10px 20px',
  background: '#667eea',
  color: '#ffffff',
  border: 'none',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
};

const cancelButtonStyle = {
  padding: '10px 20px',
  background: '#f3f4f6',
  color: '#374151',
  border: 'none',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
};

const confirmRejectButtonStyle = {
  padding: '10px 20px',
  background: '#dc2626',
  color: '#ffffff',
  border: 'none',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
};

const electionsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
  gap: '20px',
};

const electionCardStyle = {
  background: '#ffffff',
  borderRadius: '12px',
  padding: '20px',
  border: '1px solid #e5e7eb',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
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

const electionCardBodyStyle = {
  marginBottom: '16px',
};

const electionCardInfoStyle = {
  fontSize: '14px',
  color: '#6b7280',
  marginBottom: '8px',
};

const electionCardActionsStyle = {
  display: 'flex',
  gap: '8px',
};

const statusSelectStyle = {
  flex: 1,
  padding: '8px 12px',
  borderRadius: '6px',
  border: '1px solid #d1d5db',
  fontSize: '14px',
};

const deleteButtonStyle = {
  padding: '8px 16px',
  background: '#dc2626',
  color: '#ffffff',
  border: 'none',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
};

const electionSelectStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
};

const positionsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: '20px',
};

const positionCardStyle = {
  background: '#ffffff',
  borderRadius: '12px',
  padding: '20px',
  border: '1px solid #e5e7eb',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
};

const positionCardHeaderStyle = {
  marginBottom: '16px',
};

const positionCardTitleStyle = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#111827',
  margin: '0 0 8px',
};

const positionCardInfoStyle = {
  fontSize: '14px',
  color: '#6b7280',
};

const positionCardActionsStyle = {
  display: 'flex',
  gap: '8px',
};

const editButtonStyle = {
  padding: '8px 16px',
  background: '#667eea',
  color: '#ffffff',
  border: 'none',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
};

export default AdminDashboard;

