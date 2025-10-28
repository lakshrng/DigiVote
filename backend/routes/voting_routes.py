from flask import Blueprint, request, jsonify
from datetime import datetime
from database import get_session, Ballot, VoteSelection, Candidate, Student, User, Election, Position, Department
from sqlalchemy.orm import joinedload
from sqlalchemy import and_, or_, func

voting_bp = Blueprint('voting', __name__, url_prefix='/api/voting')

@voting_bp.route('/submit', methods=['POST'])
def submit_vote():
    """Submit votes for an election."""
    data = request.get_json() or {}
    
    student_id = data.get('student_id')
    election_id = data.get('election_id')
    votes = data.get('votes', [])  # Array of {position_id: str, candidate_id: str | null}
    ip_address = request.remote_addr
    
    # Validation
    if not all([student_id, election_id]):
        return jsonify({"error": "student_id and election_id are required"}), 400
    
    if not isinstance(votes, list) or len(votes) == 0:
        return jsonify({"error": "votes array is required and cannot be empty"}), 400
    
    with get_session() as session:
        # Check if student exists and is verified
        student = session.query(Student).filter(Student.id == student_id).first()
        if not student:
            return jsonify({"error": "Student not found"}), 404
        
        user = session.query(User).filter(User.id == student.user_id).first()
        if not user or not user.is_verified:
            return jsonify({"error": "Student account not verified"}), 403
        
        # Check if election exists and is ACTIVE
        election = session.query(Election).filter(Election.id == election_id).first()
        if not election:
            return jsonify({"error": "Election not found"}), 404
        
        if election.status != "ACTIVE":
            return jsonify({"error": "Voting is only allowed during active elections"}), 400
        
        # Check if election is within voting time
        now = datetime.utcnow()
        if now < election.start_time or now > election.end_time:
            return jsonify({"error": "Voting is not allowed at this time"}), 400
        
        # Check if student has already voted in this election
        existing_ballot = session.query(Ballot).filter(
            and_(Ballot.student_id == student_id, Ballot.election_id == election_id)
        ).first()
        if existing_ballot:
            return jsonify({"error": "You have already voted in this election"}), 409
        
        # Validate all positions belong to this election and get approved candidates
        position_ids = [vote.get('position_id') for vote in votes if vote.get('position_id')]
        positions = session.query(Position).filter(
            and_(Position.id.in_(position_ids), Position.election_id == election_id)
        ).all()
        
        if len(positions) != len(set(position_ids)):
            return jsonify({"error": "One or more positions do not belong to this election"}), 400
        
        # Get all approved candidates for this election
        approved_candidates = session.query(Candidate).filter(
            and_(Candidate.election_id == election_id, Candidate.is_approved == True)
        ).all()
        candidate_ids = {c.id for c in approved_candidates}
        
        # Validate votes
        for vote in votes:
            position_id = vote.get('position_id')
            candidate_id = vote.get('candidate_id')
            
            # Check if position exists in our validated positions
            if not any(p.id == position_id for p in positions):
                return jsonify({"error": f"Invalid position_id: {position_id}"}), 400
            
            # If candidate_id is provided, validate it's an approved candidate for this position
            if candidate_id is not None:
                if candidate_id not in candidate_ids:
                    return jsonify({"error": f"Invalid candidate_id: {candidate_id}"}), 400
                
                # Check if candidate is running for this specific position
                candidate = next((c for c in approved_candidates if c.id == candidate_id), None)
                if not candidate or candidate.position_id != position_id:
                    return jsonify({"error": f"Candidate {candidate_id} is not running for position {position_id}"}), 400
        
        # Create ballot
        ballot = Ballot(
            election_id=election_id,
            student_id=student_id,
            ip_address=ip_address
        )
        session.add(ballot)
        session.flush()  # Get ballot ID
        
        # Create vote selections
        vote_selections = []
        for vote in votes:
            vote_selection = VoteSelection(
                ballot_id=ballot.id,
                position_id=vote['position_id'],
                candidate_id=vote.get('candidate_id')  # Can be None for "None of the Above"
            )
            vote_selections.append(vote_selection)
            session.add(vote_selection)
        
        return jsonify({
            "message": "Vote submitted successfully",
            "ballot_id": ballot.id,
            "submitted_at": ballot.submitted_at.isoformat(),
            "votes_cast": len(vote_selections)
        }), 201


