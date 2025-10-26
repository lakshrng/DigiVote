import uuid
from flask import Blueprint, request, jsonify
from sqlalchemy.orm import joinedload
from sqlalchemy import and_

from database import get_session, Candidate, Student, User, Election, Position, Department

candidate_bp = Blueprint('candidate', __name__, url_prefix='/api/candidates')


# -------------------- Candidate Application Routes -------------------- #

@candidate_bp.route('/apply', methods=['POST'])
def apply_for_position():
    data = request.get_json() or {}
    student_id = data.get('student_id')
    position_id = data.get('position_id')
    election_id = data.get('election_id')
    platform_statement = data.get('platform_statement', '').strip()
    photo_url = data.get('photo_url', '').strip()

    if not all([student_id, position_id, election_id]):
        return jsonify({"error": "student_id, position_id, and election_id are required"}), 400

    with get_session() as session:
        # Validate student
        student = session.query(Student).filter(Student.id == student_id).first()
        if not student:
            return jsonify({"error": "Student not found"}), 404

        # Check user verification
        user = session.query(User).filter(User.id == student.user_id).first()
        if not user or not user.is_verified:
            return jsonify({"error": "Student account not verified"}), 403

        # Validate election
        election = session.query(Election).filter(Election.id == election_id).first()
        if not election:
            return jsonify({"error": "Election not found"}), 404
        if election.status != "UPCOMING":
            return jsonify({"error": "Applications are only accepted for upcoming elections"}), 400

        # Validate position
        position = session.query(Position).filter(
            and_(Position.id == position_id, Position.election_id == election_id)
        ).first()
        if not position:
            return jsonify({"error": "Position not found or doesn't belong to this election"}), 404

        # Check duplicate application
        existing = session.query(Candidate).filter(
            and_(Candidate.student_id == student_id, Candidate.election_id == election_id)
        ).first()
        if existing:
            return jsonify({"error": "You have already applied for a position in this election"}), 409

        # Create candidate
        candidate = Candidate(
            student_id=student_id,
            position_id=position_id,
            election_id=election_id,
            platform_statement=platform_statement,
            photo_url=photo_url,
            is_approved=False
        )
        session.add(candidate)
        session.commit()

        return jsonify({
            "message": "Application submitted successfully. Awaiting admin approval.",
            "candidate_id": candidate.id,
            "status": "pending_approval"
        }), 201


@candidate_bp.route('/my-applications/<student_id>', methods=['GET'])
def get_my_applications(student_id):
    with get_session() as session:
        student = session.query(Student).filter(Student.id == student_id).first()
        if not student:
            return jsonify({"error": "Student not found"}), 404

        applications = session.query(Candidate).options(
            joinedload(Candidate.position),
            joinedload(Candidate.election)
        ).filter(Candidate.student_id == student_id).all()

        applications_data = []
        for app in applications:
            applications_data.append({
                "id": app.id,
                "election": {
                    "id": app.election.id,
                    "title": app.election.title,
                    "election_year": app.election.election_year,
                    "status": app.election.status
                },
                "position": {
                    "id": app.position.id,
                    "name": app.position.name
                },
                "platform_statement": app.platform_statement,
                "photo_url": app.photo_url,
                "is_approved": app.is_approved,
                "applied_at": app.created_at.isoformat() if hasattr(app, 'created_at') else None
            })

        return jsonify({
            "applications": applications_data,
            "total": len(applications_data)
        }), 200


# -------------------- Candidate Management Routes -------------------- #

@candidate_bp.route('/<candidate_id>', methods=['GET'])
def get_candidate_details(candidate_id):
    with get_session() as session:
        candidate = session.query(Candidate).options(
            joinedload(Candidate.student).joinedload(Student.user),
            joinedload(Candidate.student).joinedload(Student.department),
            joinedload(Candidate.position).joinedload(Position.election)
        ).filter(Candidate.id == candidate_id).first()

        if not candidate:
            return jsonify({"error": "Candidate not found"}), 404

        return jsonify({
            "id": candidate.id,
            "student": {
                "id": candidate.student.id,
                "user": {
                    "first_name": candidate.student.user.first_name,
                    "last_name": candidate.student.user.last_name,
                    "email": candidate.student.user.email
                },
                "year_of_study": candidate.student.year_of_study,
                "department": {
                    "id": candidate.student.department.id,
                    "name": candidate.student.department.name
                } if candidate.student.department else None
            },
            "position": {
                "id": candidate.position.id,
                "name": candidate.position.name
            },
            "election": {
                "id": candidate.election.id,
                "title": candidate.election.title,
                "election_year": candidate.election.election_year,
                "status": candidate.election.status
            },
            "platform_statement": candidate.platform_statement,
            "photo_url": candidate.photo_url,
            "is_approved": candidate.is_approved
        }), 200


@candidate_bp.route('/<candidate_id>', methods=['PUT'])
def update_candidate_application(candidate_id):
    data = request.get_json() or {}
    platform_statement = data.get('platform_statement', '').strip()
    photo_url = data.get('photo_url', '').strip()

    with get_session() as session:
        candidate = session.query(Candidate).filter(Candidate.id == candidate_id).first()
        if not candidate:
            return jsonify({"error": "Candidate application not found"}), 404
        if candidate.is_approved:
            return jsonify({"error": "Cannot modify approved applications"}), 400

        if platform_statement:
            candidate.platform_statement = platform_statement
        if photo_url:
            candidate.photo_url = photo_url

        session.commit()

        return jsonify({
            "message": "Application updated successfully",
            "candidate_id": candidate.id
        }), 200


@candidate_bp.route('/<candidate_id>', methods=['DELETE'])
def withdraw_application(candidate_id):
    with get_session() as session:
        candidate = session.query(Candidate).filter(Candidate.id == candidate_id).first()
        if not candidate:
            return jsonify({"error": "Candidate application not found"}), 404
        if candidate.is_approved:
            return jsonify({"error": "Cannot withdraw approved applications"}), 400

        session.delete(candidate)
        session.commit()

        return jsonify({
            "message": "Application withdrawn successfully"
        }), 200


# -------------------- Admin Routes -------------------- #

@candidate_bp.route('/admin/pending', methods=['GET'])
def get_pending_applications():
    with get_session() as session:
        pending_apps = session.query(Candidate).options(
            joinedload(Candidate.student).joinedload(Student.user),
            joinedload(Candidate.student).joinedload(Student.department),
            joinedload(Candidate.position).joinedload(Position.election)
        ).filter(Candidate.is_approved == False).all()

        result = []
        for app in pending_apps:
            result.append({
                "id": app.id,
                "student": {
                    "id": app.student.id,
                    "user": {
                        "first_name": app.student.user.first_name,
                        "last_name": app.student.user.last_name,
                        "email": app.student.user.email
                    },
                    "year_of_study": app.student.year_of_study,
                    "department": {
                        "id": app.student.department.id,
                        "name": app.student.department.name
                    } if app.student.department else None
                },
                "position": {
                    "id": app.position.id,
                    "name": app.position.name
                },
                "election": {
                    "id": app.election.id,
                    "title": app.election.title,
                    "election_year": app.election.election_year,
                    "status": app.election.status
                },
                "platform_statement": app.platform_statement,
                "photo_url": app.photo_url,
                "applied_at": app.created_at.isoformat() if hasattr(app, 'created_at') else None
            })

        return jsonify({
            "pending_applications": result,
            "total": len(result)
        }), 200
