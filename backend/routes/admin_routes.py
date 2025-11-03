from flask import Blueprint, request, jsonify
from datetime import datetime
import uuid
from sqlalchemy.orm import joinedload
from sqlalchemy import and_

from database import (
    get_session,
    Election,
    Position,
    Candidate,
    Student,
    User,
    Department,
    ELECTION_STATUS_UPCOMING,
    ELECTION_STATUS_ACTIVE,
    ELECTION_STATUS_COMPLETED,
    ELECTION_STATUS_ARCHIVED,
)

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')


def require_admin(f):
    """Decorator to require admin privileges for a route."""
    from functools import wraps
    
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get user_id from request (sent from frontend)
        data = request.get_json(silent=True) or {}
        user_id = data.get('user_id') or request.headers.get('X-User-Id')
        
        # Also check query params as fallback
        if not user_id:
            user_id = request.args.get('user_id')
        
        if not user_id:
            return jsonify({"error": "Authentication required. User ID not provided."}), 401
        
        # Validate UUID format
        try:
            uuid.UUID(user_id)
        except (ValueError, TypeError):
            return jsonify({"error": "Invalid user_id format"}), 400
        
        # Check if user exists and is admin
        with get_session() as session:
            user = session.query(User).filter(User.id == user_id).first()
            if not user:
                return jsonify({"error": "User not found"}), 404
            
            if not user.is_admin:
                return jsonify({"error": "Admin privileges required"}), 403
            
            if not user.is_verified:
                return jsonify({"error": "Account must be verified to perform admin actions"}), 403
        
        # Add user to kwargs for use in route handler if needed
        kwargs['admin_user_id'] = user_id
        return f(*args, **kwargs)
    
    return decorated_function


# ============================================================================
# ELECTION MANAGEMENT
# ============================================================================

@admin_bp.route('/elections', methods=['GET'])
@require_admin
def get_all_elections(admin_user_id=None):
    """Get all elections (admin view - all statuses)."""
    with get_session() as session:
        elections = session.query(Election).order_by(Election.start_time.desc()).all()
        
        elections_data = []
        for election in elections:
            # Count positions
            position_count = session.query(Position).filter(
                Position.election_id == election.id
            ).count()
            
            # Count candidates
            candidate_count = session.query(Candidate).filter(
                Candidate.election_id == election.id
            ).count()
            
            # Count approved candidates
            approved_candidate_count = session.query(Candidate).filter(
                and_(
                    Candidate.election_id == election.id,
                    Candidate.is_approved == True
                )
            ).count()
            
            elections_data.append({
                "id": election.id,
                "title": election.title,
                "election_year": election.election_year,
                "description": election.description,
                "status": election.status,
                "start_time": election.start_time.isoformat() if election.start_time else None,
                "end_time": election.end_time.isoformat() if election.end_time else None,
                "is_anonymous_tally": election.is_anonymous_tally,
                "position_count": position_count,
                "candidate_count": candidate_count,
                "approved_candidate_count": approved_candidate_count,
            })
        
        return jsonify({
            "elections": elections_data,
            "total": len(elections_data)
        }), 200


@admin_bp.route('/elections', methods=['POST'])
@require_admin
def create_election(admin_user_id=None):
    """Create a new election."""
    data = request.get_json() or {}
    
    title = (data.get('title') or '').strip()
    election_year = (data.get('election_year') or '').strip()
    description = (data.get('description') or '').strip()
    start_time_str = data.get('start_time')
    end_time_str = data.get('end_time')
    status = (data.get('status') or ELECTION_STATUS_UPCOMING).strip().upper()
    is_anonymous_tally = data.get('is_anonymous_tally', True)
    
    # Validation
    if not title:
        return jsonify({"error": "title is required"}), 400
    
    if not start_time_str or not end_time_str:
        return jsonify({"error": "start_time and end_time are required"}), 400
    
    # Validate status
    valid_statuses = [ELECTION_STATUS_UPCOMING, ELECTION_STATUS_ACTIVE, 
                     ELECTION_STATUS_COMPLETED, ELECTION_STATUS_ARCHIVED]
    if status not in valid_statuses:
        return jsonify({"error": f"status must be one of: {', '.join(valid_statuses)}"}), 400
    
    try:
        start_time = datetime.fromisoformat(start_time_str.replace('Z', '+00:00'))
        end_time = datetime.fromisoformat(end_time_str.replace('Z', '+00:00'))
    except (ValueError, AttributeError) as e:
        return jsonify({"error": f"Invalid date format: {str(e)}"}), 400
    
    if end_time <= start_time:
        return jsonify({"error": "end_time must be after start_time"}), 400
    
    with get_session() as session:
        election = Election(
            title=title,
            election_year=election_year if election_year else None,
            description=description if description else None,
            start_time=start_time,
            end_time=end_time,
            status=status,
            is_anonymous_tally=is_anonymous_tally
        )
        
        session.add(election)
        session.flush()
        
        return jsonify({
            "message": "Election created successfully",
            "election": {
                "id": election.id,
                "title": election.title,
                "election_year": election.election_year,
                "status": election.status,
                "start_time": election.start_time.isoformat(),
                "end_time": election.end_time.isoformat(),
            }
        }), 201