@voting_bp.route('/status/<student_id>/<election_id>', methods=['GET'])
def get_voting_status(student_id, election_id):
    """Check if a student has voted in a specific election."""
    with get_session() as session:
        # Check if student exists
        student = session.query(Student).filter(Student.id == student_id).first()
        if not student:
            return jsonify({"error": "Student not found"}), 404
        
        # Check if election exists
        election = session.query(Election).filter(Election.id == election_id).first()
        if not election:
            return jsonify({"error": "Election not found"}), 404
        
        # Check if student has voted
        ballot = session.query(Ballot).filter(
            and_(Ballot.student_id == student_id, Ballot.election_id == election_id)
        ).first()
        
        has_voted = ballot is not None
        
        return jsonify({
            "student_id": student_id,
            "election_id": election_id,
            "has_voted": has_voted,
            "voted_at": ballot.submitted_at.isoformat() if ballot else None,
            "election_status": election.status,
            "can_vote": election.status == "ACTIVE" and not has_voted
        }), 200


@voting_bp.route('/results/<election_id>', methods=['GET'])
def get_election_results(election_id):
    """Get election results (admin only - requires authentication in production)."""
    with get_session() as session:
        # Check if election exists
        election = session.query(Election).filter(Election.id == election_id).first()
        if not election:
            return jsonify({"error": "Election not found"}), 404
        
        # Get all positions for this election
        positions = session.query(Position).filter(Position.election_id == election_id).all()
        
        results = []
        for position in positions:
            # Get all approved candidates for this position
            candidates = session.query(Candidate).options(
                joinedload(Candidate.student).joinedload(Student.user),
                joinedload(Candidate.student).joinedload(Student.department)
            ).filter(
                and_(Candidate.position_id == position.id, Candidate.is_approved == True)
            ).all()
            
            # Count votes for each candidate
            candidate_results = []
            for candidate in candidates:
                vote_count = session.query(VoteSelection).filter(
                    and_(
                        VoteSelection.position_id == position.id,
                        VoteSelection.candidate_id == candidate.id
                    )
                ).count()
                
                candidate_results.append({
                    "candidate_id": candidate.id,
                    "candidate_name": f"{candidate.student.user.first_name} {candidate.student.user.last_name}",
                    "department": candidate.student.department.name if candidate.student.department else None,
                    "year_of_study": candidate.student.year_of_study,
                    "platform_statement": candidate.platform_statement,
                    "photo_url": candidate.photo_url,
                    "vote_count": vote_count
                })
            
            # Count "None of the Above" votes
            none_votes = session.query(VoteSelection).filter(
                and_(
                    VoteSelection.position_id == position.id,
                    VoteSelection.candidate_id.is_(None)
                )
            ).count()
            
            # Sort candidates by vote count (descending)
            candidate_results.sort(key=lambda x: x['vote_count'], reverse=True)
            
            results.append({
                "position_id": position.id,
                "position_name": position.name,
                "candidates": candidate_results,
                "none_of_the_above_votes": none_votes,
                "total_votes": sum(c['vote_count'] for c in candidate_results) + none_votes
            })
        
        # Get total ballots cast
        total_ballots = session.query(Ballot).filter(Ballot.election_id == election_id).count()
        
        return jsonify({
            "election": {
                "id": election.id,
                "title": election.title,
                "election_year": election.election_year,
                "status": election.status,
                "start_time": election.start_time.isoformat(),
                "end_time": election.end_time.isoformat()
            },
            "total_ballots_cast": total_ballots,
            "results": results
        }), 200


