# Voting & Results API Documentation

## Voting Routes

### 1. Get Active Elections
**Endpoint:** `GET /api/elections/active`

**Description:** Retrieves all elections that are currently open for voting.

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Student Council Election 2025",
    "description": "Annual student council election",
    "election_year": "2025",
    "start_time": "2025-10-27T10:00:00",
    "end_time": "2025-11-03T10:00:00",
    "is_anonymous_tally": true
  }
]
```

**Status Codes:**
- `200 OK` - Success
- `500 Internal Server Error` - Server error

---

### 2. Get Election Ballot
**Endpoint:** `GET /api/elections/<election_id>/ballot`

**Description:** Retrieves complete ballot information including all positions and approved candidates for a specific election.

**Parameters:**
- `election_id` (path) - UUID of the election

**Response:**
```json
{
  "election": {
    "id": "uuid",
    "title": "Student Council Election 2025",
    "description": "Annual student council election",
    "end_time": "2025-11-03T10:00:00"
  },
  "positions": [
    {
      "id": "uuid",
      "name": "President",
      "candidates": [
        {
          "id": "uuid",
          "name": "John Doe",
          "platform_statement": "Vote for me! I promise...",
          "photo_url": "https://example.com/photo.jpg",
          "year_of_study": "Year 3"
        }
      ]
    }
  ]
}
```

**Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Invalid election ID or election not active
- `404 Not Found` - Election not found
- `500 Internal Server Error` - Server error

---

### 3. Check Voted Status
**Endpoint:** `GET /api/elections/<election_id>/voted/<student_id>`

**Description:** Checks if a student has already voted in a specific election.

**Parameters:**
- `election_id` (path) - UUID of the election
- `student_id` (path) - UUID of the student

**Response:**
```json
{
  "has_voted": false,
  "voted_at": null
}
```

**Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Invalid ID format
- `500 Internal Server Error` - Server error

---

### 4. Submit Vote
**Endpoint:** `POST /api/vote`

**Description:** Submits a student's vote for an election. Creates a ballot and records vote selections.

**Request Body:**
```json
{
  "election_id": "uuid",
  "student_id": "uuid",
  "votes": [
    {
      "position_id": "uuid",
      "candidate_id": "uuid"  // null for "None of the Above"
    }
  ]
}
```

**Response:**
```json
{
  "message": "Vote submitted successfully",
  "ballot_id": "uuid",
  "submitted_at": "2025-10-27T12:30:00"
}
```

**Status Codes:**
- `201 Created` - Vote submitted successfully
- `400 Bad Request` - Missing fields, invalid IDs, voting window closed, or already voted
- `404 Not Found` - Election or student not found
- `500 Internal Server Error` - Server error

**Notes:**
- Each student can only vote once per election
- All vote selections are validated against approved candidates
- Supports "None of the Above" option (candidate_id = null)

---

## Results Routes

### 1. Get Election Results
**Endpoint:** `GET /api/elections/<election_id>/results`

**Description:** Retrieves vote counts and results for an election. Only accessible after election ends or by admins.

**Parameters:**
- `election_id` (path) - UUID of the election
- `is_admin` (query, optional) - Set to "true" for admin access

**Response:**
```json
{
  "election": {
    "id": "uuid",
    "title": "Student Council Election 2025",
    "election_year": "2025",
    "status": "COMPLETED",
    "start_time": "2025-10-27T10:00:00",
    "end_time": "2025-11-03T10:00:00",
    "is_anonymous_tally": true
  },
  "total_voters": 150,
  "positions": [
    {
      "id": "uuid",
      "name": "President",
      "total_votes": 145,
      "nota_votes": 5,
      "candidates": [
        {
          "id": "uuid",
          "name": "John Doe",
          "vote_count": 80,
          "photo_url": "https://example.com/photo.jpg",
          "is_winner": true
        },
        {
          "id": "uuid",
          "name": "Jane Smith",
          "vote_count": 60,
          "photo_url": "https://example.com/photo2.jpg",
          "is_winner": false
        }
      ]
    }
  ]
}
```

**Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Invalid election ID format
- `403 Forbidden` - Results not available (election still active and not admin)
- `404 Not Found` - Election not found
- `500 Internal Server Error` - Server error

---

### 2. Get Completed Elections
**Endpoint:** `GET /api/elections/completed`

**Description:** Retrieves a list of all completed and archived elections.

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Student Council Election 2024",
    "election_year": "2024",
    "status": "COMPLETED",
    "end_time": "2024-11-03T10:00:00",
    "total_voters": 200
  }
]
```

**Status Codes:**
- `200 OK` - Success
- `500 Internal Server Error` - Server error

---

### 3. Publish Results (Admin Only)
**Endpoint:** `POST /api/elections/<election_id>/publish`

**Description:** Changes election status to COMPLETED, making results publicly visible.

**Parameters:**
- `election_id` (path) - UUID of the election

**Response:**
```json
{
  "message": "Results published successfully",
  "election_id": "uuid",
  "status": "COMPLETED"
}
```

**Status Codes:**
- `200 OK` - Results published successfully
- `400 Bad Request` - Invalid election ID or election hasn't ended yet
- `404 Not Found` - Election not found
- `500 Internal Server Error` - Server error

---

## Error Response Format

All error responses follow this format:

```json
{
  "error": "Error message description"
}
```

## Common Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `403 Forbidden` - Access denied
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Notes

### Vote Anonymity
- Ballot records only track WHO voted, not WHAT they voted for
- Vote selections are stored separately with only ballot_id reference
- This maintains voter anonymity while preventing duplicate voting

### Election Status Flow
1. `UPCOMING` - Election scheduled but not started
2. `ACTIVE` - Election is open for voting
3. `COMPLETED` - Election ended, results published
4. `ARCHIVED` - Old election data

### Testing Endpoints

Use the provided `test_routes.py` script:
```bash
python test_routes.py
```

Or use curl/Postman with the examples above.