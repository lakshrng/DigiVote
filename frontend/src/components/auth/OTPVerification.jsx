import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/api';

const OTPVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  const { verifyOTP } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get email and phone from location state or localStorage
    const stateEmail = location.state?.email || localStorage.getItem('pendingEmail');
    const statePhone = location.state?.phone || localStorage.getItem('pendingPhone');
    
    if (stateEmail) setEmail(stateEmail);
    if (statePhone) setPhone(statePhone);
    
    // Start countdown for resend button
    setCountdown(60);
  }, [location.state]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i];
    }
    
    setOtp(newOtp);
    
    // Focus the next empty input or the last one
    const nextEmptyIndex = newOtp.findIndex(digit => digit === '');
    const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : 5;
    const nextInput = document.getElementById(`otp-${focusIndex}`);
    if (nextInput) nextInput.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      setLoading(false);
      return;
    }

    try {
      // Get user_id from localStorage (stored during registration)
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User ID not found. Please register again.');
      }

      // Determine OTP type based on what we have
      const otpType = email ? 'email' : 'phone';
      
      const result = await verifyOTP({
        user_id: userId,
        otp_code: otpCode,
        otp_type: otpType
      });
      
      if (result.success) {
        // Clear pending verification data
        localStorage.removeItem('pendingEmail');
        localStorage.removeItem('pendingPhone');
        localStorage.removeItem('userId');
        
        // Navigate to create profile since student profile is created during registration
        navigate('/create-profile');
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    
    setResendLoading(true);
    setError('');

    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User ID not found. Please register again.');
      }

      const otpType = email ? 'email' : 'phone';
      const result = await authAPI.resendOTP({
        user_id: userId,
        otp_type: otpType
      });
      
      if (result.message) {
        setCountdown(60);
        setError('');
      } else {
        setError(result.error || 'Failed to resend OTP');
      }
    } catch (error) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const getVerificationType = () => {
    if (email) return 'email';
    if (phone) return 'phone';
    return 'account';
  };

  const getMaskedContact = () => {
    if (email) {
      const [localPart, domain] = email.split('@');
      const maskedLocal = localPart.slice(0, 2) + '*'.repeat(localPart.length - 2);
      return `${maskedLocal}@${domain}`;
    }
    if (phone) {
      return phone.slice(0, 3) + '*'.repeat(phone.length - 6) + phone.slice(-3);
    }
    return 'your account';
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Verify Your {getVerificationType().charAt(0).toUpperCase() + getVerificationType().slice(1)}</h1>
          <p>
            We've sent a 6-digit verification code to{' '}
            <strong>{getMaskedContact()}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="otp-container">
            <label htmlFor="otp-0">Enter verification code</label>
            <div className="otp-inputs">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="otp-input"
                  disabled={loading}
                  autoComplete="off"
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="auth-button primary"
            disabled={loading || otp.join('').length !== 6}
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>
        </form>

        <div className="otp-footer">
          <p>Didn't receive the code?</p>
          <button
            type="button"
            className="resend-button"
            onClick={handleResend}
            disabled={countdown > 0 || resendLoading}
          >
            {resendLoading 
              ? 'Sending...' 
              : countdown > 0 
                ? `Resend in ${countdown}s` 
                : 'Resend Code'
            }
          </button>
        </div>

        <div className="auth-footer">
          <p>
            Wrong {getVerificationType()}?{' '}
            <button 
              type="button" 
              className="auth-link"
              onClick={() => navigate('/register')}
            >
              Go back to registration
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
