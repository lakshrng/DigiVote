from flask import Blueprint, request, jsonify
from datetime import datetime

from werkzeug.security import generate_password_hash, check_password_hash

from database import get_session, User, Student, College, Department
from utils import (
    validate_email_domain, validate_phone_number, format_phone_number,
    create_otp, verify_otp, send_email_otp, send_sms_otp, get_user_by_email_or_phone
)

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    payload = request.get_json(silent=True) or {}
    first_name = (payload.get('first_name') or '').strip()
    last_name = (payload.get('last_name') or '').strip()
    email = (payload.get('email') or '').strip().lower()
    phone = (payload.get('phone') or '').strip()
    password = payload.get('password') or ''
    # is_admin = payload.get('is_admin', False)

    # Student-specific fields
    year_of_study = (payload.get('year_of_study') or '').strip()
    department_id = payload.get('department_id') or ''

    # Validation
    if not first_name or not last_name or not email or not password:
        return jsonify({"error": "first_name, last_name, email, and password are required"}), 400

    # Validate email domain for students
    if not validate_email_domain(email):
        return jsonify({"error": "Email must be from @student.nitw.ac.in domain"}), 400

    # Validate phone number if provided
    if phone:
        if not validate_phone_number(phone):
            return jsonify({"error": "Invalid phone number format"}), 400
        phone = format_phone_number(phone)

    # Validate student-specific fields BEFORE creating user
    if not year_of_study or not department_id:
        return jsonify({"error": "year_of_study and department_id required for student"}), 400

    password_hash = generate_password_hash(password)

    # First, do all the validation checks
    with get_session() as session:
        # Check existing user by email
        if session.query(User).filter(User.email == email).first():
            return jsonify({"error": "email already registered"}), 409

        # Check existing user by phone if provided
        if phone and session.query(User).filter(User.phone == phone).first():
            return jsonify({"error": "phone number already registered"}), 409

        # Verify department exists BEFORE creating user
        department = session.query(Department).filter(Department.id == department_id).first()
        if not department:
            return jsonify({"error": "invalid department_id"}), 400

    # Now create the user in a separate session
    with get_session() as session:
        print(f"🔍 DEBUG: Creating user with email: {email}")
        user = User(
            first_name=first_name,
            last_name=last_name,
            email=email,
            phone=phone,
            password_hash=password_hash,
            is_admin=False,
            is_verified=False,  # User needs to verify via OTP
        )
        session.add(user)
        session.flush()  # get user.id
        print(f"🔍 DEBUG: User created with ID: {user.id}")
            
        student = Student(
            user_id=user.id,
            year_of_study=year_of_study,
            department_id=department_id,
        )
        session.add(student)
        print(f"🔍 DEBUG: Student record created for user: {user.id}")

        # Generate and send OTP for email verification
        print(f"🔍 DEBUG: Creating email OTP for user: {user.id}")
        otp_code = create_otp(user.id, 'email', session)
        send_email_otp(email, otp_code)
        print(f"🔍 DEBUG: Email OTP created: {otp_code}")

        # If phone provided, also send SMS OTP
        if phone:
            print(f"🔍 DEBUG: Creating SMS OTP for user: {user.id}")
            sms_otp_code = create_otp(user.id, 'phone', session)
            send_sms_otp(phone, sms_otp_code)
            print(f"🔍 DEBUG: SMS OTP created: {sms_otp_code}")

        print(f"🔍 DEBUG: About to return success response for user: {user.id}")
        # Store response data before returning
        response_data = {
            "message": "Registration successful. Please verify your email and phone (if provided) using the OTP sent.",
            "user_id": user.id,
            "email_otp_sent": True,
            "sms_otp_sent": bool(phone)
        }
        
        # The session will commit automatically when the for loop exits
        return jsonify(response_data), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    identifier = (data.get('email') or data.get('phone') or '').strip()
    password = data.get('password') or ''

    if not identifier or not password:
        return jsonify({"error": "email/phone and password are required"}), 400

    with get_session() as session:
        user = get_user_by_email_or_phone(identifier)
        if not user:
            return jsonify({"error": "Invalid credentials"}), 401

        if not check_password_hash(user.password_hash, password):
            return jsonify({"error": "Invalid credentials"}), 401

        if not user.is_verified:
            return jsonify({"error": "Account not verified. Please verify your email/phone first."}), 403

        return jsonify({
            "message": "Login successful",
            "user": {
                "id": user.id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "phone": user.phone,
                "is_admin": user.is_admin,
                "is_verified": user.is_verified
            }
        }), 200


