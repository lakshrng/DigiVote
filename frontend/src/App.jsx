import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import OTPVerification from './components/auth/OTPVerification';
import HomePage from './components/auth/HomePage';
import CandidateVoting from "./components/auth/CandidateVoting";
import CandidateApply from "./components/auth/CandidateApply";
import CheckResults from "./components/auth/CheckResults";
import Announcements from "./components/auth/Announcements";
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<OTPVerification />} />
            
            {/* Protected Routes with Layout */}
            <Route path="/home" element={<HomePage />} />
            <Route path="/voting" element={<CandidateVoting />} />
            <Route path="/apply" element={<CandidateApply />} />
            <Route path="/results" element={<CheckResults />} />
            <Route path="/announcements" element={<Announcements />} />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
