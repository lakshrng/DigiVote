from flask import Blueprint, request, jsonify
from sqlalchemy import and_, func
from database import db_session, Election, Position, Candidate, Ballot, VoteSelection, Student
from datetime import datetime
import uuid

voting_bp = Blueprint('voting', __name__)

# Get active elections for voting
@voting_bp.route('/elections/active', methods=['GET'])
def get_active_elections():
    """Get all active elections that are currently open for voting"""
    try:
        now = datetime.utcnow()
        elections = db_session.query(Election).filter(
            and_(
                Election.status == 'ACTIVE',
                Election.start_time <= now,
                Election.end_time >= now
            )
        ).all()
        
        result = []
        for election in elections:
            result.append({
                'id': str(election.id),
                'title': election.title,
                'description': election.description,
                'election_year': election.election_year,
                'start_time': election.start_time.isoformat(),
                'end_time': election.end_time.isoformat(),
                'is_anonymous_tally': election.is_anonymous_tally
            })
        
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# Get election details with positions and candidates
@voting_bp.route('/elections/<election_id>/ballot', methods=['GET'])
def get_election_ballot(election_id):
    """Get complete ballot information for an election"""
    try:
        # Verify election exists and is active
        election = db_session.query(Election).filter_by(id=uuid.UUID(election_id)).first()
        if not election:
            return jsonify({'error': 'Election not found'}), 404
        
        now = datetime.utcnow()
        if election.status != 'ACTIVE' or election.start_time > now or election.end_time < now:
            return jsonify({'error': 'Election is not currently active'}), 400
        
        # Get all positions for this election
        positions = db_session.query(Position).filter_by(election_id=uuid.UUID(election_id)).all()
        
        ballot = {
            'election': {
                'id': str(election.id),
                'title': election.title,
                'description': election.description,
                'end_time': election.end_time.isoformat()
            },
            'positions': []
        }
        
        for position in positions:
            # Get approved candidates for this position
            candidates = db_session.query(Candidate).filter(
                and_(
                    Candidate.position_id == position.id,
                    Candidate.is_approved == True
                )
            ).all()
            
            position_data = {
                'id': str(position.id),
                'name': position.name,
                'candidates': []
            }
            
            for candidate in candidates:
                # Get student details
                student = db_session.query(Student).filter_by(id=candidate.student_id).first()
                if student and student.user:
                    position_data['candidates'].append({
                        'id': str(candidate.id),
                        'name': f"{student.user.first_name} {student.user.last_name}",
                        'platform_statement': candidate.platform_statement,
                        'photo_url': candidate.photo_url,
                        'year_of_study': student.year_of_study
                    })
            
            ballot['positions'].append(position_data)
        
        return jsonify(ballot), 200
    except ValueError:
        return jsonify({'error': 'Invalid election ID format'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# Check if student has already voted
@voting_bp.route('/elections/<election_id>/voted/<student_id>', methods=['GET'])
def check_voted_status(election_id, student_id):
    """Check if a student has already voted in an election"""
    try:
        ballot = db_session.query(Ballot).filter(
            and_(
                Ballot.election_id == uuid.UUID(election_id),
                Ballot.student_id == uuid.UUID(student_id)
            )
        ).first()
        
        return jsonify({
            'has_voted': ballot is not None,
            'voted_at': ballot.submitted_at.isoformat() if ballot else None
        }), 200
    except ValueError:
        return jsonify({'error': 'Invalid ID format'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# Submit vote
@voting_bp.route('/vote', methods=['POST'])
def submit_vote():
    """Submit a student's vote for an election"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['election_id', 'student_id', 'votes']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
        
        election_id = uuid.UUID(data['election_id'])
        student_id = uuid.UUID(data['student_id'])
        votes = data['votes']  # List of {position_id, candidate_id}
        
        # Verify election is active
        election = db_session.query(Election).filter_by(id=election_id).first()
        if not election:
            return jsonify({'error': 'Election not found'}), 404
        
        now = datetime.utcnow()
        if election.status != 'ACTIVE' or election.start_time > now or election.end_time < now:
            return jsonify({'error': 'Voting window is closed'}), 400
        
        # Check if student has already voted
        existing_ballot = db_session.query(Ballot).filter(
            and_(
                Ballot.election_id == election_id,
                Ballot.student_id == student_id
            )
        ).first()
        
        if existing_ballot:
            return jsonify({'error': 'You have already voted in this election'}), 400
        
        # Verify student exists
        student = db_session.query(Student).filter_by(id=student_id).first()
        if not student:
            return jsonify({'error': 'Student not found'}), 404
        
        # Create ballot
        ballot = Ballot(
            election_id=election_id,
            student_id=student_id,
            ip_address=request.remote_addr
        )
        db_session.add(ballot)
        db_session.flush()  # Get ballot ID
        
        # Create vote selections
        for vote in votes:
            position_id = uuid.UUID(vote['position_id'])
            candidate_id = uuid.UUID(vote['candidate_id']) if vote.get('candidate_id') else None
            
            # Verify position belongs to this election
            position = db_session.query(Position).filter_by(
                id=position_id,
                election_id=election_id
            ).first()
            
            if not position:
                db_session.rollback()
                return jsonify({'error': f'Invalid position ID: {vote["position_id"]}'}), 400
            
            # If candidate_id provided, verify it's valid
            if candidate_id:
                candidate = db_session.query(Candidate).filter(
                    and_(
                        Candidate.id == candidate_id,
                        Candidate.position_id == position_id,
                        Candidate.is_approved == True
                    )
                ).first()
                
                if not candidate:
                    db_session.rollback()
                    return jsonify({'error': f'Invalid candidate ID: {vote["candidate_id"]}'}), 400
            
            # Create vote selection
            vote_selection = VoteSelection(
                ballot_id=ballot.id,
                position_id=position_id,
                candidate_id=candidate_id
            )
            db_session.add(vote_selection)
        
        # Commit transaction
        db_session.commit()
        
        return jsonify({
            'message': 'Vote submitted successfully',
            'ballot_id': str(ballot.id),
            'submitted_at': ballot.submitted_at.isoformat()
        }), 201
        
    except ValueError as ve:
        db_session.rollback()
        return jsonify({'error': 'Invalid ID format'}), 400
    except Exception as e:
        db_session.rollback()
        return jsonify({'error': str(e)}), 500