@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp_route():
    data = request.get_json() or {}
    user_id = data.get('user_id')
    otp_code = data.get('otp_code')
    otp_type = data.get('otp_type', 'email')  # 'email' or 'phone'

    if not user_id or not otp_code or otp_type not in ['email', 'phone']:
        return jsonify({"error": "user_id, otp_code, and otp_type (email/phone) are required"}), 400

    with get_session() as session:
        user = session.query(User).filter(User.id == user_id).first()
        if not user:
            return jsonify({"error": "User not found"}), 404

        if verify_otp(user_id, otp_code, otp_type):
            # Mark user as verified if both email and phone are verified
            if otp_type == 'email':
                user.is_verified = True
            elif otp_type == 'phone' and user.phone:
                user.is_verified = True

            return jsonify({
                "message": f"{otp_type.capitalize()} verification successful",
                "user": {
                    "id": user.id,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "email": user.email,
                    "phone": user.phone,
                    "is_admin": user.is_admin,
                    "is_verified": user.is_verified
                }
            }), 200
        else:
            return jsonify({"error": "Invalid or expired OTP"}), 400


@auth_bp.route('/resend-otp', methods=['POST'])
def resend_otp():
    data = request.get_json() or {}
    user_id = data.get('user_id')
    otp_type = data.get('otp_type', 'email')  # 'email' or 'phone'

    if not user_id or otp_type not in ['email', 'phone']:
        return jsonify({"error": "user_id and otp_type (email/phone) are required"}), 400

    for session in get_session():
        user = session.query(User).filter(User.id == user_id).first()
        if not user:
            return jsonify({"error": "User not found"}), 404

        if otp_type == 'email':
            otp_code = create_otp(user_id, 'email', session)
            send_email_otp(user.email, otp_code)
            return jsonify({"message": "Email OTP sent successfully"}), 200
        elif otp_type == 'phone' and user.phone:
            otp_code = create_otp(user_id, 'phone', session)
            send_sms_otp(user.phone, otp_code)
            return jsonify({"message": "SMS OTP sent successfully"}), 200
        else:
            return jsonify({"error": "Phone number not available for SMS OTP"}), 400


@auth_bp.route('/otp-login', methods=['POST'])
def otp_login():
    data = request.get_json() or {}
    identifier = (data.get('email') or data.get('phone') or '').strip()
    otp_code = data.get('otp_code')

    if not identifier or not otp_code:
        return jsonify({"error": "email/phone and otp_code are required"}), 400

    for session in get_session():
        user = get_user_by_email_or_phone(identifier)
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Determine OTP type based on identifier
        otp_type = 'email' if '@' in identifier else 'phone'
        
        if verify_otp(user.id, otp_code, otp_type):
            return jsonify({
                "message": "OTP login successful",
                "user": {
                    "id": user.id,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "email": user.email,
                    "phone": user.phone,
                    "is_admin": user.is_admin,
                    "is_verified": user.is_verified
                }
            }), 200
        else:
            return jsonify({"error": "Invalid or expired OTP"}), 400


