from database import get_session
from database import User, Student, College, Department, Election, Position, Candidate
from datetime import datetime

with get_session() as session:
    # --- College ---
    college = session.get(College, "college-001")
    if not college:
        college = College(id="college-001", name="Awesome College")
        session.add(college)

    # --- Department ---
    department = session.get(Department, "CSE")
    if not department:
        department = Department(id="CSE", name="Computer Science", college=college)
        session.add(department)

    # --- Users & Students ---
    def get_or_create_user(email, first_name, last_name, password_hash, year_of_study):
        user = session.query(User).filter_by(email=email).first()
        if user:
            student = session.query(Student).filter_by(user_id=user.id).first()
        else:
            user = User(email=email, first_name=first_name, last_name=last_name, password_hash=password_hash, is_verified=True)
            student = Student(user=user, department=department, year_of_study=year_of_study)
            session.add(student)
        return user, student

    user1, student1 = get_or_create_user("alice@example.com", "Alice", "Johnson", "pass1", "2")
    user2, student2 = get_or_create_user("bob@example.com", "Bob", "Smith", "pass2", "3")
    user3, student3 = get_or_create_user("carol@example.com", "Carol", "Lee", "pass3", "1")

    # --- Election ---
    election = session.query(Election).filter_by(title="2025 Student Council").first()
    if not election:
        election = Election(title="2025 Student Council", start_time=datetime(2025, 11, 1, 0, 0), end_time=datetime(2025, 11, 30, 23, 59))
        session.add(election)

    # --- Positions ---
    def get_or_create_position(name):
        position = session.query(Position).filter_by(name=name, election_id=election.id).first()
        if not position:
            position = Position(name=name, election=election)
            session.add(position)
        return position

    position_president = get_or_create_position("President")
    position_secretary = get_or_create_position("Secretary")

    # --- Candidates ---
    def get_or_create_candidate(student, position):
        candidate = session.query(Candidate).filter_by(student_id=student.id, position_id=position.id).first()
        if not candidate:
            candidate = Candidate(student=student, position=position, election=election)
            session.add(candidate)
        return candidate

    candidate1 = get_or_create_candidate(student1, position_president)
    candidate2 = get_or_create_candidate(student2, position_secretary)
    candidate3 = get_or_create_candidate(student3, position_president)

    print("✅ Sample data added (without duplicates)")
