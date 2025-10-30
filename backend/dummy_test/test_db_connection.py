#!/usr/bin/env python3
"""
Test database connection and write a simple record to verify it's working.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import get_session, User, engine
from werkzeug.security import generate_password_hash
import uuid

def test_database_connection():
    """Test if we can actually write to the database."""
    print("🔍 Testing database connection...")
    
    try:
        # Test 1: Check if we can connect to the database
        print(f"📊 Database URL: {os.getenv('DATABASE_URL', 'postgresql+psycopg://postgres:1234@localhost:5432/digi-voter')}")
        
        # Test 2: Try to create a test user and see if it persists
        test_email = f"test-{str(uuid.uuid4())[:8]}@student.nitw.ac.in"
        test_phone = f"+919876543{str(uuid.uuid4())[:3]}"
        print(f"🔍 Creating test user with email: {test_email}")
        print(f"🔍 Using phone number: {test_phone}")
        
        for session in get_session():
            # Create a test user
            test_user = User(
                first_name="Test",
                last_name="User",
                email=test_email,
                phone=test_phone,
                password_hash=generate_password_hash("test123"),
                is_admin=False,
                is_verified=False
            )
            session.add(test_user)
            print(f"🔍 Test user added to session: {test_user.id}")
            
        print("🔍 Session committed, checking if user exists...")
        
        # Test 3: Check if the user actually exists in the database
        for session in get_session():
            found_user = session.query(User).filter(User.email == test_email).first()
            if found_user:
                print(f"✅ SUCCESS: Test user found in database with ID: {found_user.id}")
                print(f"✅ User details: {found_user.first_name} {found_user.last_name} ({found_user.email})")
                
                # Clean up test user
                session.delete(found_user)
                print("🧹 Test user cleaned up")
                return True
            else:
                print("❌ FAILED: Test user not found in database after commit")
                return False
                
    except Exception as e:
        print(f"❌ Database connection test failed: {e}")
        return False

if __name__ == "__main__":
    success = test_database_connection()
    sys.exit(0 if success else 1)
