from flask import Blueprint, jsonify, request
from datetime import datetime
import uuid
from database import (
    get_session, 
    Ballot, 
    VoteSelection, 
    Student, 
    User, 
    Election, 
    Position, 
    Candidate
)
from sqlalchemy.orm import joinedload
from sqlalchemy import and_, or_

voting_bp = Blueprint("voting", __name__, url_prefix="/api/voting")


@voting_bp.route("/submit", methods=["POST"])
def submit_vote():
    """Submit votes for an election."""
    data = request.get_json() or {}
    
    election_id = data.get('election_id')
    student_id = data.get('student_id')
    user_id = data.get('user_id')  # Also accept user_id as fallback
    votes_data = data.get('votes', {})  # Can be dict or array
    
    # Validation
    if not election_id:
        return jsonify({"error": "election_id is required"}), 400
    
    # If student_id not provided but user_id is, look up student_id
    if not student_id and user_id:
        with get_session() as db_session:
            student = db_session.query(Student).filter(Student.user_id == user_id).first()
            if not student:
                return jsonify({"error": "Student profile not found for this user"}), 404
            student_id = student.id
    
    if not student_id:
        return jsonify({"error": "student_id or user_id is required"}), 400
    
    # Handle both array and dict formats
    if isinstance(votes_data, list):
        # Convert array format [{position_id, candidate_id}, ...] to dict
        votes = {}
        for vote_item in votes_data:
            if isinstance(vote_item, dict):
                pos_id = vote_item.get('position_id')
                cand_id = vote_item.get('candidate_id')
                if pos_id:
                    votes[pos_id] = cand_id
    elif isinstance(votes_data, dict):
        # Already in dict format {position_id: candidate_id}
        votes = votes_data
    else:
        return jsonify({"error": "votes must be either an object {position_id: candidate_id} or an array [{position_id, candidate_id}]"}), 400
    
    if not votes:
        return jsonify({"error": "votes cannot be empty"}), 400

    # Normalize keys/values: accept int or UUID position/candidate ids
    normalized_votes = {}
    for pos_key, cand_val in votes.items():
        # Parse position id to int or uuid.UUID if possible, then store as string key
        parsed_pos = None
        if isinstance(pos_key, int):
            parsed_pos = pos_key
        else:
            try:
                parsed_pos = int(pos_key)
            except (ValueError, TypeError):
                try:
                    parsed_pos = uuid.UUID(str(pos_key))
                except (ValueError, TypeError):
                    parsed_pos = str(pos_key)

        pos_key_str = str(parsed_pos)

        # Normalize candidate id similarly (None allowed). Keep parsed type for DB queries.
        if cand_val in (None, "", "null"):
            cand_id_parsed = None
        else:
            if isinstance(cand_val, int):
                cand_id_parsed = cand_val
            else:
                try:
                    cand_id_parsed = int(cand_val)
                except (ValueError, TypeError):
                    try:
                        cand_id_parsed = uuid.UUID(str(cand_val))
                    except (ValueError, TypeError):
                        cand_id_parsed = str(cand_val)

        normalized_votes[pos_key_str] = cand_id_parsed

    votes = normalized_votes
    
    with get_session() as db_session:
        # Check if student exists
        student = db_session.query(Student).filter(Student.id == student_id).first()
        if not student:
            return jsonify({"error": "Student not found"}), 404
        
        # Check if student's user is verified
        user = db_session.query(User).filter(User.id == student.user_id).first()
        if not user or not user.is_verified:
            return jsonify({"error": "Student account must be verified to vote"}), 403
        
        # Check if election exists
        election = db_session.query(Election).options(
            joinedload(Election.positions)
        ).filter(Election.id == election_id).first()
        
        if not election:
            return jsonify({"error": "Election not found"}), 404
        
        # Check if election is active (or upcoming for testing)
        if election.status not in ["ACTIVE", "UPCOMING"]:
            return jsonify({"error": f"Voting is only allowed for active elections. Current status: {election.status}"}), 400
        
        # Check if student has already voted in this election
        existing_ballot = db_session.query(Ballot).filter(
            and_(Ballot.election_id == election_id, Ballot.student_id == student_id)
        ).first()
        
        if existing_ballot:
            return jsonify({"error": "You have already voted in this election"}), 409
        
        # Get all positions for this election (use string keys to match normalized votes)
        election_positions = {str(pos.id): pos for pos in election.positions}
        
        if not election_positions:
            return jsonify({"error": "This election has no positions"}), 400
        
        # By default allow partial ballots (clients may only display a subset of positions).
        # If the client requires enforcing votes for all positions, send "require_full": true in the request JSON.
        require_full = data.get("require_full", False)
        if require_full:
            missing_positions = set(election_positions.keys()) - set(votes.keys())
            if missing_positions:
                missing_names = [election_positions[pos_id].name for pos_id in missing_positions]
                return jsonify({
                    "error": f"Please vote for all positions. Missing votes for: {', '.join(missing_names)}"
                }), 400
        
        # Validate that no extra positions are provided
        extra_positions = set(votes.keys()) - set(election_positions.keys())
        if extra_positions:
            return jsonify({"error": "Invalid position(s) provided"}), 400
        
        # Validate candidates and create vote selections
        vote_selections = []
        for position_key, candidate_id in votes.items():
            # position_key is a string; lookup the Position object
            position = election_positions[position_key]
            
            # Validate candidate (if provided)
            if candidate_id:
                # candidate_id may be int, uuid.UUID or string; ensure uuid strings are converted
                parsed_candidate_id = candidate_id
                if isinstance(candidate_id, str):
                    try:
                        parsed_candidate_id = uuid.UUID(candidate_id)
                    except (ValueError, TypeError):
                        try:
                            parsed_candidate_id = int(candidate_id)
                        except (ValueError, TypeError):
                            parsed_candidate_id = candidate_id

                candidate = db_session.query(Candidate).filter(
                    and_(
                        Candidate.id == parsed_candidate_id,
                        Candidate.position_id == position.id,
                        Candidate.election_id == election_id,
                        Candidate.is_approved == True
                    )
                ).first()
                
                if not candidate:
                    return jsonify({"error": f"Invalid candidate for position {position.name}"}), 400
            
            # Create vote selection (will be added after ballot is created)
            vote_selections.append({
                "position_id": position.id,
                "candidate_id": candidate_id
            })
        
        # Get IP address from request
        ip_address = request.remote_addr
        if request.headers.get('X-Forwarded-For'):
            ip_address = request.headers.get('X-Forwarded-For').split(',')[0].strip()
        
        # Create ballot
        ballot = Ballot(
            election_id=election_id,
            student_id=student_id,
            submitted_at=datetime.utcnow(),
            ip_address=ip_address
        )
        
        db_session.add(ballot)
        db_session.flush()  # Get the ballot ID without committing
        
        # Create vote selections
        for vote_data in vote_selections:
            vote_selection = VoteSelection(
                ballot_id=ballot.id,
                position_id=vote_data["position_id"],
                candidate_id=vote_data["candidate_id"]
            )
            db_session.add(vote_selection)
        
        # Return success response
        return jsonify({
            "message": "Vote submitted successfully",
            "ballot_id": ballot.id,
            "election_id": election_id,
            "submitted_at": ballot.submitted_at.isoformat(),
            "votes_count": len(vote_selections)
        }), 201


