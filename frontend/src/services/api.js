import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token and user ID
api.interceptors.request.use(
  (config) => {
    // Add user_id from localStorage if available (for admin routes)
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        if (user && user.id) {
          // Add user_id as header (works for all HTTP methods)
          config.headers['X-User-Id'] = user.id;
          // Also add to request body for POST/PUT requests if it's JSON and has data
          if (['POST', 'PUT', 'PATCH'].includes(config.method?.toUpperCase()) && 
              config.data && typeof config.data === 'object' && !(config.data instanceof FormData)) {
            // Merge user_id into existing data without overwriting
            config.data = { ...config.data, user_id: user.id };
          }
        }
      }
    } catch (error) {
      // Silently fail if localStorage is not available
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      localStorage.removeItem('student');
      //window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  // Register a new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Verify OTP
  verifyOTP: async (otpData) => {
    const response = await api.post('/auth/verify-otp', otpData);
    return response.data;
  },

  // Resend OTP
  resendOTP: async (otpData) => {
    const response = await api.post('/auth/resend-otp', otpData);
    return response.data;
  },

  // Send login OTP
  sendLoginOTP: async (identifier) => {
    const response = await api.post('/auth/send-login-otp', identifier);
    return response.data;
  },

  // OTP login
  otpLogin: async (credentials) => {
    const response = await api.post('/auth/otp-login', credentials);
    return response.data;
  },

  // Get user profile
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Logout (if you implement server-side logout)
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

// Student API functions
export const studentAPI = {
  // Create student profile
  createProfile: async (studentData) => {
    const response = await api.post('/auth/create-student-profile', studentData);
    return response.data;
  },

  // Get student profile
  getProfile: async (userId) => {
    const response = await api.get(`/auth/student-profile/${userId}`);
    return response.data;
  },

  // Get departments
  getDepartments: async () => {
    const response = await api.get('/auth/departments');
    return response.data;
  },
};

// Election API functions
export const electionAPI = {
  // Get all elections
  getElections: async () => {
    const response = await api.get('/elections');
    return response.data;
  },

  // Get active elections
  getActiveElections: async () => {
    const response = await api.get('/voting/elections/active');
    return response.data;
  },

  // Get upcoming elections
  getUpcomingElections: async () => {
    const response = await api.get('/voting/elections/upcoming');
    return response.data;
  },
};

// Candidate API functions
export const candidateAPI = {
  // Apply for position
  applyForPosition: async (applicationData) => {
    const response = await api.post('/candidates/apply', applicationData);
    return response.data;
  },

  // Get my applications
  getMyApplications: async (studentId) => {
    const response = await api.get(`/candidates/my-applications/${studentId}`);
    return response.data;
  },

  // Get candidates by election
  getCandidatesByElection: async (electionId) => {
    const response = await api.get(`/candidates/election/${electionId}`);
    return response.data;
  },
};

// Voting API functions
export const votingAPI = {
  // Submit vote
  submitVote: async (voteData) => {
    const response = await api.post('/voting/submit', voteData);
    return response.data;
  },

  // Check voting status
  getVotingStatus: async (studentId, electionId) => {
    const response = await api.get(`/voting/status/${studentId}/${electionId}`);
    return response.data;
  },

  // Get election results
  getElectionResults: async (electionId) => {
    const response = await api.get(`/voting/results/${electionId}`);
    return response.data;
  },

  // Get position results
  getPositionResults: async (electionId, positionId) => {
    const response = await api.get(`/voting/results/${electionId}/position/${positionId}`);
    return response.data;
  },

  // Get elections for results viewing
  getElectionsForResults: async () => {
    const response = await api.get('/voting/results/elections');
    return response.data;
  },
};

// Admin API functions
export const adminAPI = {
  // Get all elections (admin)
  getAllElections: async () => {
    // Get user_id from localStorage for GET requests
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        if (user && user.id) {
          const response = await api.get('/admin/elections', {
            params: { user_id: user.id }
          });
          return response.data;
        }
      }
    } catch (error) {
      console.error('Error getting user from localStorage:', error);
    }
    throw new Error('User not authenticated');
  },

  // Create election
  createElection: async (electionData) => {
    const response = await api.post('/admin/elections', electionData);
    return response.data;
  },

  // Update election
  updateElection: async (electionId, electionData) => {
    const response = await api.put(`/admin/elections/${electionId}`, electionData);
    return response.data;
  },

  // Delete election
  deleteElection: async (electionId) => {
    const response = await api.delete(`/admin/elections/${electionId}`);
    return response.data;
  },

  // Get positions for election
  getElectionPositions: async (electionId) => {
    // Get user_id from localStorage for GET requests
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        if (user && user.id) {
          const response = await api.get(`/admin/elections/${electionId}/positions`, {
            params: { user_id: user.id }
          });
          return response.data;
        }
      }
    } catch (error) {
      console.error('Error getting user from localStorage:', error);
    }
    throw new Error('User not authenticated');
  },

  // Create position
  createPosition: async (electionId, positionData) => {
    const response = await api.post(`/admin/elections/${electionId}/positions`, positionData);
    return response.data;
  },

  // Update position
  updatePosition: async (positionId, positionData) => {
    const response = await api.put(`/admin/positions/${positionId}`, positionData);
    return response.data;
  },

  // Delete position
  deletePosition: async (positionId) => {
    const response = await api.delete(`/admin/positions/${positionId}`);
    return response.data;
  },

  // Get statistics
  getStatistics: async () => {
    // Get user_id from localStorage for GET requests
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        if (user && user.id) {
          const response = await api.get('/admin/statistics', {
            params: { user_id: user.id }
          });
          return response.data;
        }
      }
    } catch (error) {
      console.error('Error getting user from localStorage:', error);
    }
    throw new Error('User not authenticated');
  },

  // Get pending applications
  getPendingApplications: async () => {
    const response = await api.get('/candidates/admin/pending');
    return response.data;
  },

  // Approve candidate
  approveCandidate: async (candidateId) => {
    const response = await api.post(`/candidates/admin/${candidateId}/approve`);
    return response.data;
  },

  // Reject candidate
  rejectCandidate: async (candidateId, reason) => {
    const response = await api.post(`/candidates/admin/${candidateId}/reject`, { reason });
    return response.data;
  },

  // Get candidate statistics
  getCandidateStatistics: async () => {
    const response = await api.get('/candidates/admin/statistics');
    return response.data;
  },
};

export default api;
