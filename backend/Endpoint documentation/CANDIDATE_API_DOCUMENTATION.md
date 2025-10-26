# DigiVote Candidate API Documentation

## Overview

The Candidate API provides comprehensive functionality for managing candidate applications in elections. This includes applying for positions, managing applications, and administrative approval workflows.

## API Endpoints

### 1. Apply for Position

**Endpoint:** `POST /api/candidates/apply`

**Description:** Submit an application for a specific position in an election.

**Request Body:**
```json
{
  "student_id": "student-uuid-here",
  "position_id": "position-uuid-here", 
  "election_id": "election-uuid-here",
  "platform_statement": "My vision for the student body...",
  "photo_url": "https://example.com/photo.jpg"
}
```

**Response (Success - 201):**
```json
{
  "message": "Application submitted successfully. Awaiting admin approval.",
  "candidate_id": "candidate-uuid-here",
  "status": "pending_approval"
}
```

**Response (Error - 400/404/409):**
```json
{
  "error": "You have already applied for a position in this election"
}
```

### 2. Get My Applications

**Endpoint:** `GET /api/candidates/my-applications/{student_id}`

**Description:** Retrieve all applications submitted by a specific student.

**Response (Success - 200):**
```json
{
  "applications": [
    {
      "id": "candidate-uuid-here",
      "election": {
        "id": "election-uuid-here",
        "title": "Student Council Elections 2024",
        "election_year": "2024",
        "status": "UPCOMING"
      },
      "position": {
        "id": "position-uuid-here",
        "name": "President"
      },
      "platform_statement": "My vision for the student body...",
      "photo_url": "https://example.com/photo.jpg",
      "is_approved": false,
      "applied_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1
}
```

### 3. Get Candidates by Election

**Endpoint:** `GET /api/candidates/election/{election_id}`

**Description:** Retrieve all candidates for a specific election.

**Response (Success - 200):**
```json
{
  "election": {
    "id": "election-uuid-here",
    "title": "Student Council Elections 2024",
    "election_year": "2024",
    "status": "UPCOMING"
  },
  "candidates": [
    {
      "id": "candidate-uuid-here",
      "student": {
        "id": "student-uuid-here",
        "user": {
          "first_name": "John",
          "last_name": "Doe",
          "email": "john.doe@student.nitw.ac.in"
        },
        "year_of_study": "3rd Year",
        "department": {
          "id": "dept-uuid-here",
          "name": "Computer Science"
        }
      },
      "position": {
        "id": "position-uuid-here",
        "name": "President"
      },
      "platform_statement": "My vision for the student body...",
      "photo_url": "https://example.com/photo.jpg",
      "is_approved": true
    }
  ],
  "total": 1
}
```

### 4. Get Candidates by Position

**Endpoint:** `GET /api/candidates/position/{position_id}`

**Description:** Retrieve all candidates for a specific position.

**Response (Success - 200):**
```json
{
  "position": {
    "id": "position-uuid-here",
    "name": "President",
    "election": {
      "id": "election-uuid-here",
      "title": "Student Council Elections 2024",
      "election_year": "2024",
      "status": "UPCOMING"
    }
  },
  "candidates": [
    {
      "id": "candidate-uuid-here",
      "student": {
        "id": "student-uuid-here",
        "user": {
          "first_name": "John",
          "last_name": "Doe",
          "email": "john.doe@student.nitw.ac.in"
        },
        "year_of_study": "3rd Year",
        "department": {
          "id": "dept-uuid-here",
          "name": "Computer Science"
        }
      },
      "platform_statement": "My vision for the student body...",
      "photo_url": "https://example.com/photo.jpg",
      "is_approved": true
    }
  ],
  "total": 1
}
```

### 5. Get Candidate Details

**Endpoint:** `GET /api/candidates/{candidate_id}`

**Description:** Retrieve detailed information about a specific candidate.

**Response (Success - 200):**
```json
{
  "id": "candidate-uuid-here",
  "student": {
    "id": "student-uuid-here",
    "user": {
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@student.nitw.ac.in"
    },
    "year_of_study": "3rd Year",
    "department": {
      "id": "dept-uuid-here",
      "name": "Computer Science"
    }
  },
  "position": {
    "id": "position-uuid-here",
    "name": "President"
  },
  "election": {
    "id": "election-uuid-here",
    "title": "Student Council Elections 2024",
    "election_year": "2024",
    "status": "UPCOMING"
  },
  "platform_statement": "My vision for the student body...",
  "photo_url": "https://example.com/photo.jpg",
  "is_approved": true
}
```

