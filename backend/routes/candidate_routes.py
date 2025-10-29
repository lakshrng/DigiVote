from flask import Blueprint, request, jsonify
from datetime import datetime
from sqlalchemy.orm import joinedload
from sqlalchemy import and_
from database import get_session, Candidate, Student, User, Election, Position, Department

candidate_bp = Blueprint("candidate", __name__, url_prefix="/api/candidates")


# -------------------- Candidate Application Routes -------------------- #

@candidate_bp.route("/apply", methods=["POST"])
def apply_for_position():
    """Apply for a position in an election."""
    data = request.get_json() or {}

    student_id = data.get("student_id")
    position_id = data.get("position_id")
    election_id = data.get("election_id")
    platform_statement = data.get("platform_statement", "").strip()
    photo_url = data.get("photo_url", "").strip()

    if not all([student_id, position_id, election_id]):
        return jsonify({"error": "student_id, position_id, and election_id are required"}), 400

    with get_session() as session:
        student = session.query(Student).filter(Student.id == student_id).first()
        if not student:
            return jsonify({"error": "Student not found"}), 404

        user = session.query(User).filter(User.id == student.user_id).first()
        if not user or not user.is_verified:
            return jsonify({"error": "Student account not verified"}), 403

        election = session.query(Election).filter(Election.id == election_id).first()
        if not election:
            return jsonify({"error": "Election not found"}), 404
        if election.status != "UPCOMING":
            return jsonify({"error": "Applications are only accepted for upcoming elections"}), 400

        position = session.query(Position).filter(
            and_(Position.id == position_id, Position.election_id == election_id)
        ).first()
        if not position:
            return jsonify({"error": "Position not found or doesn't belong to this election"}), 404

        existing = session.query(Candidate).filter(
            and_(Candidate.student_id == student_id, Candidate.election_id == election_id)
        ).first()
        if existing:
            return jsonify({"error": "You have already applied for a position in this election"}), 409

        candidate = Candidate(
            student_id=student_id,
            position_id=position_id,
            election_id=election_id,
            platform_statement=platform_statement,
            photo_url=photo_url,
            is_approved=False
        )

        session.add(candidate)

        return jsonify({
            "message": "Application submitted successfully. Awaiting admin approval.",
            "candidate_id": candidate.id,
            "status": "pending_approval"
        }), 201


@candidate_bp.route("/my-applications/<student_id>", methods=["GET"])
def get_my_applications(student_id):
    """Get all applications for a specific student."""
    with get_session() as session:
        student = session.query(Student).filter(Student.id == student_id).first()
        if not student:
            return jsonify({"error": "Student not found"}), 404

        applications = session.query(Candidate).options(
            joinedload(Candidate.position),
            joinedload(Candidate.election)
        ).filter(Candidate.student_id == student_id).all()

        data = [{
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
            "is_approved": app.is_approved
        } for app in applications]

        return jsonify({"applications": data, "total": len(data)}), 200


# -------------------- Candidate Listing Routes -------------------- #

@candidate_bp.route("/election/<election_id>", methods=["GET"])
def get_candidates_by_election(election_id):
    """Get all candidates for a specific election."""
    with get_session() as session:
        election = session.query(Election).filter(Election.id == election_id).first()
        if not election:
            return jsonify({"error": "Election not found"}), 404

        candidates = session.query(Candidate).options(
            joinedload(Candidate.student).joinedload(Student.user),
            joinedload(Candidate.position)
        ).filter(Candidate.election_id == election_id).all()

        data = [{
            "id": c.id,
            "student": {
                "id": c.student.id,
                "user": {
                    "first_name": c.student.user.first_name,
                    "last_name": c.student.user.last_name,
                    "email": c.student.user.email
                },
                "department": {
                    "id": c.student.department.id,
                    "name": c.student.department.name
                } if c.student.department else None
            },
            "position": {"id": c.position.id, "name": c.position.name},
            "platform_statement": c.platform_statement,
            "photo_url": c.photo_url,
            "is_approved": c.is_approved
        } for c in candidates]

        return jsonify({
            "election": {
                "id": election.id,
                "title": election.title,
                "status": election.status
            },
            "candidates": data,
            "total": len(data)
        }), 200


# -------------------- Admin Routes -------------------- #

@candidate_bp.route("/admin/pending", methods=["GET"])
def get_pending_applications():
    """Get all pending candidate applications (admin only)."""
    with get_session() as session:
        pending = session.query(Candidate).options(
            joinedload(Candidate.student).joinedload(Student.user),
            joinedload(Candidate.student).joinedload(Student.department),
            joinedload(Candidate.position).joinedload(Position.election)
        ).filter(Candidate.is_approved == False).all()

        data = [{
            "id": app.id,
            "student": {
                "id": app.student.id,
                "user": {
                    "first_name": app.student.user.first_name,
                    "last_name": app.student.user.last_name,
                    "email": app.student.user.email
                }
            },
            "position": {"id": app.position.id, "name": app.position.name},
            "election": {"id": app.election.id, "title": app.election.title},
            "platform_statement": app.platform_statement,
            "photo_url": app.photo_url
        } for app in pending]

        return jsonify({"pending_applications": data, "total": len(data)}), 200


@candidate_bp.route("/admin/<candidate_id>/approve", methods=["POST"])
def approve_candidate(candidate_id):
    """Approve a candidate application (admin only)."""
    with get_session() as session:
        candidate = session.query(Candidate).filter(Candidate.id == candidate_id).first()
        if not candidate:
            return jsonify({"error": "Candidate not found"}), 404

        if candidate.is_approved:
            return jsonify({"error": "Already approved"}), 400

        candidate.is_approved = True
        return jsonify({"message": "Candidate approved"}), 200


@candidate_bp.route("/admin/<candidate_id>/reject", methods=["POST"])
def reject_candidate(candidate_id):
    """Reject a candidate application (admin only)."""
    with get_session() as session:
        candidate = session.query(Candidate).filter(Candidate.id == candidate_id).first()
        if not candidate:
            return jsonify({"error": "Candidate not found"}), 404

        if candidate.is_approved:
            return jsonify({"error": "Cannot reject approved applications"}), 400

        session.delete(candidate)
        return jsonify({"message": "Candidate rejected"}), 200