@admin_bp.route('/elections/<election_id>', methods=['PUT'])
@require_admin
def update_election(election_id, admin_user_id=None):
    """Update an election."""
    try:
        uuid.UUID(election_id)
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid election_id format (must be UUID)"}), 400
    
    data = request.get_json() or {}
    
    with get_session() as session:
        election = session.query(Election).filter(Election.id == election_id).first()
        if not election:
            return jsonify({"error": "Election not found"}), 404
        
        # Update fields if provided
        if 'title' in data:
            title = (data.get('title') or '').strip()
            if title:
                election.title = title
        
        if 'election_year' in data:
            election.election_year = (data.get('election_year') or '').strip() or None
        
        if 'description' in data:
            election.description = (data.get('description') or '').strip() or None
        
        if 'start_time' in data:
            try:
                start_time_str = data.get('start_time')
                if start_time_str:
                    election.start_time = datetime.fromisoformat(start_time_str.replace('Z', '+00:00'))
            except (ValueError, AttributeError):
                return jsonify({"error": "Invalid start_time format"}), 400
        
        if 'end_time' in data:
            try:
                end_time_str = data.get('end_time')
                if end_time_str:
                    election.end_time = datetime.fromisoformat(end_time_str.replace('Z', '+00:00'))
            except (ValueError, AttributeError):
                return jsonify({"error": "Invalid end_time format"}), 400
        
        if 'status' in data:
            status = (data.get('status') or '').strip().upper()
            valid_statuses = [ELECTION_STATUS_UPCOMING, ELECTION_STATUS_ACTIVE,
                             ELECTION_STATUS_COMPLETED, ELECTION_STATUS_ARCHIVED]
            if status in valid_statuses:
                election.status = status
            else:
                return jsonify({"error": f"status must be one of: {', '.join(valid_statuses)}"}), 400
        
        if 'is_anonymous_tally' in data:
            election.is_anonymous_tally = bool(data.get('is_anonymous_tally'))
        
        # Validate times if both are set
        if election.start_time and election.end_time:
            if election.end_time <= election.start_time:
                return jsonify({"error": "end_time must be after start_time"}), 400
        
        return jsonify({
            "message": "Election updated successfully",
            "election": {
                "id": election.id,
                "title": election.title,
                "election_year": election.election_year,
                "status": election.status,
                "start_time": election.start_time.isoformat() if election.start_time else None,
                "end_time": election.end_time.isoformat() if election.end_time else None,
            }
        }), 200


@admin_bp.route('/elections/<election_id>', methods=['DELETE'])
@require_admin
def delete_election(election_id, admin_user_id=None):
    """Delete an election (only if no votes have been cast)."""
    try:
        uuid.UUID(election_id)
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid election_id format (must be UUID)"}), 400
    
    with get_session() as session:
        election = session.query(Election).filter(Election.id == election_id).first()
        if not election:
            return jsonify({"error": "Election not found"}), 404
        
        # Check if any ballots have been cast
        from database import Ballot
        ballot_count = session.query(Ballot).filter(Ballot.election_id == election_id).count()
        if ballot_count > 0:
            return jsonify({
                "error": "Cannot delete election with cast ballots",
                "ballot_count": ballot_count
            }), 400
        
        session.delete(election)
        
        return jsonify({
            "message": "Election deleted successfully"
        }), 200


# ============================================================================
# POSITION MANAGEMENT
# ============================================================================

@admin_bp.route('/elections/<election_id>/positions', methods=['GET'])
@require_admin
def get_election_positions(election_id, admin_user_id=None):
    """Get all positions for an election."""
    try:
        uuid.UUID(election_id)
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid election_id format (must be UUID)"}), 400
    
    with get_session() as session:
        election = session.query(Election).filter(Election.id == election_id).first()
        if not election:
            return jsonify({"error": "Election not found"}), 404
        
        positions = session.query(Position).filter(
            Position.election_id == election_id
        ).all()
        
        positions_data = []
        for position in positions:
            # Count candidates for this position
            candidate_count = session.query(Candidate).filter(
                Candidate.position_id == position.id
            ).count()
            
            positions_data.append({
                "id": position.id,
                "name": position.name,
                "election_id": position.election_id,
                "candidate_count": candidate_count,
            })
        
        return jsonify({
            "positions": positions_data,
            "total": len(positions_data)
        }), 200


