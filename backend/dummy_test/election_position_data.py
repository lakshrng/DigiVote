#!/usr/bin/env python3
"""
Script to populate the database with dummy elections and positions.
This script creates sample data for testing the candidate application system.
"""

import os
import sys
from datetime import datetime, timedelta
from database import get_session, Election, Position, College, Department, User, Student
from werkzeug.security import generate_password_hash

def create_dummy_colleges_and_departments():
    """Create dummy colleges and departments."""
    print("🏫 Creating dummy colleges and departments...")
    
    with get_session() as session:
        # Check if colleges already exist
        existing_college = session.query(College).first()
        if existing_college:
            print("✅ Colleges and departments already exist, skipping...")
            return
        
        # Create NIT Warangal
        nitw = College(
            name="National Institute of Technology Warangal",
            status="ACTIVE"
        )
        session.add(nitw)
        session.flush()  # Get the ID
        
        # Create departments
        departments = [
            "Computer Science and Engineering",
            "Electronics and Communication Engineering", 
            "Mechanical Engineering",
            "Civil Engineering",
            "Electrical and Electronics Engineering",
            "Chemical Engineering",
            "Metallurgical and Materials Engineering",
            "Mining Engineering",
            "Biotechnology",
            "Mathematics",
            "Physics",
            "Chemistry"
        ]
        
        for dept_name in departments:
            department = Department(
                college_id=nitw.id,
                name=dept_name
            )
            session.add(department)
        
        print(f"✅ Created 1 college and {len(departments)} departments")

def create_dummy_elections():
    """Create dummy elections with various statuses."""
    print("🗳️ Creating dummy elections...")
    
    with get_session() as session:
        # Check if elections already exist
        existing_election = session.query(Election).first()
        if existing_election:
            print("✅ Elections already exist, skipping...")
            return
        
        # Get a department for the elections
        department = session.query(Department).first()
        if not department:
            print("❌ No departments found. Please run create_dummy_colleges_and_departments first.")
            return
        
        elections = [
            {
                "title": "Student Council Elections 2024",
                "election_year": "2024",
                "description": "Annual elections for the Student Council positions. Vote for your representatives to represent your interests.",
                "start_time": datetime.now() + timedelta(days=7),  # 7 days from now
                "end_time": datetime.now() + timedelta(days=8),  # 8 days from now
                "status": "UPCOMING"
            },
            {
                "title": "Department Representative Elections 2024",
                "election_year": "2024", 
                "description": "Elections for department representatives who will voice concerns and suggestions from their respective departments.",
                "start_time": datetime.now() + timedelta(days=14),  # 14 days from now
                "end_time": datetime.now() + timedelta(days=15),  # 15 days from now
                "status": "UPCOMING"
            },
            {
                "title": "Cultural Committee Elections 2024",
                "election_year": "2024",
                "description": "Elections for the Cultural Committee to organize and manage cultural events throughout the academic year.",
                "start_time": datetime.now() + timedelta(days=21),  # 21 days from now
                "end_time": datetime.now() + timedelta(days=22),  # 22 days from now
                "status": "UPCOMING"
            },
            {
                "title": "Sports Committee Elections 2024",
                "election_year": "2024",
                "description": "Elections for the Sports Committee to promote sports activities and manage inter-college competitions.",
                "start_time": datetime.now() + timedelta(days=28),  # 28 days from now
                "end_time": datetime.now() + timedelta(days=29),  # 29 days from now
                "status": "UPCOMING"
            },
            {
                "title": "Student Council Elections 2023",
                "election_year": "2023",
                "description": "Previous year's Student Council elections (completed).",
                "start_time": datetime.now() - timedelta(days=365),  # 1 year ago
                "end_time": datetime.now() - timedelta(days=364),  # 1 year ago
                "status": "COMPLETED"
            }
        ]
        
        for election_data in elections:
            election = Election(**election_data)
            session.add(election)
        
        print(f"✅ Created {len(elections)} elections")

def create_dummy_positions():
    """Create dummy positions for each election."""
    print("👔 Creating dummy positions...")
    
    with get_session() as session:
        # Get all elections
        elections = session.query(Election).all()
        
        if not elections:
            print("❌ No elections found. Please run create_dummy_elections first.")
            return
        
        # Define positions for different types of elections
        position_templates = {
            "Student Council Elections": [
                "President",
                "Vice President", 
                "General Secretary",
                "Joint Secretary",
                "Treasurer",
                "Cultural Secretary",
                "Sports Secretary",
                "Technical Secretary",
                "Placement Secretary",
                "Hostel Secretary"
            ],
            "Department Representative Elections": [
                "Department Representative",
                "Department Vice Representative"
            ],
            "Cultural Committee Elections": [
                "Cultural Committee Head",
                "Cultural Committee Vice Head",
                "Event Coordinator",
                "Public Relations Officer"
            ],
            "Sports Committee Elections": [
                "Sports Committee Head", 
                "Sports Committee Vice Head",
                "Cricket Team Captain",
                "Football Team Captain",
                "Basketball Team Captain",
                "Athletics Coordinator"
            ]
        }
        
        total_positions = 0
        for election in elections:
            # Determine position template based on election title
            positions_for_election = []
            for template_name, positions in position_templates.items():
                if template_name in election.title:
                    positions_for_election = positions
                    break
            
            # If no template matches, use generic positions
            if not positions_for_election:
                positions_for_election = [
                    "Chairperson",
                    "Vice Chairperson", 
                    "Secretary",
                    "Treasurer"
                ]
            
            # Create positions for this election
            for position_name in positions_for_election:
                position = Position(
                    election_id=election.id,
                    name=position_name
                )
                session.add(position)
                total_positions += 1
        
        print(f"✅ Created {total_positions} positions across {len(elections)} elections")

