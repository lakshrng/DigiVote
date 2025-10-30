#!/usr/bin/env python3
"""
Simple test to verify the OTP creation fix works properly.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import get_session, User, Student, College, Department
from utils import create_otp
from werkzeug.security import generate_password_hash

def test_otp_creation():
    """Test that OTP creation works with the session parameter."""
    print("Testing OTP creation fix...")
    
    try:
        for session in get_session():
            # Create a test user with unique identifiers
            import uuid
            unique_id = str(uuid.uuid4())[:8]
            test_user = User(
                first_name="Test",
                last_name="User",
                email=f"test{unique_id}@student.nitw.ac.in",
                phone=f"+91987654{unique_id[:4]}",
                password_hash=generate_password_hash("test123"),
                is_admin=False,
                is_verified=False
            )
            session.add(test_user)
            session.flush()  # Get the user ID
            
            # Test OTP creation with session parameter
            otp_code = create_otp(test_user.id, 'email', session)
            print(f"✅ OTP created successfully: {otp_code}")
            
            # Test OTP creation for phone
            phone_otp = create_otp(test_user.id, 'phone', session)
            print(f"✅ Phone OTP created successfully: {phone_otp}")
            
            # Clean up
            session.rollback()  # Don't commit the test data
            
        print("✅ All tests passed! The OTP creation fix is working correctly.")
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

if __name__ == "__main__":
    success = test_otp_creation()
    sys.exit(0 if success else 1)
