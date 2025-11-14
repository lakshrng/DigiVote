# DigiVote - Digital Voting Platform

##GitHub link:
https://github.com/lakshrng/DigiVote

A comprehensive full-stack digital voting application built with Flask (Python) backend and React frontend, designed for secure, transparent, and efficient election management.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Configuration](#configuration)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Frontend Features](#frontend-features)
- [Security Features](#security-features)
- [Project Structure](#project-structure)
- [Development](#development)
- [Deployment](#deployment)

## 🎯 Overview

DigiVote is a modern digital voting platform that enables educational institutions to conduct secure, transparent, and efficient elections. The system supports:

- **Student Registration & Authentication** with OTP verification
- **Candidate Application & Management** with admin approval workflow
- **Secure Voting System** with ballot tracking
- **Real-time Results** with detailed analytics
- **Admin Dashboard** for comprehensive election management

## ✨ Features

### 🔐 Authentication & User Management

- **Student Registration**: Email-based registration with domain validation (@student.nitw.ac.in)
- **OTP Verification**: Email and SMS OTP verification for account activation
- **Dual Login Methods**: 
  - Traditional password-based login
  - Passwordless OTP-based login
- **Phone Number Support**: Optional phone number registration with Indian format validation
- **Account Verification**: Mandatory verification before voting or applying as candidate
- **Student Profile Management**: Year of study and department association

### 👥 Candidate Management

- **Candidate Applications**: Students can apply for positions in upcoming elections
- **Application Requirements**:
  - Platform statement
  - Candidate photo upload (PNG, JPG, JPEG, GIF, WEBP)
  - Position and election selection
- **Admin Approval Workflow**: All applications require admin approval before appearing on ballots
- **Application Management**:
  - View all applications
  - Update pending applications
  - Withdraw applications (before approval)
- **Duplicate Prevention**: One application per student per election

### 🗳️ Voting System

- **Election Status Management**: 
  - UPCOMING: Elections accepting candidate applications
  - ACTIVE: Elections open for voting
  - COMPLETED: Elections with finalized results
  - ARCHIVED: Historical elections
- **Multi-Position Voting**: Vote for multiple positions in a single election
- **Partial Ballot Support**: Optional voting for all positions (configurable)
- **Vote Validation**: 
  - Ensures candidates belong to correct position
  - Validates election status
  - Prevents duplicate voting
- **Voting Status Tracking**: Check if a student has already voted
- **IP Address Logging**: Tracks IP addresses for audit purposes

### 📊 Results & Analytics

- **Real-time Results**: View election results grouped by position
- **Detailed Statistics**:
  - Vote counts per candidate
  - Total ballots cast
  - "None of the Above" vote tracking
- **Candidate Information**: Display candidate details with vote counts
- **Position-wise Results**: View results for individual positions
- **Election Overview**: Complete election statistics

### 👨‍💼 Admin Dashboard

- **Election Management**:
  - Create, update, and delete elections
  - Set election dates and status
  - Configure anonymous tally settings
- **Position Management**:
  - Create positions for elections
  - Update position names
  - Delete positions (if no candidates)
- **Candidate Approval**:
  - View pending applications
  - Approve or reject candidate applications
  - View application statistics
- **Comprehensive Statistics**:
  - Election counts by status
  - Candidate application statistics
  - Voting statistics
  - Position counts

### 🎨 Frontend Features

- **Responsive Design**: Modern UI with React and React Router
- **Protected Routes**: Route protection based on authentication status
- **Role-based Access**: Different views for students and admins
- **Component Structure**:
  - HomePage: Landing page
  - Login/Register: Authentication pages
  - OTP Verification: OTP input interface
  - Candidate Apply: Application form with file upload
  - Candidate Voting: Voting interface
  - Check Results: Results viewing
  - Admin Dashboard: Admin management interface
  - Announcements: System announcements

## 🛠️ Tech Stack

### Backend

- **Framework**: Flask 3.0.3
- **Database**: PostgreSQL with SQLAlchemy 2.0 ORM
- **Database Driver**: psycopg 3.2.1 (binary)
- **Migrations**: Alembic 1.14.0
- **Authentication**: Custom OTP-based system
- **File Upload**: Werkzeug secure file handling
- **CORS**: Flask-CORS for cross-origin requests
- **Environment**: python-dotenv for configuration

### Frontend

- **Framework**: React 18.3.1
- **Build Tool**: Vite 5.4.9
- **Routing**: React Router DOM 6.8.1
- **HTTP Client**: Axios 1.6.0
- **Icons**: React Icons 5.5.0

## 🏗️ Architecture

### Backend Architecture

```
backend/
├── server.py              # Flask application factory
├── database.py            # SQLAlchemy models and session management
├── utils.py               # Utility functions (OTP, email, validation)
├── routes/
│   ├── auth_routes.py     # Authentication endpoints
│   ├── candidate_routes.py # Candidate management endpoints
│   ├── voting_routes.py   # Voting endpoints
│   ├── result_routes.py   # Results endpoints
│   └── admin_routes.py    # Admin management endpoints
├── uploads/               # File uploads directory
└── migrations/            # Alembic database migrations
```

### Frontend Architecture

```
frontend/
├── src/
│   ├── components/
│   │   ├── auth/          # Authentication components
│   │   ├── Dashboard.jsx  # Main dashboard
│   │   ├── Sidebar.jsx   # Navigation sidebar
│   │   └── TopBar.jsx    # Top navigation bar
│   ├── contexts/
│   │   └── AuthContext.jsx # Authentication context
│   ├── services/
│   │   └── api.js         # API service layer
│   ├── App.jsx           # Main app component
│   └── main.jsx          # Entry point
└── vite.config.js        # Vite configuration
```

## 📋 Prerequisites

- **Python**: 3.11 or higher
- **Node.js**: 18 or higher
- **PostgreSQL**: 12 or higher (local or managed instance)
- **Git**: For version control

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd DigiVote
```

### 2. Backend Setup

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Windows CMD:
venv\Scripts\activate.bat
# Linux/Mac:
source venv/bin/activate

# Install dependencies
cd backend
pip install -r requirements.txt
```

### 3. Frontend Setup

```bash
# From repository root
cd frontend
npm install
```

### 4. Database Setup

#### Option A: Docker (Recommended)

```bash
# Create PostgreSQL container
docker run --name digivote-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=digivote \
  -p 5432:5432 \
  -d postgres:16
```

#### Option B: Local PostgreSQL

Create a database named `digivote` in your PostgreSQL instance.

### 5. Environment Configuration

Create `backend/.env` file:

```env
# Flask Configuration
FLASK_ENV=development
PORT=5000
ALLOWED_ORIGINS=http://localhost:5173

# Database Configuration
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/digivote

# Email Configuration (Optional - for OTP sending)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=your-email@gmail.com

# Database Connection Pool (Optional)
DB_POOL_SIZE=5
DB_MAX_OVERFLOW=10
DB_POOL_TIMEOUT=30
SQLALCHEMY_ECHO=false
```

**Note**: See `backend/EMAIL_CONFIG.md` for detailed email configuration instructions.

### 6. Initialize Database

```bash
# From backend directory
python server.py
# This will automatically create all tables on first run
```

### 7. Run the Application

#### Backend (Terminal 1)

```bash
cd backend
python server.py
```

Backend runs on `http://localhost:5000`

#### Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

Frontend runs on `http://localhost:5173`

## ⚙️ Configuration

### Database Configuration

The application uses SQLAlchemy 2.0 with PostgreSQL. Database connection is configured via `DATABASE_URL` in `.env`:

```
postgresql+psycopg://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME
```

### CORS Configuration

Configure allowed origins in `backend/.env`:

```env
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### File Upload Configuration

- **Max File Size**: 16MB (configurable in `server.py`)
- **Allowed Extensions**: PNG, JPG, JPEG, GIF, WEBP
- **Upload Directory**: `backend/uploads/candidates/`

## 🗄️ Database Schema

### Core Tables

#### Users
- Stores all registered users (students and admins)
- Fields: `id`, `email`, `phone`, `password_hash`, `first_name`, `last_name`, `is_admin`, `is_verified`
- Unique constraints on `email` and `phone`

#### Students
- Student-specific information
- Fields: `id`, `user_id`, `year_of_study`, `department_id`
- Linked to `users` and `departments`

#### Colleges & Departments
- Hierarchical organization structure
- `colleges`: College/campus information
- `departments`: Department information within colleges

#### Elections
- Election definitions
- Fields: `id`, `title`, `election_year`, `description`, `start_time`, `end_time`, `status`, `is_anonymous_tally`
- Status values: `UPCOMING`, `ACTIVE`, `COMPLETED`, `ARCHIVED`

#### Positions
- Positions within elections
- Fields: `id`, `election_id`, `name`
- One-to-many relationship with elections

#### Candidates
- Candidate applications
- Fields: `id`, `student_id`, `position_id`, `election_id`, `platform_statement`, `photo_url`, `is_approved`
- Unique constraint: one application per student per election

#### Ballots
- Voting records
- Fields: `id`, `election_id`, `student_id`, `submitted_at`, `ip_address`
- Unique constraint: one ballot per student per election

#### Vote Selections
- Individual vote choices
- Fields: `id`, `ballot_id`, `position_id`, `candidate_id`
- `candidate_id` can be NULL for "None of the Above" votes

#### OTPs
- OTP codes for verification
- Fields: `id`, `user_id`, `code`, `otp_type`, `expires_at`, `is_used`
- Types: `email`, `phone`

## 📡 API Documentation

### Authentication Endpoints (`/api/auth`)

#### Register
- **POST** `/api/auth/register`
- **Body**: `{ first_name, last_name, email, phone, password, year_of_study, department_id }`
- **Response**: `{ message, user_id, email_otp_sent, sms_otp_sent }`

#### Login
- **POST** `/api/auth/login`
- **Body**: `{ email/phone, password }`
- **Response**: `{ message, user }`

#### Verify OTP
- **POST** `/api/auth/verify-otp`
- **Body**: `{ user_id, otp_code, otp_type }`
- **Response**: `{ message, user }`

#### Resend OTP
- **POST** `/api/auth/resend-otp`
- **Body**: `{ user_id, otp_type }`

#### OTP Login
- **POST** `/api/auth/otp-login`
- **Body**: `{ email/phone, otp_code }`

#### Send Login OTP
- **POST** `/api/auth/send-login-otp`
- **Body**: `{ email/phone }`

#### Get Departments
- **GET** `/api/auth/departments`
- **Response**: `{ departments[], total }`

### Candidate Endpoints (`/api/candidates`)

#### Apply for Position
- **POST** `/api/candidates/apply`
- **Body** (multipart/form-data): `student_id, position_id, election_id, platform_statement, photo (file)`
- **Response**: `{ message, candidate_id, status }`

#### Get My Applications
- **GET** `/api/candidates/my-applications/<student_id>`
- **Response**: `{ applications[], total }`

#### Get Elections for Application
- **GET** `/api/candidates/apply/elections`
- **Response**: `{ elections[], total }`

#### Get Elections for Voting
- **GET** `/api/candidates/voting/elections`
- **Response**: `{ elections[], total }`

#### Get Candidates for Voting
- **GET** `/api/candidates/voting/elections/<election_id>/candidates`
- **Response**: `{ election, candidates_by_position, total_candidates }`

#### Update Application
- **PUT** `/api/candidates/<candidate_id>`
- **Body**: `{ platform_statement, photo_url }` or multipart form data

#### Withdraw Application
- **DELETE** `/api/candidates/<candidate_id>`

#### Admin: Get Pending Applications
- **GET** `/api/candidates/admin/pending`
- **Response**: `{ pending_applications[], total }`

#### Admin: Approve Candidate
- **POST** `/api/candidates/admin/<candidate_id>/approve`

#### Admin: Reject Candidate
- **POST** `/api/candidates/admin/<candidate_id>/reject`
- **Body**: `{ reason }`

### Voting Endpoints (`/api/voting`)

#### Submit Vote
- **POST** `/api/voting/submit`
- **Body**: `{ election_id, student_id/user_id, votes: { position_id: candidate_id }, require_full }`
- **Response**: `{ message, ballot_id, election_id, submitted_at, votes_count }`

#### Get Voting Status
- **GET** `/api/voting/status/<student_id>/<election_id>`
- **Response**: `{ has_voted, ballot_id?, submitted_at?, votes_count? }`

#### Get Active Elections
- **GET** `/api/voting/elections/active`
- **Response**: `{ elections[], total }`

#### Get Upcoming Elections
- **GET** `/api/voting/elections/upcoming`
- **Response**: `{ elections[], total }`

### Results Endpoints (`/api/voting/results`)

#### Get All Elections for Results
- **GET** `/api/voting/results/elections`
- **Response**: `{ elections[], total }`

#### Get Election Results
- **GET** `/api/voting/results/<election_id>`
- **Response**: `{ election, total_ballots_cast, results[] }`

#### Get Position Results
- **GET** `/api/voting/results/<election_id>/position/<position_id>`
- **Response**: `{ election, position, candidates[], none_of_the_above_votes, total_votes }`

### Admin Endpoints (`/api/admin`)

**Note**: All admin endpoints require admin authentication via `user_id` in request body or headers.

#### Get All Elections
- **GET** `/api/admin/elections`
- **Body/Headers**: `{ user_id }` or `X-User-Id` header

#### Create Election
- **POST** `/api/admin/elections`
- **Body**: `{ title, election_year, description, start_time, end_time, status, is_anonymous_tally }`

#### Update Election
- **PUT** `/api/admin/elections/<election_id>`
- **Body**: `{ title?, election_year?, description?, start_time?, end_time?, status?, is_anonymous_tally? }`

#### Delete Election
- **DELETE** `/api/admin/elections/<election_id>`

#### Get Election Positions
- **GET** `/api/admin/elections/<election_id>/positions`

#### Create Position
- **POST** `/api/admin/elections/<election_id>/positions`
- **Body**: `{ name }`

#### Update Position
- **PUT** `/api/admin/positions/<position_id>`
- **Body**: `{ name }`

#### Delete Position
- **DELETE** `/api/admin/positions/<position_id>`

#### Get Statistics
- **GET** `/api/admin/statistics`
- **Response**: `{ elections, candidates, positions, voting }`

## 🎨 Frontend Features

### Component Overview

- **HomePage**: Landing page with navigation
- **Login/Register**: Authentication forms
- **OTPVerification**: OTP input and verification
- **CandidateApply**: Candidate application form with file upload
- **CandidateVoting**: Voting interface with candidate selection
- **CheckResults**: Results viewing interface
- **AdminDashboard**: Admin management interface
- **ProtectedRoute**: Route protection wrapper
- **Dashboard**: Main user dashboard
- **Sidebar/TopBar**: Navigation components

### State Management

- **AuthContext**: Global authentication state
- **Local State**: Component-level state management with React hooks

### API Integration

- **Axios**: HTTP client for API requests
- **Service Layer**: Centralized API service in `services/api.js`

## 🔒 Security Features

### Authentication & Authorization

- **Password Hashing**: Werkzeug password hashing
- **OTP Verification**: Time-limited OTP codes (10 minutes)
- **Account Verification**: Mandatory verification before critical actions
- **Admin Protection**: Admin-only endpoints with authentication checks

### Data Validation

- **Email Domain Validation**: Restricts to @student.nitw.ac.in
- **Phone Number Validation**: Indian phone number format validation
- **File Upload Security**: 
  - File type validation
  - Secure filename handling
  - Size limits
- **Input Sanitization**: Server-side validation for all inputs

### Voting Security

- **One Vote Per Election**: Database-level unique constraint
- **Election Status Validation**: Only active elections accept votes
- **Candidate Validation**: Ensures candidates belong to correct positions
- **IP Address Logging**: Audit trail for votes

### Database Security

- **SQL Injection Prevention**: SQLAlchemy ORM parameterized queries
- **Cascade Deletes**: Proper foreign key relationships
- **Unique Constraints**: Prevents duplicate records

## 📁 Project Structure

```
DigiVote/
├── backend/
│   ├── routes/              # API route blueprints
│   │   ├── auth_routes.py
│   │   ├── candidate_routes.py
│   │   ├── voting_routes.py
│   │   ├── result_routes.py
│   │   └── admin_routes.py
│   ├── migrations/          # Alembic migrations
│   ├── uploads/             # File uploads
│   ├── database.py          # Database models
│   ├── server.py            # Flask app factory
│   ├── utils.py             # Utility functions
│   ├── requirements.txt     # Python dependencies
│   └── .env                 # Environment variables (not in git)
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts
│   │   ├── services/        # API services
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── venv/                    # Python virtual environment
└── README.md
```

## 💻 Development

### Running in Development Mode

```bash
# Backend (with auto-reload)
cd backend
python server.py

# Frontend (with hot-reload)
cd frontend
npm run dev
```

### Database Migrations

```bash
# Create migration
cd backend
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

### Testing Database Connection

```bash
cd backend
python check_database.py
python verify_tables.py
```

### Code Style

- **Python**: Follow PEP 8 guidelines
- **JavaScript**: Follow ESLint configuration
- **Type Hints**: Use type hints in Python functions


### Production Considerations

1. **Environment Variables**: Use secure environment variable management
2. **Database**: Use managed PostgreSQL service
3. **Email Service**: Configure production SMTP service
4. **File Storage**: Consider cloud storage for uploads
5. **HTTPS**: Enable SSL/TLS certificates
6. **CORS**: Restrict allowed origins to production domains
7. **Logging**: Implement proper logging and monitoring
8. **Backup**: Regular database backups

### Deployment Options

- **Backend**: Gunicorn or uWSGI with Nginx reverse proxy
- **Frontend**: Build static files and serve via Nginx or CDN
- **Database**: Managed PostgreSQL (AWS RDS, Heroku Postgres, etc.)

## 📝 Notes

- The application automatically creates database tables on first run
- OTP codes are logged to console if SMTP is not configured
- File uploads are stored locally in `backend/uploads/candidates/`
- Admin users must be created directly in the database (set `is_admin = true`)
- Email domain validation is hardcoded to @student.nitw.ac.in (modify in `utils.py`)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request