@admin_bp.route('/elections/<election_id>/positions', methods=['POST'])
@require_admin
def create_position(election_id, admin_user_id=None):
    """Create a new position for an election."""
    try:
        uuid.UUID(election_id)
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid election_id format (must be UUID)"}), 400
    
    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    
    if not name:
        return jsonify({"error": "name is required"}), 400
    
    with get_session() as session:
        # Check if election exists
        election = session.query(Election).filter(Election.id == election_id).first()
        if not election:
            return jsonify({"error": "Election not found"}), 404
        
        # Check if position with same name already exists for this election
        existing = session.query(Position).filter(
            and_(
                Position.election_id == election_id,
                Position.name == name
            )
        ).first()
        
        if existing:
            return jsonify({"error": "Position with this name already exists for this election"}), 409
        
        position = Position(
            name=name,
            election_id=election_id
        )
        
        session.add(position)
        session.flush()
        
        return jsonify({
            "message": "Position created successfully",
            "position": {
                "id": position.id,
                "name": position.name,
                "election_id": position.election_id,
            }
        }), 201


@admin_bp.route('/positions/<position_id>', methods=['PUT'])
@require_admin
def update_position(position_id, admin_user_id=None):
    """Update a position."""
    try:
        uuid.UUID(position_id)
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid position_id format (must be UUID)"}), 400
    
    data = request.get_json() or {}
    
    with get_session() as session:
        position = session.query(Position).filter(Position.id == position_id).first()
        if not position:
            return jsonify({"error": "Position not found"}), 404
        
        if 'name' in data:
            name = (data.get('name') or '').strip()
            if not name:
                return jsonify({"error": "name cannot be empty"}), 400
            
            # Check if another position with this name exists for the same election
            existing = session.query(Position).filter(
                and_(
                    Position.election_id == position.election_id,
                    Position.name == name,
                    Position.id != position_id
                )
            ).first()
            
            if existing:
                return jsonify({"error": "Position with this name already exists for this election"}), 409
            
            position.name = name
        
        return jsonify({
            "message": "Position updated successfully",
            "position": {
                "id": position.id,
                "name": position.name,
                "election_id": position.election_id,
            }
        }), 200


@admin_bp.route('/positions/<position_id>', methods=['DELETE'])
@require_admin
def delete_position(position_id, admin_user_id=None):
    """Delete a position (only if no candidates are running for it)."""
    try:
        uuid.UUID(position_id)
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid position_id format (must be UUID)"}), 400
    
    with get_session() as session:
        position = session.query(Position).filter(Position.id == position_id).first()
        if not position:
            return jsonify({"error": "Position not found"}), 404
        
        # Check if any candidates exist for this position
        candidate_count = session.query(Candidate).filter(
            Candidate.position_id == position_id
        ).count()
        
        if candidate_count > 0:
            return jsonify({
                "error": "Cannot delete position with existing candidates",
                "candidate_count": candidate_count
            }), 400
        
        session.delete(position)
        
        return jsonify({
            "message": "Position deleted successfully"
        }), 200


# ============================================================================
# STATISTICS
# ============================================================================

@admin_bp.route('/statistics', methods=['GET'])
@require_admin
def get_admin_statistics(admin_user_id=None):
    """Get comprehensive admin statistics."""
    with get_session() as session:
        # Election statistics
        total_elections = session.query(Election).count()
        upcoming_elections = session.query(Election).filter(
            Election.status == ELECTION_STATUS_UPCOMING
        ).count()
        active_elections = session.query(Election).filter(
            Election.status == ELECTION_STATUS_ACTIVE
        ).count()
        completed_elections = session.query(Election).filter(
            Election.status == ELECTION_STATUS_COMPLETED
        ).count()
        
        # Candidate statistics
        total_candidates = session.query(Candidate).count()
        approved_candidates = session.query(Candidate).filter(
            Candidate.is_approved == True
        ).count()
        pending_candidates = session.query(Candidate).filter(
            Candidate.is_approved == False
        ).count()
        
        # Position statistics
        total_positions = session.query(Position).count()
        
        # Voting statistics
        from database import Ballot
        total_ballots = session.query(Ballot).count()
        
        return jsonify({
            "elections": {
                "total": total_elections,
                "upcoming": upcoming_elections,
                "active": active_elections,
                "completed": completed_elections,
            },
            "candidates": {
                "total": total_candidates,
                "approved": approved_candidates,
                "pending": pending_candidates,
            },
            "positions": {
                "total": total_positions,
            },
            "voting": {
                "total_ballots": total_ballots,
            }
        }), 200