@voting_bp.route('/results/<election_id>/position/<position_id>', methods=['GET'])
def get_position_results(election_id, position_id):
    """Get results for a specific position in an election."""
    with get_session() as session:
        # Check if election exists
        election = session.query(Election).filter(Election.id == election_id).first()
        if not election:
            return jsonify({"error": "Election not found"}), 404
        
        # Check if position exists and belongs to election
        position = session.query(Position).filter(
            and_(Position.id == position_id, Position.election_id == election_id)
        ).first()
        if not position:
            return jsonify({"error": "Position not found or doesn't belong to this election"}), 404
        
        # Get all approved candidates for this position
        candidates = session.query(Candidate).options(
            joinedload(Candidate.student).joinedload(Student.user),
            joinedload(Candidate.student).joinedload(Student.department)
        ).filter(
            and_(Candidate.position_id == position_id, Candidate.is_approved == True)
        ).all()
        
        # Count votes for each candidate
        candidate_results = []
        for candidate in candidates:
            vote_count = session.query(VoteSelection).filter(
                and_(
                    VoteSelection.position_id == position_id,
                    VoteSelection.candidate_id == candidate.id
                )
            ).count()
            
            candidate_results.append({
                "candidate_id": candidate.id,
                "candidate_name": f"{candidate.student.user.first_name} {candidate.student.user.last_name}",
                "department": candidate.student.department.name if candidate.student.department else None,
                "year_of_study": candidate.student.year_of_study,
                "platform_statement": candidate.platform_statement,
                "photo_url": candidate.photo_url,
                "vote_count": vote_count
            })
        
        # Count "None of the Above" votes
        none_votes = session.query(VoteSelection).filter(
            and_(
                VoteSelection.position_id == position_id,
                VoteSelection.candidate_id.is_(None)
            )
        ).count()
        
        # Sort candidates by vote count (descending)
        candidate_results.sort(key=lambda x: x['vote_count'], reverse=True)
        
        return jsonify({
            "election": {
                "id": election.id,
                "title": election.title,
                "election_year": election.election_year,
                "status": election.status
            },
            "position": {
                "id": position.id,
                "name": position.name
            },
            "candidates": candidate_results,
            "none_of_the_above_votes": none_votes,
            "total_votes": sum(c['vote_count'] for c in candidate_results) + none_votes
        }), 200


@voting_bp.route('/ballots/<election_id>', methods=['GET'])
def get_ballots(election_id):
    """Get all ballots for an election (admin only - requires authentication in production)."""
    with get_session() as session:
        # Check if election exists
        election = session.query(Election).filter(Election.id == election_id).first()
        if not election:
            return jsonify({"error": "Election not found"}), 404
        
        # Get all ballots for this election
        ballots = session.query(Ballot).options(
            joinedload(Ballot.student).joinedload(Student.user)
        ).filter(Ballot.election_id == election_id).all()
        
        ballots_data = []
        for ballot in ballots:
            ballots_data.append({
                "ballot_id": ballot.id,
                "student": {
                    "id": ballot.student.id,
                    "name": f"{ballot.student.user.first_name} {ballot.student.user.last_name}",
                    "email": ballot.student.user.email,
                    "year_of_study": ballot.student.year_of_study,
                    "department": ballot.student.department.name if ballot.student.department else None
                },
                "submitted_at": ballot.submitted_at.isoformat(),
                "ip_address": ballot.ip_address
            })
        
        return jsonify({
            "election": {
                "id": election.id,
                "title": election.title,
                "election_year": election.election_year,
                "status": election.status
            },
            "ballots": ballots_data,
            "total_ballots": len(ballots_data)
        }), 200


