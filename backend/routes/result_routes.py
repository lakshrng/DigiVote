from flask import Blueprint, jsonify
from sqlalchemy.orm import joinedload
from sqlalchemy import and_
import uuid

from database import (
    get_session,
    Election,
    Position,
    Candidate,
    VoteSelection,
    Ballot,
    Student,
    Department
)

result_bp = Blueprint('result', __name__, url_prefix='/api/voting/results')


@result_bp.route('/elections', methods=['GET'])
def get_all_elections_for_results():
    """Get all elections (for results viewing)."""
    with get_session() as session:
        elections = session.query(Election).filter(
            Election.status.in_(["ACTIVE", "COMPLETED", "ARCHIVED"])
        ).all()
        
        elections_data = [
            {
                "id": election.id,
                "title": election.title,
                "election_year": election.election_year,
                "status": election.status,
                "start_time": election.start_time.isoformat() if election.start_time else None,
                "end_time": election.end_time.isoformat() if election.end_time else None
            }
            for election in elections
        ]
        
        return jsonify({
            "elections": elections_data,
            "total": len(elections_data)
        }), 200


@result_bp.route('/<election_id>', methods=['GET'])
def get_election_results(election_id):
    """Get complete results for an election, grouped by position."""
    # Validate UUID format
    try:
        uuid.UUID(election_id)
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid election_id format (must be UUID)"}), 400
    
    with get_session() as session:
        # Check if election exists
        election = session.query(Election).options(
            joinedload(Election.positions)
        ).filter(Election.id == election_id).first()
        
        if not election:
            return jsonify({"error": "Election not found"}), 404
        
        # Get total ballots cast
        total_ballots = session.query(Ballot).filter(
            Ballot.election_id == election_id
        ).count()
        
        # Get all positions for this election
        positions = session.query(Position).filter(
            Position.election_id == election_id
        ).all()
        
        results_by_position = []
        
        for position in positions:
            # Get all vote selections for this position
            vote_selections = session.query(VoteSelection).filter(
                VoteSelection.position_id == position.id
            ).join(Ballot).filter(
                Ballot.election_id == election_id
            ).all()
            
            # Count votes per candidate
            candidate_vote_counts = {}
            none_of_the_above_count = 0
            
            for vote_selection in vote_selections:
                if vote_selection.candidate_id:
                    candidate_id = str(vote_selection.candidate_id)
                    candidate_vote_counts[candidate_id] = candidate_vote_counts.get(candidate_id, 0) + 1
                else:
                    none_of_the_above_count += 1
            
            # Get all approved candidates for this position (including those with 0 votes)
            all_candidates = session.query(Candidate).options(
                joinedload(Candidate.student).joinedload(Student.user),
                joinedload(Candidate.student).joinedload(Student.department)
            ).filter(
                and_(
                    Candidate.position_id == position.id,
                    Candidate.election_id == election_id,
                    Candidate.is_approved == True
                )
            ).all()
            
            # Build candidates data with vote counts
            candidates_data = []
            for candidate in all_candidates:
                candidate_id = str(candidate.id)
                vote_count = candidate_vote_counts.get(candidate_id, 0)
                candidates_data.append({
                    "candidate_id": candidate.id,
                    "candidate_name": f"{candidate.student.user.first_name} {candidate.student.user.last_name}",
                    "department": candidate.student.department.name if candidate.student.department else None,
                    "year_of_study": candidate.student.year_of_study,
                    "platform_statement": candidate.platform_statement,
                    "photo_url": candidate.photo_url,
                    "vote_count": vote_count
                })
            
            # Sort candidates by vote count (descending)
            candidates_data.sort(key=lambda x: x['vote_count'], reverse=True)
            
            total_votes_for_position = len(vote_selections)
            
            results_by_position.append({
                "position_id": position.id,
                "position_name": position.name,
                "candidates": candidates_data,
                "none_of_the_above_votes": none_of_the_above_count,
                "total_votes": total_votes_for_position
            })
        
        return jsonify({
            "election": {
                "id": election.id,
                "title": election.title,
                "election_year": election.election_year,
                "status": election.status,
                "start_time": election.start_time.isoformat() if election.start_time else None,
                "end_time": election.end_time.isoformat() if election.end_time else None
            },
            "total_ballots_cast": total_ballots,
            "results": results_by_position
        }), 200


@result_bp.route('/<election_id>/position/<position_id>', methods=['GET'])
def get_position_results(election_id, position_id):
    """Get results for a specific position in an election."""
    # Validate UUID formats
    try:
        uuid.UUID(election_id)
        uuid.UUID(position_id)
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid election_id or position_id format (must be UUID)"}), 400
    
    with get_session() as session:
        # Check if election exists
        election = session.query(Election).filter(Election.id == election_id).first()
        if not election:
            return jsonify({"error": "Election not found"}), 404
        
        # Check if position exists and belongs to the election
        position = session.query(Position).filter(
            and_(
                Position.id == position_id,
                Position.election_id == election_id
            )
        ).first()
        
        if not position:
            return jsonify({"error": "Position not found or doesn't belong to this election"}), 404
        
        # Get all vote selections for this position in this election
        vote_selections = session.query(VoteSelection).filter(
            VoteSelection.position_id == position_id
        ).join(Ballot).filter(
            Ballot.election_id == election_id
        ).all()
        
        # Count votes per candidate
        candidate_vote_counts = {}
        none_of_the_above_count = 0
        
        for vote_selection in vote_selections:
            if vote_selection.candidate_id:
                candidate_id = str(vote_selection.candidate_id)
                candidate_vote_counts[candidate_id] = candidate_vote_counts.get(candidate_id, 0) + 1
            else:
                none_of_the_above_count += 1
        
        # Get all approved candidates for this position (including those with 0 votes)
        all_candidates = session.query(Candidate).options(
            joinedload(Candidate.student).joinedload(Student.user),
            joinedload(Candidate.student).joinedload(Student.department)
        ).filter(
            and_(
                Candidate.position_id == position_id,
                Candidate.election_id == election_id,
                Candidate.is_approved == True
            )
        ).all()
        
        # Build candidates data with vote counts
        candidates_data = []
        for candidate in all_candidates:
            candidate_id = str(candidate.id)
            vote_count = candidate_vote_counts.get(candidate_id, 0)
            candidates_data.append({
                "candidate_id": candidate.id,
                "candidate_name": f"{candidate.student.user.first_name} {candidate.student.user.last_name}",
                "department": candidate.student.department.name if candidate.student.department else None,
                "year_of_study": candidate.student.year_of_study,
                "platform_statement": candidate.platform_statement,
                "photo_url": candidate.photo_url,
                "vote_count": vote_count
            })
        
        # Sort candidates by vote count (descending)
        candidates_data.sort(key=lambda x: x['vote_count'], reverse=True)
        
        total_votes = len(vote_selections)
        
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
            "candidates": candidates_data,
            "none_of_the_above_votes": none_of_the_above_count,
            "total_votes": total_votes
        }), 200
