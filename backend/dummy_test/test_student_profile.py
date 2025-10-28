#!/usr/bin/env python3
"""
Test script to verify the student profile creation functionality.
"""

import requests
import json

# Base URL for the API
BASE_URL = "http://localhost:5000/api"

def test_departments():
    """Test the departments endpoint."""
    print("Testing departments endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/auth/departments")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Departments loaded successfully: {len(data.get('departments', []))} departments")
            for dept in data.get('departments', [])[:3]:  # Show first 3
                print(f"  - {dept['name']} ({dept['college_name']})")
        else:
            print(f"❌ Failed to load departments: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"❌ Error testing departments: {e}")

def test_student_profile_creation():
    """Test student profile creation."""
    print("\nTesting student profile creation...")
    
    # First, we need a user_id. In a real scenario, this would come from authentication.
    # For testing, we'll use a dummy user_id
    test_user_id = "test-user-id-123"
    
    profile_data = {
        "user_id": test_user_id,
        "year_of_study": "3rd Year",
        "department_id": "test-dept-id"  # This would be a real department ID
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/create-student-profile",
            json=profile_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code in [200, 201]:
            data = response.json()
            print(f"✅ Student profile creation endpoint working")
            print(f"  Response: {data.get('message', 'No message')}")
        else:
            print(f"❌ Student profile creation failed: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"❌ Error testing student profile creation: {e}")

def main():
    """Main test function."""
    print("🧪 Testing Student Profile Creation Functionality")
    print("=" * 50)
    
    # Test departments endpoint
    test_departments()
    
    # Test student profile creation
    test_student_profile_creation()
    
    print("\n" + "=" * 50)
    print("✅ Test completed!")
    print("\nNote: Some tests may fail if the backend server is not running")
    print("or if the database is not populated with sample data.")

if __name__ == "__main__":
    main()
