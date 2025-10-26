#!/usr/bin/env python3
"""
Script to populate the database with dummy data for testing and real college/department data.
"""

import os
import sys
from datetime import datetime
from database import get_session, User, Student, College, Department
from werkzeug.security import generate_password_hash

def create_colleges_and_departments():
    """Create NIT Warangal and its departments."""
    print("Creating colleges and departments...")
    
    for session in get_session():
        # Check if NIT Warangal already exists
        existing_college = session.query(College).filter(College.name == "NIT Warangal").first()
        if existing_college:
            print("NIT Warangal already exists, skipping...")
            college = existing_college
        else:
            college = College(
                name="NIT Warangal",
                status="ACTIVE"
            )
            session.add(college)
            session.flush()
            print(f"Created college: {college.name}")

        # Departments for NIT Warangal
        departments = [
            "Computer Science and Engineering",
            "Electronics and Communication Engineering", 
            "Electrical and Electronics Engineering",
            "Mechanical Engineering",
            "Civil Engineering",
            "Chemical Engineering",
            "Biotechnology Engineering",
            "Metallurgical and Materials Engineering"
        ]

        for dept_name in departments:
            # Check if department already exists
            existing_dept = session.query(Department).filter(
                Department.name == dept_name,
                Department.college_id == college.id
            ).first()
            
            if not existing_dept:
                department = Department(
                    college_id=college.id,
                    name=dept_name
                )
                session.add(department)
                print(f"Created department: {dept_name}")
            else:
                print(f"Department {dept_name} already exists, skipping...")

def create_dummy_users():
    """Create dummy users for testing."""
    print("Creating dummy users...")
    
    # Get the first department for dummy students
    for session in get_session():
        cse_dept = session.query(Department).filter(Department.name == "Computer Science and Engineering").first()
        if not cse_dept:
            print("CSE department not found, please run create_colleges_and_departments first")
            return

        # Dummy users data
        dummy_users = [
            {
                "first_name": "John",
                "last_name": "Doe", 
                "email": "john.doe@student.nitw.ac.in",
                "phone": "+919876543210",
                "password": "password123",
                "is_admin": False,
                "year_of_study": "3rd Year",
                "department_id": cse_dept.id
            },
            {
                "first_name": "Jane",
                "last_name": "Smith",
                "email": "jane.smith@student.nitw.ac.in", 
                "phone": "+919876543211",
                "password": "password123",
                "is_admin": False,
                "year_of_study": "2nd Year",
                "department_id": cse_dept.id
            },
            {
                "first_name": "Admin",
                "last_name": "User",
                "email": "admin@nitw.ac.in",
                "phone": "+919876543212", 
                "password": "admin123",
                "is_admin": True,
                "year_of_study": None,
                "department_id": None
            },
            {
                "first_name": "Alice",
                "last_name": "Johnson",
                "email": "alice.johnson@student.nitw.ac.in",
                "phone": "+919876543213",
                "password": "password123", 
                "is_admin": False,
                "year_of_study": "4th Year",
                "department_id": cse_dept.id
            },
            {
                "first_name": "Bob",
                "last_name": "Wilson",
                "email": "bob.wilson@student.nitw.ac.in",
                "phone": "+919876543214",
                "password": "password123",
                "is_admin": False, 
                "year_of_study": "1st Year",
                "department_id": cse_dept.id
            }
        ]

        for user_data in dummy_users:
            # Check if user already exists
            existing_user = session.query(User).filter(User.email == user_data["email"]).first()
            if existing_user:
                print(f"User {user_data['email']} already exists, skipping...")
                continue

            # Create user
            user = User(
                first_name=user_data["first_name"],
                last_name=user_data["last_name"],
                email=user_data["email"],
                phone=user_data["phone"],
                password_hash=generate_password_hash(user_data["password"]),
                is_admin=user_data["is_admin"],
                is_verified=True  # Mark as verified for testing
            )
            session.add(user)
            session.flush()

            # Create student record if not admin
            if not user_data["is_admin"]:
                student = Student(
                    user_id=user.id,
                    year_of_study=user_data["year_of_study"],
                    department_id=user_data["department_id"]
                )
                session.add(student)
                print(f"Created user: {user.first_name} {user.last_name} ({user.email})")
            else:
                print(f"Created admin user: {user.first_name} {user.last_name} ({user.email})")

def main():
    """Main function to populate the database."""
    print("Starting database population...")
    
    try:
        # Create colleges and departments first
        create_colleges_and_departments()
        
        # Then create dummy users
        create_dummy_users()
        
        print("\n✅ Database population completed successfully!")
        print("\nTest users created:")
        print("Students:")
        print("  - john.doe@student.nitw.ac.in (password: password123)")
        print("  - jane.smith@student.nitw.ac.in (password: password123)")
        print("  - alice.johnson@student.nitw.ac.in (password: password123)")
        print("  - bob.wilson@student.nitw.ac.in (password: password123)")
        print("\nAdmin:")
        print("  - admin@nitw.ac.in (password: admin123)")
        
    except Exception as e:
        print(f"❌ Error populating database: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
