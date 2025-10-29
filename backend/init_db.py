"""
Database initialization script
Run this to create all tables and optionally seed test data
"""
import sys
from datetime import datetime, timedelta
from database import create_all_tables, SessionLocal
from database import (
    User, College, Department, Student, Election, 
    Position, Candidate, ELECTION_STATUS_ACTIVE, COLLEGE_STATUS_ACTIVE
)
import uuid

def init_database():
    """Create all tables"""
    print("Creating database tables...")
    create_all_tables()
    print("✅ Tables created successfully!")

def seed_test_data():
    """Seed database with test data for testing voting routes"""
    session = SessionLocal()
    
    try:
        # Check if data already exists
        existing_users = session.query(User).count()
        if existing_users > 0:
            print("⚠️  Database already has data. Skipping seed.")
            return
        
        print("Seeding test data...")
        
        # 1. Create College
        college = College(
            id=str(uuid.uuid4()),
            name="Test Engineering College",
            status=COLLEGE_STATUS_ACTIVE
        )
        session.add(college)
        session.flush()
        
        # 2. Create Department
        department = Department(
            id=str(uuid.uuid4()),
            college_id=college.id,
            name="Computer Science"
        )
        session.add(department)
        session.flush()
        
        # 3. Create Users and Students
        students = []
        for i in range(1, 6):
            user = User(
                id=str(uuid.uuid4()),
                email=f"student{i}@test.com",
                phone=f"555000000{i}",
                password_hash="$2b$12$dummy_hash_for_testing",  # Dummy hash
                first_name=f"Student{i}",
                last_name=f"Test{i}",
                is_admin=False,
                is_verified=True
            )
            session.add(user)
            session.flush()
            
            student = Student(
                id=str(uuid.uuid4()),
                user_id=user.id,
                year_of_study=f"Year {(i % 4) + 1}",
                department_id=department.id
            )
            session.add(student)
            students.append(student)
        
        session.flush()
        
        # 4. Create Admin User
        admin_user = User(
            id=str(uuid.uuid4()),
            email="admin@test.com",
            phone="5550000099",
            password_hash="$2b$12$dummy_hash_for_testing",
            first_name="Admin",
            last_name="User",
            is_admin=True,
            is_verified=True
        )
        session.add(admin_user)
        session.flush()
        
        # 5. Create Election
        now = datetime.utcnow()
        election = Election(
            id=str(uuid.uuid4()),
            election_year="2025",
            title="Student Council Election 2025",
            description="Annual student council election",
            start_time=now - timedelta(hours=1),  # Started 1 hour ago
            end_time=now + timedelta(days=7),      # Ends in 7 days
            status=ELECTION_STATUS_ACTIVE,
            is_anonymous_tally=True
        )
        session.add(election)
        session.flush()
        
        # 6. Create Positions
        positions_data = ["President", "Vice President", "Secretary"]
        positions = []
        
        for pos_name in positions_data:
            position = Position(
                id=str(uuid.uuid4()),
                election_id=election.id,
                name=pos_name
            )
            session.add(position)
            positions.append(position)
        
        session.flush()
        
        # 7. Create Candidates
        # First 3 students run for President
        for i in range(min(3, len(students))):
            candidate = Candidate(
                id=str(uuid.uuid4()),
                student_id=students[i].id,
                position_id=positions[0].id,  # President
                election_id=election.id,
                platform_statement=f"Vote for me! I promise to improve student life. - {students[i].user.first_name}",
                photo_url=f"https://ui-avatars.com/api/?name=Student{i+1}",
                is_approved=True
            )
            session.add(candidate)
        
        session.commit()
        
        print("✅ Test data seeded successfully!")
        print("\n📋 Test Credentials:")
        print("Student: student1@test.com (password: test123)")
        print("Student: student2@test.com (password: test123)")
        print("Admin: admin@test.com (password: test123)")
        print(f"\n🗳️  Active Election ID: {election.id}")
        
    except Exception as e:
        print(f"❌ Error seeding data: {e}")
        session.rollback()
        raise
    finally:
        session.close()

if __name__ == "__main__":
    init_database()
    
    # Ask if user wants to seed test data
    if len(sys.argv) > 1 and sys.argv[1] == "--seed":
        seed_test_data()
    else:
        print("\nRun with --seed flag to add test data:")
        print("python init_db.py --seed")