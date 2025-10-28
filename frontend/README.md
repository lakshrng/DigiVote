# DigiVote Frontend

A modern React-based frontend for the DigiVote election management system.

## Features

### 🔐 Authentication System
- **User Registration** - Complete registration with email and phone verification
- **User Login** - Secure login with form validation
- **OTP Verification** - Email and phone OTP verification system
- **Student Profile Creation** - Academic profile setup for election participation
- **Protected Routes** - Route protection based on authentication and verification status

### 🎨 Modern UI/UX
- **Responsive Design** - Works on desktop, tablet, and mobile devices
- **Dark/Light Mode** - Automatic theme switching based on system preferences
- **Form Validation** - Real-time validation with helpful error messages
- **Password Strength Indicator** - Visual password strength feedback
- **Loading States** - Smooth loading indicators throughout the app

### 🛡️ Security Features
- **JWT Token Management** - Automatic token handling and refresh
- **Route Protection** - Protected routes based on user status
- **Input Sanitization** - Client-side input validation
- **Error Handling** - Comprehensive error handling and user feedback

## Tech Stack

- **React 18** - Modern React with hooks
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API communication
- **CSS Variables** - Modern CSS with custom properties
- **Vite** - Fast build tool and development server

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Backend API running on `http://localhost:5000`

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

4. **Preview Production Build**
   ```bash
   npm run preview
   ```

## Project Structure

```
frontend/src/
├── components/
│   ├── auth/
│   │   ├── Login.jsx              # Login component
│   │   ├── Register.jsx           # Registration component
│   │   ├── OTPVerification.jsx    # OTP verification component
│   │   ├── CreateStudentProfile.jsx # Student profile creation
│   │   └── ProtectedRoute.jsx     # Route protection wrapper
│   └── Dashboard.jsx              # Main dashboard component
├── contexts/
│   └── AuthContext.jsx            # Authentication context and state
├── services/
│   └── api.js                     # API service layer
├── App.jsx                        # Main app component with routing
├── main.jsx                       # App entry point
└── index.css                      # Global styles and CSS variables
```

## Authentication Flow

1. **Registration** (`/register`)
   - User fills out registration form
   - Email and phone validation
   - Password strength checking
   - Redirects to OTP verification

2. **Email Verification** (`/verify-email`)
   - 6-digit OTP input with auto-focus
   - Resend functionality with countdown
   - Redirects to profile creation or dashboard

3. **Student Profile Creation** (`/create-profile`)
   - Academic information input
   - Department selection
   - Year of study selection
   - Redirects to dashboard

4. **Dashboard** (`/dashboard`)
   - Protected route requiring verification and student profile
   - User information display
   - Quick action buttons (coming soon)

## API Integration

The frontend integrates with the following backend endpoints:

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email-otp` - Email OTP verification
- `POST /api/auth/verify-phone-otp` - Phone OTP verification
- `POST /api/auth/resend-email-otp` - Resend email OTP
- `POST /api/auth/resend-phone-otp` - Resend phone OTP
- `POST /api/auth/create-student-profile` - Create student profile
- `GET /api/auth/departments` - Get departments list

### Future Integrations
- Election management
- Candidate applications
- Voting system
- Results and statistics

## Styling

The app uses CSS custom properties for theming and supports both light and dark modes:

```css
:root {
  --primary-color: #2563eb;
  --text-primary: #111827;
  --background: #ffffff;
  /* ... more variables */
}
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint (if configured)

### Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Contributing

1. Follow the existing code structure
2. Use functional components with hooks
3. Maintain consistent styling with CSS variables
4. Add proper error handling
5. Include loading states for async operations

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

This project is part of the DigiVote election management system.
