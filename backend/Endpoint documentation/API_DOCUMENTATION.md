# DigiVote API Documentation - Email OTP

## Overview

The DigiVote application now includes comprehensive email OTP (One-Time Password) functionality for user registration and verification. This document outlines the API endpoints and usage.

## Email OTP Flow

1. **User Registration** → Email OTP is automatically sent
2. **User Verification** → User enters OTP to verify email
3. **Account Activation** → User can now login

## API Endpoints

### 1. User Registration with Email OTP

**Endpoint:** `POST /api/auth/register`

**Description:** Registers a new user and automatically sends email OTP for verification.

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe", 
  "email": "john.doe@student.nitw.ac.in",
  "phone": "+919876543210",
  "password": "securepassword123",
  "year_of_study": "3rd Year",
  "department_id": "dept-uuid-here"
}
```

**Response (Success - 201):**
```json
{
  "message": "Registration successful. Please verify your email and phone (if provided) using the OTP sent.",
  "user_id": "user-uuid-here",
  "email_otp_sent": true,
  "sms_otp_sent": true
}
```

**Response (Error - 400/409):**
```json
{
  "error": "Email must be from @student.nitw.ac.in domain"
}
```

### 2. Verify Email OTP

**Endpoint:** `POST /api/auth/verify-otp`

**Description:** Verifies the OTP code sent to user's email.

**Request Body:**
```json
{
  "user_id": "user-uuid-here",
  "otp_code": "123456",
  "otp_type": "email"
}
```

**Response (Success - 200):**
```json
{
  "message": "Email verification successful",
  "user": {
    "id": "user-uuid-here",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@student.nitw.ac.in",
    "phone": "+919876543210",
    "is_admin": false,
    "is_verified": true
  }
}
```

**Response (Error - 400):**
```json
{
  "error": "Invalid or expired OTP"
}
```

### 3. Resend Email OTP

**Endpoint:** `POST /api/auth/resend-otp`

**Description:** Resends OTP to user's email.

**Request Body:**
```json
{
  "user_id": "user-uuid-here",
  "otp_type": "email"
}
```

**Response (Success - 200):**
```json
{
  "message": "Email OTP sent successfully"
}
```

### 4. User Login (After Verification)

**Endpoint:** `POST /api/auth/login`

**Description:** Logs in a verified user.

**Request Body:**
```json
{
  "email": "john.doe@student.nitw.ac.in",
  "password": "securepassword123"
}
```

**Response (Success - 200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "user-uuid-here",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@student.nitw.ac.in",
    "phone": "+919876543210",
    "is_admin": false,
    "is_verified": true
  }
}
```

**Response (Error - 403):**
```json
{
  "error": "Account not verified. Please verify your email/phone first."
}
```

## Email Configuration

### Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Email Configuration
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=your-email@gmail.com
```

### Gmail Setup

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this app password in `SMTP_PASSWORD`

## Email Template

The system sends a professional HTML email with:
- DigiVote branding
- Clear OTP display
- 10-minute expiration notice
- Security information

## Security Features

- **OTP Expiration**: OTPs expire after 10 minutes
- **Single Use**: Each OTP can only be used once
- **Domain Validation**: Only @student.nitw.ac.in emails allowed
- **Rate Limiting**: Prevents OTP spam
- **Secure Storage**: OTPs are hashed and stored securely

## Error Handling

The system gracefully handles:
- Missing SMTP configuration (falls back to console logging)
- Invalid email addresses
- Expired OTPs
- Network failures
- Invalid user credentials

## Testing

Run the test script to verify email functionality:

```bash
cd backend
python test_email_otp.py
```

## Frontend Integration

The frontend should:
1. Show registration form
2. Display success message after registration
3. Show OTP input form
4. Handle verification success/failure
5. Redirect to login after successful verification