def create_dummy_admin_user():
    """Create a dummy admin user for testing."""
    print("👤 Creating dummy admin user...")
    
    with get_session() as session:
        # Check if admin user already exists
        existing_admin = session.query(User).filter(User.is_admin == True).first()
        if existing_admin:
            print("✅ Admin user already exists, skipping...")
            return
        
        # Create admin user
        admin_user = User(
            first_name="Admin",
            last_name="User",
            email="admin@nitw.ac.in",
            password_hash=generate_password_hash("admin123"),
            is_admin=True,
            is_verified=True
        )
        session.add(admin_user)
        
        print("✅ Created admin user (email: admin@nitw.ac.in, password: admin123)")

def create_dummy_student_users():
    """Create dummy student users for testing."""
    print("🎓 Creating dummy student users...")
    
    with get_session() as session:
        # Check if students already exist
        existing_student = session.query(Student).first()
        if existing_student:
            print("✅ Student users already exist, skipping...")
            return
        
        # Get departments
        departments = session.query(Department).all()
        if not departments:
            print("❌ No departments found. Please run create_dummy_colleges_and_departments first.")
            return
        
        # Create sample students
        students_data = [
            {"first_name": "John", "last_name": "Doe", "email": "john.doe@student.nitw.ac.in", "year": "3rd Year", "dept_index": 0},
            {"first_name": "Jane", "last_name": "Smith", "email": "jane.smith@student.nitw.ac.in", "year": "2nd Year", "dept_index": 1},
            {"first_name": "Mike", "last_name": "Johnson", "email": "mike.johnson@student.nitw.ac.in", "year": "4th Year", "dept_index": 2},
            {"first_name": "Sarah", "last_name": "Wilson", "email": "sarah.wilson@student.nitw.ac.in", "year": "1st Year", "dept_index": 0},
            {"first_name": "David", "last_name": "Brown", "email": "david.brown@student.nitw.ac.in", "year": "3rd Year", "dept_index": 3},
            {"first_name": "Emily", "last_name": "Davis", "email": "emily.davis@student.nitw.ac.in", "year": "2nd Year", "dept_index": 4},
            {"first_name": "Alex", "last_name": "Miller", "email": "alex.miller@student.nitw.ac.in", "year": "4th Year", "dept_index": 1},
            {"first_name": "Lisa", "last_name": "Garcia", "email": "lisa.garcia@student.nitw.ac.in", "year": "1st Year", "dept_index": 5},
            {"first_name": "Tom", "last_name": "Martinez", "email": "tom.martinez@student.nitw.ac.in", "year": "3rd Year", "dept_index": 6},
            {"first_name": "Anna", "last_name": "Anderson", "email": "anna.anderson@student.nitw.ac.in", "year": "2nd Year", "dept_index": 7}
        ]
        
        for student_data in students_data:
            # Create user
            user = User(
                first_name=student_data["first_name"],
                last_name=student_data["last_name"],
                email=student_data["email"],
                password_hash=generate_password_hash("student123"),
                is_admin=False,
                is_verified=True
            )
            session.add(user)
            session.flush()  # Get user ID
            
            # Create student record
            department = departments[student_data["dept_index"] % len(departments)]
            student = Student(
                user_id=user.id,
                year_of_study=student_data["year"],
                department_id=department.id
            )
            session.add(student)
        
        print(f"✅ Created {len(students_data)} student users")

def main():
    """Main function to populate all dummy data."""
    print("🚀 Starting dummy data population...")
    print("=" * 50)
    
    try:
        # Create data in the correct order
        # create_dummy_colleges_and_departments()
        create_dummy_elections()
        create_dummy_positions()
        # create_dummy_admin_user()
        # create_dummy_student_users()
        
        print("\n" + "=" * 50)
        print("🎉 Dummy data population completed successfully!")
        print("\n📋 Summary of created data:")
        print("   • 1 College (NIT Warangal)")
        print("   • 12 Departments")
        print("   • 5 Elections (4 upcoming, 1 completed)")
        print("   • Multiple positions per election")
        print("   • 1 Admin user (admin@nitw.ac.in)")
        print("   • 10 Student users")
        print("\n🔑 Login credentials:")
        print("   Admin: admin@nitw.ac.in / admin123")
        print("   Students: [email]@student.nitw.ac.in / student123")
        
    except Exception as e:
        print(f"❌ Error during data population: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
