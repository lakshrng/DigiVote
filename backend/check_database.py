#!/usr/bin/env python3
"""
Script to check if data is actually being saved to the database.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import get_session, User, Student, OTP

def check_database_contents():
    """Check what's currently in the database."""
    print("🔍 Checking database contents...")
    
    try:
        for session in get_session():
            # Check users
            users = session.query(User).all()
            print(f"\n📊 USERS in database: {len(users)}")
            for user in users:
                print(f"  - {user.email} (ID: {user.id}, Verified: {user.is_verified})")
            
            # Check students
            students = session.query(Student).all()
            print(f"\n📊 STUDENTS in database: {len(students)}")
            for student in students:
                print(f"  - User ID: {student.user_id}, Year: {student.year_of_study}")
            
            # Check OTPs
            otps = session.query(OTP).all()
            print(f"\n📊 OTPs in database: {len(otps)}")
            for otp in otps:
                print(f"  - User ID: {otp.user_id}, Type: {otp.otp_type}, Used: {otp.is_used}")
            
            print(f"\n✅ Database check completed successfully!")
            return True
            
    except Exception as e:
        print(f"❌ Error checking database: {e}")
        return False

if __name__ == "__main__":
    success = check_database_contents()
    sys.exit(0 if success else 1)