@auth_bp.route('/send-login-otp', methods=['POST'])
def send_login_otp():
    data = request.get_json() or {}
    identifier = (data.get('email') or data.get('phone') or '').strip()

    if not identifier:
        return jsonify({"error": "email or phone is required"}), 400

    for session in get_session():
        user = get_user_by_email_or_phone(identifier)
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Determine OTP type based on identifier
        otp_type = 'email' if '@' in identifier else 'phone'
        
        if otp_type == 'email':
            otp_code = create_otp(user.id, 'email', session)
            send_email_otp(user.email, otp_code)
            return jsonify({"message": "Login OTP sent to email"}), 200
        elif otp_type == 'phone' and user.phone:
            otp_code = create_otp(user.id, 'phone', session)
            send_sms_otp(user.phone, otp_code)
            return jsonify({"message": "Login OTP sent to phone"}), 200
        else:
            return jsonify({"error": "Phone number not available"}), 400


@auth_bp.route('/departments', methods=['GET'])
def get_departments():
    """Get all active departments with their colleges."""
    with get_session() as session:
        departments = session.query(Department).join(College).filter(
            College.status == COLLEGE_STATUS_ACTIVE
        ).all()
        
        departments_data = []
        for dept in departments:
            departments_data.append({
                "id": dept.id,
                "name": dept.name,
                "college_name": dept.college.name,
                "college_id": dept.college_id
            })
        
        return jsonify({
            "departments": departments_data
        }), 200


@auth_bp.route('/create-student-profile', methods=['POST'])
def create_student_profile():
    """Create or update student profile for authenticated user."""
    data = request.get_json() or {}
    year_of_study = (data.get('year_of_study') or '').strip()
    department_id = data.get('department_id') or ''

    # Validation
    if not year_of_study or not department_id:
        return jsonify({"error": "year_of_study and department_id are required"}), 400

    # Validate year of study
    valid_years = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year']
    if year_of_study not in valid_years:
        return jsonify({"error": "Invalid year of study"}), 400

    with get_session() as session:
        # Verify department exists
        department = session.query(Department).filter(Department.id == department_id).first()
        if not department:
            return jsonify({"error": "Invalid department_id"}), 400

        # Get user from token (you might need to implement JWT token validation)
        # For now, we'll assume user_id is passed in the request
        user_id = data.get('user_id')
        if not user_id:
            return jsonify({"error": "user_id is required"}), 400

        # Check if user exists
        user = session.query(User).filter(User.id == user_id).first()
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Check if student profile already exists
        existing_student = session.query(Student).filter(Student.user_id == user_id).first()
        if existing_student:
            # Update existing profile
            existing_student.year_of_study = year_of_study
            existing_student.department_id = department_id
            existing_student.updated_at = datetime.utcnow()
            
            return jsonify({
                "message": "Student profile updated successfully",
                "student": {
                    "id": existing_student.id,
                    "user_id": existing_student.user_id,
                    "year_of_study": existing_student.year_of_study,
                    "department_id": existing_student.department_id,
                    "department_name": department.name,
                    "college_name": department.college.name
                }
            }), 200
        else:
            # Create new student profile
            student = Student(
                user_id=user_id,
                year_of_study=year_of_study,
                department_id=department_id
            )
            session.add(student)
            session.flush()  # Get the student ID
            
            return jsonify({
                "message": "Student profile created successfully",
                "student": {
                    "id": student.id,
                    "user_id": student.user_id,
                    "year_of_study": student.year_of_study,
                    "department_id": student.department_id,
                    "department_name": department.name,
                    "college_name": department.college.name
                }
            }), 201


@auth_bp.route('/student-profile/<user_id>', methods=['GET'])
def get_student_profile(user_id):
    """Get student profile by user ID."""
    with get_session() as session:
        student = session.query(Student).join(Department).join(College).filter(
            Student.user_id == user_id
        ).first()
        
        if not student:
            return jsonify({"error": "Student profile not found"}), 404
        
        return jsonify({
            "student": {
                "id": student.id,
                "user_id": student.user_id,
                "year_of_study": student.year_of_study,
                "department_id": student.department_id,
                "department_name": student.department.name,
                "college_name": student.department.college.name,
                "created_at": student.created_at.isoformat(),
                "updated_at": student.updated_at.isoformat()
            }
        }), 200
