# Voting API Documentation

This document describes the voting-related API endpoints for the DigiVote application.

## Base URL
All voting endpoints are prefixed with `/api/voting`

## Authentication
Most endpoints require proper authentication and authorization. In production, implement proper JWT token validation.

---

## Endpoints

### 1. Submit Vote
**POST** `/api/voting/submit`

Submit votes for an election.

#### Request Body
```json
{
  "student_id": "string (UUID)",
  "election_id": "string (UUID)",
  "votes": [
    {
      "position_id": "string (UUID)",
      "candidate_id": "string (UUID) | null"
    }
  ]
}
```

#### Notes
- `candidate_id` can be `null` for "None of the Above" votes
- Each position in the election must have exactly one vote
- Student must be verified and not have already voted
- Election must be ACTIVE and within voting time

#### Response
```json
{
  "message": "Vote submitted successfully",
  "ballot_id": "string (UUID)",
  "submitted_at": "string (ISO datetime)",
  "votes_cast": "number"
}
```

#### Error Responses
- `400` - Missing required fields or invalid vote data
- `403` - Student account not verified
- `404` - Student or election not found
- `409` - Student has already voted in this election
- `400` - Election not active or outside voting time

---

### 2. Check Voting Status
**GET** `/api/voting/status/{student_id}/{election_id}`

Check if a student has voted in a specific election.

#### Path Parameters
- `student_id` (string, UUID) - Student ID
- `election_id` (string, UUID) - Election ID

#### Response
```json
{
  "student_id": "string (UUID)",
  "election_id": "string (UUID)",
  "has_voted": "boolean",
  "voted_at": "string (ISO datetime) | null",
  "election_status": "string",
  "can_vote": "boolean"
}
```

#### Error Responses
- `404` - Student or election not found

---

### 3. Get Election Results
**GET** `/api/voting/results/{election_id}`

Get complete results for an election (Admin only).

#### Path Parameters
- `election_id` (string, UUID) - Election ID

#### Response
```json
{
  "election": {
    "id": "string (UUID)",
    "title": "string",
    "election_year": "string",
    "status": "string",
    "start_time": "string (ISO datetime)",
    "end_time": "string (ISO datetime)"
  },
  "total_ballots_cast": "number",
  "results": [
    {
      "position_id": "string (UUID)",
      "position_name": "string",
      "candidates": [
        {
          "candidate_id": "string (UUID)",
          "candidate_name": "string",
          "department": "string",
          "year_of_study": "string",
          "platform_statement": "string",
          "photo_url": "string",
          "vote_count": "number"
        }
      ],
      "none_of_the_above_votes": "number",
      "total_votes": "number"
    }
  ]
}
```

#### Error Responses
- `404` - Election not found

---

### 4. Get Position Results
**GET** `/api/voting/results/{election_id}/position/{position_id}`

Get results for a specific position in an election.

#### Path Parameters
- `election_id` (string, UUID) - Election ID
- `position_id` (string, UUID) - Position ID

#### Response
```json
{
  "election": {
    "id": "string (UUID)",
    "title": "string",
    "election_year": "string",
    "status": "string"
  },
  "position": {
    "id": "string (UUID)",
    "name": "string"
  },
  "candidates": [
    {
      "candidate_id": "string (UUID)",
      "candidate_name": "string",
      "department": "string",
      "year_of_study": "string",
      "platform_statement": "string",
      "photo_url": "string",
      "vote_count": "number"
    }
  ],
  "none_of_the_above_votes": "number",
  "total_votes": "number"
}
```

#### Error Responses
- `404` - Election or position not found

---

### 5. Get Ballots
**GET** `/api/voting/ballots/{election_id}`

Get all ballots for an election (Admin only).

#### Path Parameters
- `election_id` (string, UUID) - Election ID

#### Response
```json
{
  "election": {
    "id": "string (UUID)",
    "title": "string",
    "election_year": "string",
    "status": "string"
  },
  "ballots": [
    {
      "ballot_id": "string (UUID)",
      "student": {
        "id": "string (UUID)",
        "name": "string",
        "email": "string",
        "year_of_study": "string",
        "department": "string"
      },
      "submitted_at": "string (ISO datetime)",
      "ip_address": "string"
    }
  ],
  "total_ballots": "number"
}
```

