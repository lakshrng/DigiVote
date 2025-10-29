from flask import Blueprint, request, jsonify
from sqlalchemy import and_, func
from database import db_session, Election, Position, Candidate, Ballot, VoteSelection, Student
from datetime import datetime
import uuid

results_bp = Blueprint('results', __name__)

# Get election results (admin or after election ends)
@results_bp.route('/elections/<election_id>/results', methods=['GET'])
def get_election_results(election_id):
    """Get results for an election (only if election ended or user is admin)"""
    try:
        # Get election
        election = db_session.query(Election).filter_by(id=uuid.UUID(election_id)).first()
        if not election:
            return jsonify({'error': 'Election not found'}), 404
        
        # Check if election has ended (for students) or allow admins anytime
        is_admin = request.args.get('is_admin', 'false').lower() == 'true'
        now = datetime.utcnow()
        
        if not is_admin and (election.status == 'ACTIVE' and election.end_time > now):
            return jsonify({'error': 'Results not available yet. Election is still active.'}), 403
        
        # Get all positions
        positions = db_session.query(Position).filter_by(election_id=uuid.UUID(election_id)).all()
        
        results = {
            
            'election': {
                'id': str(election.id),
                'title': election.title,
                'election_year': election.election_year,
                'status': election.status,
                'start_time': election.start_time.isoformat(),
                'end_time': election.end_time.isoformat(),
                'is_anonymous_tally': election.is_anonymous_tally
            },
            'total_voters': db_session.query(Ballot).filter_by(election_id=uuid.UUID(election_id)).count(),
            'positions': []
        }
        
        for position in positions:
            # Get vote counts for each candidate
            vote_counts = db_session.query(
                Candidate.id,
                func.count(VoteSelection.id).label('vote_count')
            ).outerjoin(
                VoteSelection,
                and_(
                    VoteSelection.candidate_id == Candidate.id,
                    VoteSelection.position_id == position.id
                )
            ).filter(
                Candidate.position_id == position.id,
                Candidate.is_approved == True
            ).group_by(Candidate.id).all()
            
            # Count "None of the Above" votes
            nota_count = db_session.query(func.count(VoteSelection.id)).filter(
                and_(
                    VoteSelection.position_id == position.id,
                    VoteSelection.candidate_id == None
                )
            ).scalar() or 0
            
            position_results = {
                'id': str(position.id),
                'name': position.name,
                'candidates': [],
                'nota_votes': nota_count,
                'total_votes': 0
            }
            
            total_votes = nota_count
            winner_id = None
            max_votes = nota_count
            
            for candidate_id, vote_count in vote_counts:
                candidate = db_session.query(Candidate).filter_by(id=candidate_id).first()
                student = db_session.query(Student).filter_by(id=candidate.student_id).first()
                
                if student and student.user:
                    candidate_data = {
                        'id': str(candidate.id),
                        'name': f"{student.user.first_name} {student.user.last_name}",
                        'vote_count': vote_count,
                        'photo_url': candidate.photo_url,
                        'is_winner': False
                    }
                    
                    total_votes += vote_count
                    if vote_count > max_votes:
                        max_votes = vote_count
                        winner_id = str(candidate.id)
                    
                    position_results['candidates'].append(candidate_data)
            
            # Mark winner
            if winner_id:
                for candidate in position_results['candidates']:
                    if candidate['id'] == winner_id:
                        candidate['is_winner'] = True
            
            # Sort candidates by vote count (descending)
            position_results['candidates'].sort(key=lambda x: x['vote_count'], reverse=True)
            position_results['total_votes'] = total_votes
            
            results['positions'].append(position_results)
        
        return jsonify(results), 200
        
    except ValueError:
        return jsonify({'error': 'Invalid election ID format'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# Get list of completed elections
@results_bp.route('/elections/completed', methods=['GET'])
def get_completed_elections():
    """Get all completed elections"""
    try:
        elections = db_session.query(Election).filter(
            Election.status.in_(['COMPLETED', 'ARCHIVED'])
        ).order_by(Election.end_time.desc()).all()
        
        result = []
        for election in elections:
            total_voters = db_session.query(Ballot).filter_by(election_id=election.id).count()
            result.append({
                'id': str(election.id),
                'title': election.title,
                'election_year': election.election_year,
                'status': election.status,
                'end_time': election.end_time.isoformat(),
                'total_voters': total_voters
            })
        
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# Publish results (Admin only - changes election status)
@results_bp.route('/elections/<election_id>/publish', methods=['POST'])
def publish_results(election_id):
    """Publish election results (admin only)"""
    try:
        election = db_session.query(Election).filter_by(id=uuid.UUID(election_id)).first()
        if not election:
            return jsonify({'error': 'Election not found'}), 404
        
        # Check if election has ended
        now = datetime.utcnow()
        if election.end_time > now:
            return jsonify({'error': 'Cannot publish results before election ends'}), 400
        
        # Update election status
        election.status = 'COMPLETED'
        election.updated_at = datetime.utcnow()
        db_session.commit()
        
        return jsonify({
            'message': 'Results published successfully',
            'election_id': str(election.id),
            'status': election.status.value
        }), 200
        
    except ValueError:
        return jsonify({'error': 'Invalid election ID format'}), 400
    except Exception as e:
        db_session.rollback()
        return jsonify({'error': str(e)}), 500