# DigiVote - Full Stack App

A minimal full-stack scaffold with a Flask backend (PostgreSQL via SQLAlchemy) and a Vite + React frontend.

## Prerequisites
- Python 3.11+
- Node.js 18+
- A running PostgreSQL instance (local Docker or managed)

---

## 🖥️ Backend Setup

```bash
# From repository root
python -m venv venv
. .venv/Scripts/Activate.ps1  
cd backend
pip install -r requirements.txt
python server.py  # Start your server (auto-creates tables if needed)
python verify_tables.py  # Check if everything is working correctly