#### Error Responses
- `404` - Election not found

---

### 6. Get Voting Statistics
**GET** `/api/voting/statistics/{election_id}`

Get comprehensive voting statistics for an election.

#### Path Parameters
- `election_id` (string, UUID) - Election ID

#### Response
```json
{
  "election": {
    "id": "string (UUID)",
    "title": "string",
    "election_year": "string",
    "status": "string",
    "start_time": "string (ISO datetime)",
    "end_time": "string (ISO datetime)"
  },
  "participation": {
    "total_ballots_cast": "number",
    "total_eligible_students": "number",
    "participation_rate": "number (percentage)"
  },
  "by_department": [
    {
      "department": "string",
      "ballot_count": "number"
    }
  ],
  "by_year": [
    {
      "year_of_study": "string",
      "ballot_count": "number"
    }
  ],
  "timeline": []
}
```

#### Error Responses
- `404` - Election not found

---

### 7. Get Active Elections
**GET** `/api/voting/elections/active`

Get all currently active elections.

#### Response
```json
{
  "active_elections": [
    {
      "id": "string (UUID)",
      "title": "string",
      "election_year": "string",
      "description": "string",
      "start_time": "string (ISO datetime)",
      "end_time": "string (ISO datetime)",
      "is_anonymous_tally": "boolean",
      "positions": [
        {
          "id": "string (UUID)",
          "name": "string"
        }
      ]
    }
  ],
  "total": "number"
}
```

---

### 8. Get Upcoming Elections
**GET** `/api/voting/elections/upcoming`

Get all upcoming elections.

#### Response
```json
{
  "upcoming_elections": [
    {
      "id": "string (UUID)",
      "title": "string",
      "election_year": "string",
      "description": "string",
      "start_time": "string (ISO datetime)",
      "end_time": "string (ISO datetime)",
      "is_anonymous_tally": "boolean",
      "positions": [
        {
          "id": "string (UUID)",
          "name": "string"
        }
      ]
    }
  ],
  "total": "number"
}
```

---

## Data Models

### Vote Object
```json
{
  "position_id": "string (UUID)",
  "candidate_id": "string (UUID) | null"
}
```

### Ballot Object
```json
{
  "id": "string (UUID)",
  "election_id": "string (UUID)",
  "student_id": "string (UUID)",
  "submitted_at": "string (ISO datetime)",
  "ip_address": "string"
}
```

### VoteSelection Object
```json
{
  "id": "string (UUID)",
  "ballot_id": "string (UUID)",
  "position_id": "string (UUID)",
  "candidate_id": "string (UUID) | null"
}
```

---

## Business Rules

### Voting Rules
1. Students can only vote once per election
2. Students must be verified to vote
3. Voting is only allowed during ACTIVE elections
4. Voting must occur within the election's start and end times
5. Each position must have exactly one vote (including "None of the Above")
6. Only approved candidates can receive votes

### Security Considerations
1. IP addresses are logged for audit purposes
2. Ballot IDs are generated for tracking
3. Results endpoints should be protected with admin authentication
4. Vote data is stored anonymously (linked only to ballot, not student)

### Data Integrity
1. All foreign key relationships are enforced
2. Unique constraints prevent duplicate votes
3. Cascade deletes maintain referential integrity
4. Transaction rollback on errors ensures data consistency

---

## Example Usage

### Submit a Vote
```bash
curl -X POST http://localhost:5000/api/voting/submit \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": "123e4567-e89b-12d3-a456-426614174000",
    "election_id": "123e4567-e89b-12d3-a456-426614174001",
    "votes": [
      {
        "position_id": "123e4567-e89b-12d3-a456-426614174002",
        "candidate_id": "123e4567-e89b-12d3-a456-426614174003"
      },
      {
        "position_id": "123e4567-e89b-12d3-a456-426614174004",
        "candidate_id": null
      }
    ]
  }'
```

### Check Voting Status
```bash
curl http://localhost:5000/api/voting/status/123e4567-e89b-12d3-a456-426614174000/123e4567-e89b-12d3-a456-426614174001
```

### Get Election Results
```bash
curl http://localhost:5000/api/voting/results/123e4567-e89b-12d3-a456-426614174001
```
