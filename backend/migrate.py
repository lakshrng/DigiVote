#!/usr/bin/env python3
"""
Database migration management script for DigiVote.
"""

import os
import sys
import subprocess
from pathlib import Path

def run_command(command, description):
    """Run a command and handle errors."""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        if result.stdout:
            print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed:")
        print(f"Error: {e.stderr}")
        return False

def main():
    """Main migration management function."""
    if len(sys.argv) < 2:
        print("Usage: python migrate.py <command>")
        print("Commands:")
        print("  init        - Initialize Alembic (first time setup)")
        print("  create      - Create a new migration")
        print("  upgrade     - Apply all pending migrations")
        print("  downgrade   - Rollback last migration")
        print("  status      - Show migration status")
        print("  history     - Show migration history")
        print("  reset       - Reset database and create all tables")
        return

    command = sys.argv[1].lower()
    
    # Change to backend directory
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)
    
    if command == "init":
        # Initialize Alembic
        if not Path("migrations").exists():
            run_command("alembic init migrations", "Initializing Alembic")
        else:
            print("✅ Alembic already initialized")
            
    elif command == "create":
        if len(sys.argv) < 3:
            print("Usage: python migrate.py create <message>")
            return
        message = sys.argv[2]
        run_command(f'alembic revision --autogenerate -m "{message}"', f"Creating migration: {message}")
        
    elif command == "upgrade":
        run_command("alembic upgrade head", "Applying migrations")
        
    elif command == "downgrade":
        run_command("alembic downgrade -1", "Rolling back last migration")
        
    elif command == "status":
        run_command("alembic current", "Checking migration status")
        
    elif command == "history":
        run_command("alembic history", "Showing migration history")
        
    elif command == "reset":
        print("⚠️  This will reset your database. Are you sure? (y/N)")
        confirm = input().lower()
        if confirm == 'y':
            # Drop all tables and recreate
            from database import engine, Base
            Base.metadata.drop_all(bind=engine)
            Base.metadata.create_all(bind=engine)
            print("✅ Database reset completed")
        else:
            print("❌ Database reset cancelled")
    else:
        print(f"Unknown command: {command}")

if __name__ == "__main__":
    main()
