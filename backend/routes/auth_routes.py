from flask import Blueprint, request, jsonify

from werkzeug.security import generate_password_hash

from database import get_session, User, Student, College, Department

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    return jsonify({"message": f"Attempting login for {data.get('email')}"}), 200

@auth_bp.route('/register', methods=['POST'])
def register():
    payload = request.get_json(silent=True) or {}
    first_name = (payload.get('first_name') or '').strip()
    last_name = (payload.get('last_name') or '').strip()
    email = (payload.get('email') or '').strip().lower()
    password = payload.get('password') or ''
    is_admin = payload.get('is_admin', False)

    # Student-specific fields
    year_of_study = (payload.get('year_of_study') or '').strip()
    department_id = payload.get('department_id') or ''

    if not first_name or not last_name or not email or not password:
        return jsonify({"error": "first_name, last_name, email, and password are required"}), 400

    password_hash = generate_password_hash(password)

    for session in get_session():
        # check existing user by email
        if session.query(User).filter(User.email == email).first():
            return jsonify({"error": "email already registered"}), 409

        user = User(
            first_name=first_name,
            last_name=last_name,
            email=email,
            password_hash=password_hash,
            is_admin=is_admin,
        )
        session.add(user)
        session.flush()  # get user.id

        # If not admin, create Student record
        if not is_admin:
            if not year_of_study or not department_id:
                return jsonify({"error": "year_of_study and department_id required for student"}), 400
            
            # Verify department exists
            department = session.query(Department).filter(Department.id == department_id).first()
            if not department:
                return jsonify({"error": "invalid department_id"}), 400
                
            student = Student(
                user_id=user.id,
                year_of_study=year_of_study,
                department_id=department_id,
            )
            session.add(student)

        # commit happens in get_session() generator context
        return jsonify({
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "is_admin": user.is_admin,
        }), 201