### 6. Update Application

**Endpoint:** `PUT /api/candidates/{candidate_id}`

**Description:** Update a candidate application (only if not approved yet).

**Request Body:**
```json
{
  "platform_statement": "Updated vision statement...",
  "photo_url": "https://example.com/new-photo.jpg"
}
```

**Response (Success - 200):**
```json
{
  "message": "Application updated successfully",
  "candidate_id": "candidate-uuid-here"
}
```

### 7. Withdraw Application

**Endpoint:** `DELETE /api/candidates/{candidate_id}`

**Description:** Withdraw a candidate application (only if not approved yet).

**Response (Success - 200):**
```json
{
  "message": "Application withdrawn successfully"
}
```

## Admin-Only Endpoints

### 8. Get Pending Applications

**Endpoint:** `GET /api/candidates/admin/pending`

**Description:** Retrieve all pending candidate applications (admin only).

**Response (Success - 200):**
```json
{
  "pending_applications": [
    {
      "id": "candidate-uuid-here",
      "student": {
        "id": "student-uuid-here",
        "user": {
          "first_name": "John",
          "last_name": "Doe",
          "email": "john.doe@student.nitw.ac.in"
        },
        "year_of_study": "3rd Year",
        "department": {
          "id": "dept-uuid-here",
          "name": "Computer Science"
        }
      },
      "position": {
        "id": "position-uuid-here",
        "name": "President"
      },
      "election": {
        "id": "election-uuid-here",
        "title": "Student Council Elections 2024",
        "election_year": "2024",
        "status": "UPCOMING"
      },
      "platform_statement": "My vision for the student body...",
      "photo_url": "https://example.com/photo.jpg",
      "applied_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1
}
```

### 9. Approve Candidate

**Endpoint:** `POST /api/candidates/admin/{candidate_id}/approve`

**Description:** Approve a candidate application (admin only).

**Response (Success - 200):**
```json
{
  "message": "Candidate application approved successfully",
  "candidate_id": "candidate-uuid-here"
}
```

### 10. Reject Candidate

**Endpoint:** `POST /api/candidates/admin/{candidate_id}/reject`

**Description:** Reject a candidate application (admin only).

**Request Body:**
```json
{
  "reason": "Incomplete application or policy violation"
}
```

**Response (Success - 200):**
```json
{
  "message": "Candidate application rejected successfully",
  "reason": "Incomplete application or policy violation"
}
```

### 11. Get Statistics

**Endpoint:** `GET /api/candidates/admin/statistics`

**Description:** Get candidate application statistics (admin only).

**Response (Success - 200):**
```json
{
  "overview": {
    "total_applications": 25,
    "approved_applications": 20,
    "pending_applications": 5
  },
  "by_election": [
    {
      "election_id": "election-uuid-here",
      "title": "Student Council Elections 2024",
      "election_year": "2024",
      "status": "UPCOMING",
      "total_applications": 15,
      "approved_applications": 12,
      "pending_applications": 3
    }
  ]
}
```

## Business Rules

### Application Rules
- Students can only apply for one position per election
- Applications are only accepted for elections with "UPCOMING" status
- Students must have verified accounts to apply
- Applications require admin approval before becoming official candidates

### Modification Rules
- Applications can only be modified if not yet approved
- Approved applications cannot be withdrawn or modified
- Only platform statement and photo URL can be updated

### Admin Rules
- Only admins can approve/reject applications
- Rejected applications are deleted from the system
- Approved applications become official candidates

## Error Handling

Common error responses:

- **400 Bad Request**: Missing required fields, invalid data
- **403 Forbidden**: Unverified account, insufficient permissions
- **404 Not Found**: Student, election, position, or candidate not found
- **409 Conflict**: Duplicate application, already applied

## Security Considerations

- All endpoints require proper authentication
- Admin endpoints require admin privileges
- Student data is only accessible to authorized users
- Platform statements are sanitized to prevent XSS

## Frontend Integration

The frontend should implement:

1. **Application Form**: Multi-step form for position applications
2. **Application Management**: View, edit, and withdraw applications
3. **Candidate Directory**: Browse approved candidates by election/position
4. **Admin Dashboard**: Manage pending applications and approvals
5. **Statistics Dashboard**: View application metrics and trends