@voting_bp.route('/statistics/<election_id>', methods=['GET'])
def get_voting_statistics(election_id):
    """Get voting statistics for an election."""
    with get_session() as session:
        # Check if election exists
        election = session.query(Election).filter(Election.id == election_id).first()
        if not election:
            return jsonify({"error": "Election not found"}), 404
        
        # Get total ballots cast
        total_ballots = session.query(Ballot).filter(Ballot.election_id == election_id).count()
        
        # Get total eligible students (students with verified accounts)
        total_eligible = session.query(Student).join(User).filter(
            and_(Student.id.in_(
                session.query(Ballot.student_id).filter(Ballot.election_id == election_id)
            ), User.is_verified == True)
        ).count()
        
        # Get voting participation by department
        department_stats = session.query(
            Department.name,
            func.count(Ballot.id).label('ballot_count')
        ).join(Student, Department.id == Student.department_id)\
         .join(Ballot, Student.id == Ballot.student_id)\
         .filter(Ballot.election_id == election_id)\
         .group_by(Department.name).all()
        
        # Get voting participation by year of study
        year_stats = session.query(
            Student.year_of_study,
            func.count(Ballot.id).label('ballot_count')
        ).join(Ballot, Student.id == Ballot.student_id)\
         .filter(Ballot.election_id == election_id)\
         .group_by(Student.year_of_study).all()
        
        # Get voting timeline (votes per hour if election is completed)
        timeline_data = []
        if election.status == "COMPLETED":
            # This would require more complex querying based on your needs
            # For now, just return basic stats
            timeline_data = []
        
        return jsonify({
            "election": {
                "id": election.id,
                "title": election.title,
                "election_year": election.election_year,
                "status": election.status,
                "start_time": election.start_time.isoformat(),
                "end_time": election.end_time.isoformat()
            },
            "participation": {
                "total_ballots_cast": total_ballots,
                "total_eligible_students": total_eligible,
                "participation_rate": (total_ballots / total_eligible * 100) if total_eligible > 0 else 0
            },
            "by_department": [
                {"department": dept, "ballot_count": count} 
                for dept, count in department_stats
            ],
            "by_year": [
                {"year_of_study": year, "ballot_count": count} 
                for year, count in year_stats
            ],
            "timeline": timeline_data
        }), 200


@voting_bp.route('/elections/active', methods=['GET'])
def get_active_elections():
    """Get all currently active elections."""
    with get_session() as session:
        now = datetime.utcnow()
        active_elections = session.query(Election).filter(
            and_(
                Election.status == "ACTIVE",
                Election.start_time <= now,
                Election.end_time >= now
            )
        ).all()
        
        elections_data = []
        for election in active_elections:
            # Get positions for this election
            positions = session.query(Position).filter(Position.election_id == election.id).all()
            
            elections_data.append({
                "id": election.id,
                "title": election.title,
                "election_year": election.election_year,
                "description": election.description,
                "start_time": election.start_time.isoformat(),
                "end_time": election.end_time.isoformat(),
                "is_anonymous_tally": election.is_anonymous_tally,
                "positions": [
                    {
                        "id": pos.id,
                        "name": pos.name
                    } for pos in positions
                ]
            })
        
        return jsonify({
            "active_elections": elections_data,
            "total": len(elections_data)
        }), 200


@voting_bp.route('/elections/upcoming', methods=['GET'])
def get_upcoming_elections():
    """Get all upcoming elections."""
    with get_session() as session:
        now = datetime.utcnow()
        upcoming_elections = session.query(Election).filter(
            and_(
                Election.status == "UPCOMING",
                Election.start_time > now
            )
        ).all()
        
        elections_data = []
        for election in upcoming_elections:
            # Get positions for this election
            positions = session.query(Position).filter(Position.election_id == election.id).all()
            
            elections_data.append({
                "id": election.id,
                "title": election.title,
                "election_year": election.election_year,
                "description": election.description,
                "start_time": election.start_time.isoformat(),
                "end_time": election.end_time.isoformat(),
                "is_anonymous_tally": election.is_anonymous_tally,
                "positions": [
                    {
                        "id": pos.id,
                        "name": pos.name
                    } for pos in positions
                ]
            })
        
        return jsonify({
            "upcoming_elections": elections_data,
            "total": len(elections_data)
        }), 200
