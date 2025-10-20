# DigiVote - Full Stack App

A minimal full-stack scaffold with a Flask backend (PostgreSQL via SQLAlchemy) and a Vite + React frontend.

## Prerequisites
- Python 3.11+
- Node.js 18+
- A running PostgreSQL instance (local Docker or managed)

## Backend Setup

```bash
# From repository root
python -m venv venv
. .venv/Scripts/Activate.ps1  
cd backend
pip install -r requirements.txt
python server.py #Start your server (auto-creates tables if needed)
python verify_tables.py #Check if everything is working correctly

The API starts on `http://localhost:5000`.

### API Endpoints
- GET `/api/health` → `{ status: "ok" }`
- GET `/api/voters` → `[{ id, name }]`
- POST `/api/voters` with `{ name }` → `201 Created` with created voter

## Frontend Setup

```bash
# From repository root
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies `/api/*` to the backend.

## PostgreSQL and Environment
Create `backend/.env` with the following variables:

```env
# Flask
FLASK_ENV=development
PORT=5000
ALLOWED_ORIGINS=http://localhost:5173

# Database (SQLAlchemy URL format)
# postgresql+psycopg://USERNAME:PASSWORD@HOST:PORT/DBNAME
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/digivote
```

- The backend loads `backend/.env` automatically.
- On first run, tables are created automatically via SQLAlchemy metadata.

### Example: start Postgres with Docker
```bash
# Create a Postgres container with a database named digivote
docker run --name digivote-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=digivote -p 5432:5432 -d postgres:16
```

## Data Model (initial)
- Voter `voters(id, name)`
- Election `elections(id, title)`
- Candidate `candidates(id, name, election_id)` with unique (name, election_id)
- Vote `votes(id, voter_id, election_id, candidate_id)` with unique (voter_id, election_id)

These are defined in `backend/database.py` using SQLAlchemy 2.0 style.

## Project Structure
```
/full-stack-app
├── backend/
│   ├── .env
│   ├── requirements.txt
│   ├── server.py
│   └── database.py
├── frontend/
│   ├── package.json
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   └── vite.config.js
└── README.md
```

## Notes
- Uses SQLAlchemy 2.0 with `psycopg` 3 (binary extras) for PostgreSQL.
- Adjust `ALLOWED_ORIGINS` if accessing the API from other origins.
