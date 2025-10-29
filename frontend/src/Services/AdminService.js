

const API_URL = 'https://your-backend-url.com/api'; // TODO: Replace with actual backend URL

export const AdminService = {
  /**
   * Get dashboard statistics
   * @returns {Promise<Object>} Dashboard stats
   */
  getDashboardStats: async () => {
    try {
      const response = await fetch(`${API_URL}/admin/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add authentication token
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }

      return await response.json();
    } catch (error) {
      console.error('Error in getDashboardStats:', error);
      throw error;
    }
  },

  /**
   * Get election status
   * @returns {Promise<Object>} Election status
   */
  getElectionStatus: async () => {
    try {
      const response = await fetch(`${API_URL}/admin/election/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch election status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error in getElectionStatus:', error);
      throw error;
    }
  },

  /**
   * Start election
   * @param {Date} startTime
   * @param {Date} endTime
   */
  startElection: async (startTime, endTime) => {
    try {
      const response = await fetch(`${API_URL}/admin/election/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start election');
      }

      return await response.json();
    } catch (error) {
      console.error('Error in startElection:', error);
      throw error;
    }
  },

  /**
   * Stop election
   */
  stopElection: async () => {
    try {
      const response = await fetch(`${API_URL}/admin/election/stop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to stop election');
      }

      return await response.json();
    } catch (error) {
      console.error('Error in stopElection:', error);
      throw error;
    }
  },

  /**
   * Pause election
   */
  pauseElection: async () => {
    try {
      const response = await fetch(`${API_URL}/admin/election/pause`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to pause election');
      }

      return await response.json();
    } catch (error) {
      console.error('Error in pauseElection:', error);
      throw error;
    }
  },

  /**
   * Resume election
   */
  resumeElection: async () => {
    try {
      const response = await fetch(`${API_URL}/admin/election/resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to resume election');
      }

      return await response.json();
    } catch (error) {
      console.error('Error in resumeElection:', error);
      throw error;
    }
  },

  /**
   * Extend election time
   * @param {number} hours - Hours to extend
   */
  extendElection: async (hours) => {
    try {
      const response = await fetch(`${API_URL}/admin/election/extend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hours }),
      });

      if (!response.ok) {
        throw new Error('Failed to extend election');
      }

      return await response.json();
    } catch (error) {
      console.error('Error in extendElection:', error);
      throw error;
    }
  },

  /**
   * Get all voters
   * @returns {Promise<Array>} List of voters
   */
  getAllVoters: async () => {
    try {
      const response = await fetch(`${API_URL}/admin/voters`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch voters');
      }

      return await response.json();
    } catch (error) {
      console.error('Error in getAllVoters:', error);
      throw error;
    }
  },

  /**
   * Verify voter
   * @param {string} voterId
   */
  verifyVoter: async (voterId) => {
    try {
      const response = await fetch(`${API_URL}/admin/voters/${voterId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to verify voter');
      }

      return await response.json();
    } catch (error) {
      console.error('Error in verifyVoter:', error);
      throw error;
    }
  },

  /**
   * Remove voter
   * @param {string} voterId
   */
  removeVoter: async (voterId) => {
    try {
      const response = await fetch(`${API_URL}/admin/voters/${voterId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to remove voter');
      }

      return await response.json();
    } catch (error) {
      console.error('Error in removeVoter:', error);
      throw error;
    }
  },

  /**
   * Get all candidates
   * @returns {Promise<Array>} List of candidates
   */
  getAllCandidates: async () => {
    try {
      const response = await fetch(`${API_URL}/admin/candidates`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch candidates');
      }

      return await response.json();
    } catch (error) {
      console.error('Error in getAllCandidates:', error);
      throw error;
    }
  },

  /**
   * Approve candidate
   * @param {string} candidateId
   */
  approveCandidate: async (candidateId) => {
    try {
      const response = await fetch(`${API_URL}/admin/candidates/${candidateId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to approve candidate');
      }

      return await response.json();
    } catch (error) {
      console.error('Error in approveCandidate:', error);
      throw error;
    }
  },

  /**
   * Reject candidate
   * @param {string} candidateId
   * @param {string} reason - Rejection reason
   */
  rejectCandidate: async (candidateId, reason) => {
    try {
      const response = await fetch(`${API_URL}/admin/candidates/${candidateId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject candidate');
      }

      return await response.json();
    } catch (error) {
      console.error('Error in rejectCandidate:', error);
      throw error;
    }
  },

  /**
   * Get audit logs
   * @param {Date} startDate
   * @param {Date} endDate
   */
  getAuditLogs: async (startDate, endDate) => {
    try {
      const response = await fetch(
        `${API_URL}/admin/audit-logs?start=${startDate.toISOString()}&end=${endDate.toISOString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch audit logs');
      }

      return await response.json();
    } catch (error) {
      console.error('Error in getAuditLogs:', error);
      throw error;
    }
  },

  /**
   * Log admin action
   * @param {string} action - Action performed
   * @param {Object} details - Action details
   */
  logAction: async (action, details) => {
    try {
      const response = await fetch(`${API_URL}/admin/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          details,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to log action');
      }

      return await response.json();
    } catch (error) {
      console.error('Error in logAction:', error);
      throw error;
    }
  },
};