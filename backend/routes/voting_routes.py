from flask import Blueprint, jsonify
from database import get_session
from database import Candidate, Student  # import your SQLAlchemy models
from sqlalchemy.orm import joinedload

voting_bp = Blueprint("voting", __name__, url_prefix="/api/voting")

@voting_bp.get("/candidates")
def get_candidates():
    with get_session() as session:
        # Join Candidate → Student → User to get candidate name
        candidates = session.query(Candidate).options(joinedload(Candidate.student).joinedload(Student.user)).all()
        result = [
            {
                "id": candidate.id,
                "name": f"{candidate.student.user.first_name} {candidate.student.user.last_name}",
                "position": candidate.position.name,
                "election": candidate.election.title
            }
            for candidate in candidates
        ]
        return jsonify(result)