@voting_bp.route("/status/<student_id>/<election_id>", methods=["GET"])
def get_voting_status(student_id, election_id):
    """Check if a student has already voted in an election."""
    with get_session() as db_session:
        # Check if student exists
        student = db_session.query(Student).filter(Student.id == student_id).first()
        if not student:
            return jsonify({"error": "Student not found"}), 404
        
        # Check if election exists
        election = db_session.query(Election).filter(Election.id == election_id).first()
        if not election:
            return jsonify({"error": "Election not found"}), 404
        
        # Check if student has voted
        ballot = db_session.query(Ballot).filter(
            and_(Ballot.election_id == election_id, Ballot.student_id == student_id)
        ).first()
        
        if ballot:
            # Get vote selections
            vote_selections = db_session.query(VoteSelection).filter(
                VoteSelection.ballot_id == ballot.id
            ).all()
            
            return jsonify({
                "has_voted": True,
                "ballot_id": ballot.id,
                "submitted_at": ballot.submitted_at.isoformat(),
                "votes_count": len(vote_selections)
            }), 200
        else:
            return jsonify({
                "has_voted": False
            }), 200


@voting_bp.route("/elections/active", methods=["GET"])
def get_active_elections():
    """Get all active elections for voting."""
    with get_session() as db_session:
        elections = db_session.query(Election).filter(
            Election.status == "ACTIVE"
        ).all()
        
        elections_data = [
            {
                "id": election.id,
                "title": election.title,
                "election_year": election.election_year,
                "status": election.status,
                "start_time": election.start_time.isoformat() if election.start_time else None,
                "end_time": election.end_time.isoformat() if election.end_time else None,
            }
            for election in elections
        ]
        
        return jsonify({
            "elections": elections_data,
            "total": len(elections_data)
        })


@voting_bp.route("/elections/upcoming", methods=["GET"])
def get_upcoming_elections():
    """Get all upcoming elections."""
    with get_session() as db_session:
        elections = db_session.query(Election).filter(
            Election.status == "UPCOMING"
        ).all()
        
        elections_data = [
            {
                "id": election.id,
                "title": election.title,
                "election_year": election.election_year,
                "status": election.status,
                "start_time": election.start_time.isoformat() if election.start_time else None,
                "end_time": election.end_time.isoformat() if election.end_time else None,
            }
            for election in elections
        ]
        
        return jsonify({
            "elections": elections_data,
            "total": len(elections_data)
        })
