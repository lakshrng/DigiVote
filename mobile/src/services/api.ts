import axios, { AxiosInstance } from 'axios';
import { storage } from '../utils/storage';
import { API_CONFIG } from '../config/api';

// Create axios instance with base configuration
const api: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: API_CONFIG.TIMEOUT,
});

// Request interceptor to add auth token and user ID
api.interceptors.request.use(
  async (config) => {
    // Add user_id from storage if available (for admin routes)
    try {
      const user = await storage.getItem('user');
      if (user && user.id) {
        // Add user_id as header (works for all HTTP methods)
        config.headers['X-User-Id'] = user.id;
        // Also add to request body for POST/PUT requests if it's JSON and has data
        if (
          ['POST', 'PUT', 'PATCH'].includes(config.method?.toUpperCase() || '') &&
          config.data &&
          typeof config.data === 'object' &&
          !(config.data instanceof FormData)
        ) {
          // Merge user_id into existing data without overwriting
          config.data = { ...config.data, user_id: user.id };
        }
      }
    } catch (error) {
      // Silently fail if storage is not available
      console.error('Error in request interceptor:', error);
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
  async (error) => {
    if (error.response?.status === 401) {
      // Clear user data on unauthorized
      await storage.removeItem('user');
      await storage.removeItem('student');
      // Navigation to login will be handled by the app
    }
    return Promise.reject(error);
  }
);

// Type definitions
interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_admin: boolean;
  is_verified: boolean;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

interface OTPData {
  user_id: string;
  code: string;
  otp_type: 'email' | 'phone';
}

interface StudentData {
  user_id: string;
  year_of_study: string;
  department_id: string;
}

interface VoteData {
  election_id: string;
  student_id?: string;
  user_id?: string;
  votes: Record<string, string | null> | Array<{ position_id: string; candidate_id: string | null }>;
}

// Auth API functions
export const authAPI = {
  // Register a new user
  register: async (userData: RegisterData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Login user
  login: async (credentials: LoginCredentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Verify OTP
  verifyOTP: async (otpData: OTPData) => {
    const response = await api.post('/auth/verify-otp', otpData);
    return response.data;
  },

  // Resend OTP
  resendOTP: async (otpData: { user_id: string; otp_type: 'email' | 'phone' }) => {
    const response = await api.post('/auth/resend-otp', otpData);
    return response.data;
  },

  // Send login OTP
  sendLoginOTP: async (identifier: { email?: string; phone?: string }) => {
    const response = await api.post('/auth/send-login-otp', identifier);
    return response.data;
  },

  // OTP login
  otpLogin: async (credentials: { email?: string; phone?: string; code: string }) => {
    const response = await api.post('/auth/otp-login', credentials);
    return response.data;
  },

  // Get user profile
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

// Student API functions
export const studentAPI = {
  // Create student profile
  createProfile: async (studentData: StudentData) => {
    const response = await api.post('/auth/create-student-profile', studentData);
    return response.data;
  },

  // Get student profile
  getProfile: async (userId: string) => {
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
  applyForPosition: async (applicationData: FormData) => {
    const response = await api.post('/candidates/apply', applicationData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get my applications
  getMyApplications: async (studentId: string) => {
    const response = await api.get(`/candidates/my-applications/${studentId}`);
    return response.data;
  },

  // Get candidates by election
  getCandidatesByElection: async (electionId: string) => {
    const response = await api.get(`/candidates/election/${electionId}`);
    return response.data;
  },
};

// Voting API functions
export const votingAPI = {
  // Submit vote
  submitVote: async (voteData: VoteData) => {
    const response = await api.post('/voting/submit', voteData);
    return response.data;
  },

  // Check voting status
  getVotingStatus: async (studentId: string, electionId: string) => {
    const response = await api.get(`/voting/status/${studentId}/${electionId}`);
    return response.data;
  },

  // Get election results
  getElectionResults: async (electionId: string) => {
    const response = await api.get(`/voting/results/${electionId}`);
    return response.data;
  },

  // Get position results
  getPositionResults: async (electionId: string, positionId: string) => {
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
    try {
      const user = await storage.getItem('user');
      if (user && user.id) {
        const response = await api.get('/admin/elections', {
          params: { user_id: user.id },
        });
        return response.data;
      }
    } catch (error) {
      console.error('Error getting user from storage:', error);
    }
    throw new Error('User not authenticated');
  },

  // Create election
  createElection: async (electionData: any) => {
    const response = await api.post('/admin/elections', electionData);
    return response.data;
  },

  // Update election
  updateElection: async (electionId: string, electionData: any) => {
    const response = await api.put(`/admin/elections/${electionId}`, electionData);
    return response.data;
  },

  // Delete election
  deleteElection: async (electionId: string) => {
    const response = await api.delete(`/admin/elections/${electionId}`);
    return response.data;
  },

  // Get positions for election
  getElectionPositions: async (electionId: string) => {
    try {
      const user = await storage.getItem('user');
      if (user && user.id) {
        const response = await api.get(`/admin/elections/${electionId}/positions`, {
          params: { user_id: user.id },
        });
        return response.data;
      }
    } catch (error) {
      console.error('Error getting user from storage:', error);
    }
    throw new Error('User not authenticated');
  },

  // Create position
  createPosition: async (electionId: string, positionData: { name: string }) => {
    const response = await api.post(`/admin/elections/${electionId}/positions`, positionData);
    return response.data;
  },

  // Update position
  updatePosition: async (positionId: string, positionData: { name: string }) => {
    const response = await api.put(`/admin/positions/${positionId}`, positionData);
    return response.data;
  },

  // Delete position
  deletePosition: async (positionId: string) => {
    const response = await api.delete(`/admin/positions/${positionId}`);
    return response.data;
  },

  // Get statistics
  getStatistics: async () => {
    try {
      const user = await storage.getItem('user');
      if (user && user.id) {
        const response = await api.get('/admin/statistics', {
          params: { user_id: user.id },
        });
        return response.data;
      }
    } catch (error) {
      console.error('Error getting user from storage:', error);
    }
    throw new Error('User not authenticated');
  },

  // Get pending applications
  getPendingApplications: async () => {
    const response = await api.get('/candidates/admin/pending');
    return response.data;
  },

  // Approve candidate
  approveCandidate: async (candidateId: string) => {
    const response = await api.post(`/candidates/admin/${candidateId}/approve`);
    return response.data;
  },

  // Reject candidate
  rejectCandidate: async (candidateId: string, reason: string) => {
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

