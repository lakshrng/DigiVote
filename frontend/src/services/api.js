import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // No token-based auth for now - using session-based auth
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
      window.location.href = '/login';
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
};

export default api;
