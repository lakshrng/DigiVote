from flask import Blueprint, request, jsonify, current_app
from datetime import datetime
import os
import uuid
from werkzeug.utils import secure_filename
from database import get_session, Candidate, Student, User, Election, Position, Department
from sqlalchemy.orm import joinedload
from sqlalchemy import and_, or_

candidate_bp = Blueprint('candidate', __name__, url_prefix='/api/candidates')


def allowed_file(filename):
    """Check if file extension is allowed."""
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def save_uploaded_file(file):
    """Save uploaded file and return the URL path."""
    if file and allowed_file(file.filename):
        # Generate unique filename
        filename = secure_filename(file.filename)
        file_ext = filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{uuid.uuid4()}.{file_ext}"
        
        # Get upload folder from app config
        upload_folder = current_app.config.get('UPLOAD_FOLDER')
        if not upload_folder:
            upload_folder = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads', 'candidates')
            os.makedirs(upload_folder, exist_ok=True)
        
        # Save file
        file_path = os.path.join(upload_folder, unique_filename)
        file.save(file_path)
        
        # Return URL path (relative to the static route)
        return f"/uploads/candidates/{unique_filename}"
    return None

# ============================================================================
# ELECTION ENDPOINTS (for voting interface)
# ============================================================================

@candidate_bp.route("/voting/elections", methods=["GET"])
def get_elections_for_voting():
    """Get all active elections for voting."""
    with get_session() as session:
        elections = session.query(Election).filter(
            Election.status.in_(["UPCOMING", "ACTIVE"])
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


@candidate_bp.route("/apply/elections", methods=["GET"])
def get_elections_for_application():
    """Get upcoming elections with their positions for candidate application."""
    with get_session() as session:
        elections = session.query(Election).filter(
            Election.status == "UPCOMING"
        ).options(
            joinedload(Election.positions)
        ).all()
        
        elections_data = []
        for election in elections:
            positions_data = [
                {
                    "id": position.id,
                    "name": position.name,
                    "description": position.description if hasattr(position, 'description') else None
                }
                for position in election.positions
            ]
            
            elections_data.append({
                "id": election.id,
                "title": election.title,
                "election_year": election.election_year,
                "status": election.status,
                "positions": positions_data
            })
        
        return jsonify({
            "elections": elections_data,
            "total": len(elections_data)
        })


@candidate_bp.route("/voting/elections/<election_id>/candidates", methods=["GET"])
def get_approved_candidates_for_voting(election_id):
    """Get approved candidates grouped by position for a specific election (for voting)."""
    with get_session() as session:
        # Check if election exists
        election = session.query(Election).filter(Election.id == election_id).first()
        if not election:
            return jsonify({"error": "Election not found"}), 404
        
        # Get only approved candidates for this election
        candidates = session.query(Candidate).options(
            joinedload(Candidate.student).joinedload(Student.user),
            joinedload(Candidate.position)
        ).filter(
            Candidate.election_id == election_id,
            Candidate.is_approved == True
        ).all()
        
        # Group candidates by position
        candidates_by_position = {}
        for candidate in candidates:
            position_name = candidate.position.name
            if position_name not in candidates_by_position:
                candidates_by_position[position_name] = []
            
            candidates_by_position[position_name].append({
                "id": candidate.id,
                "name": f"{candidate.student.user.first_name} {candidate.student.user.last_name}",
                "platform_statement": candidate.platform_statement,
                "photo_url": candidate.photo_url,
                "position_id": candidate.position.id,
                "position_name": position_name,
            })
        
        return jsonify({
            "election": {
                "id": election.id,
                "title": election.title,
                "election_year": election.election_year,
                "status": election.status
            },
            "candidates_by_position": candidates_by_position,
            "total_candidates": len(candidates)
        })


# ============================================================================
# CANDIDATE ENDPOINTS
# ============================================================================

@candidate_bp.get("/all-candidates")
def get_all_candidates():
    with get_session() as session:
        # Join Candidate → Student → User to get candidate name
        # Only return approved candidates for public viewing
        candidates = session.query(Candidate).options(
            joinedload(Candidate.student).joinedload(Student.user),
            joinedload(Candidate.position),
            joinedload(Candidate.election)
        ).filter(Candidate.is_approved == True).all()
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

@candidate_bp.route('/apply', methods=['POST'])
def apply_for_position():
    """Apply for a position in an election."""
    # Check if request contains form data (file upload) or JSON
    if request.content_type and 'multipart/form-data' in request.content_type:
        # Handle file upload
        student_id = request.form.get('student_id')
        position_id = request.form.get('position_id')
        election_id = request.form.get('election_id')
        platform_statement = request.form.get('platform_statement', '').strip()
        
        # Handle file upload
        photo_file = request.files.get('photo')
        photo_url = None
        if photo_file:
            photo_url = save_uploaded_file(photo_file)
    else:
        # Handle JSON request (for backward compatibility)
        data = request.get_json() or {}
        student_id = data.get('student_id')
        position_id = data.get('position_id')
        election_id = data.get('election_id')
        platform_statement = data.get('platform_statement', '').strip()
        photo_url = data.get('photo_url', '').strip()
    
    # Validation
    if not all([student_id, position_id, election_id]):
        return jsonify({"error": "student_id, position_id, and election_id are required"}), 400
    
    with get_session() as session:
        # Check if student exists
        student = session.query(Student).filter(Student.id == student_id).first()
        if not student:
            return jsonify({"error": "Student not found"}), 404
        
        # Check if student's user is verified
        user = session.query(User).filter(User.id == student.user_id).first()
        if not user or not user.is_verified:
            return jsonify({"error": "Student account not verified"}), 403
        
        # Check if election exists and is in UPCOMING status
        election = session.query(Election).filter(Election.id == election_id).first()
        if not election:
            return jsonify({"error": "Election not found"}), 404
        
        if election.status != "UPCOMING":
            return jsonify({"error": "Applications are only accepted for upcoming elections"}), 400
        
        # Check if position exists and belongs to the election
        position = session.query(Position).filter(
            and_(Position.id == position_id, Position.election_id == election_id)
        ).first()
        if not position:
            return jsonify({"error": "Position not found or doesn't belong to this election"}), 404
        
        # Check if student has already applied for any position in this election
        existing_application = session.query(Candidate).filter(
            and_(Candidate.student_id == student_id, Candidate.election_id == election_id)
        ).first()
        if existing_application:
            return jsonify({"error": "You have already applied for a position in this election"}), 409
        
        # Create candidate application
        candidate = Candidate(
            student_id=student_id,
            position_id=position_id,
            election_id=election_id,
            platform_statement=platform_statement,
            photo_url=photo_url,
            is_approved=False  # Requires admin approval
        )
        
        session.add(candidate)
        session.flush()  # Flush to get the ID without committing
        
        return jsonify({
            "message": "Application submitted successfully. Awaiting admin approval.",
            "candidate_id": candidate.id,
            "status": "pending_approval"
        }), 201


@candidate_bp.route('/my-applications/<student_id>', methods=['GET'])
def get_my_applications(student_id):
    """Get all applications for a specific student."""
    with get_session() as session:
        # Check if student exists
        student = session.query(Student).filter(Student.id == student_id).first()
        if not student:
            return jsonify({"error": "Student not found"}), 404
        
        # Get all applications for this student
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


@candidate_bp.route('/election/<election_id>', methods=['GET'])
def get_candidates_by_election(election_id):
    """Get all approved candidates for a specific election."""
    with get_session() as session:
        # Check if election exists
        election = session.query(Election).filter(Election.id == election_id).first()
        if not election:
            return jsonify({"error": "Election not found"}), 404
        
        # Get only approved candidates for this election
        candidates = session.query(Candidate).options(
            joinedload(Candidate.student).joinedload(Student.user),
            joinedload(Candidate.position)
        ).filter(
            Candidate.election_id == election_id,
            Candidate.is_approved == True
        ).all()
        
        candidates_data = []
        for candidate in candidates:
            candidates_data.append({
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
                "platform_statement": candidate.platform_statement,
                "photo_url": candidate.photo_url,
                "is_approved": candidate.is_approved
            })
        
        return jsonify({
            "election": {
                "id": election.id,
                "title": election.title,
                "election_year": election.election_year,
                "status": election.status
            },
            "candidates": candidates_data,
            "total": len(candidates_data)
        }), 200


@candidate_bp.route('/position/<position_id>', methods=['GET'])
def get_candidates_by_position(position_id):
    """Get all approved candidates for a specific position."""
    with get_session() as session:
        # Check if position exists
        position = session.query(Position).options(
            joinedload(Position.election)
        ).filter(Position.id == position_id).first()
        if not position:
            return jsonify({"error": "Position not found"}), 404
        
        # Get only approved candidates for this position
        candidates = session.query(Candidate).options(
            joinedload(Candidate.student).joinedload(Student.user),
            joinedload(Candidate.student).joinedload(Student.department)
        ).filter(
            Candidate.position_id == position_id,
            Candidate.is_approved == True
        ).all()
        
        candidates_data = []
        for candidate in candidates:
            candidates_data.append({
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
                "platform_statement": candidate.platform_statement,
                "photo_url": candidate.photo_url,
                "is_approved": candidate.is_approved
            })
        
        return jsonify({
            "position": {
                "id": position.id,
                "name": position.name,
                "election": {
                    "id": position.election.id,
                    "title": position.election.title,
                    "election_year": position.election.election_year,
                    "status": position.election.status
                }
            },
            "candidates": candidates_data,
            "total": len(candidates_data)
        }), 200


@candidate_bp.route('/<candidate_id>', methods=['GET'])
def get_candidate_details(candidate_id):
    """Get detailed information about a specific candidate."""
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
    """Update a candidate application (only if not approved yet)."""
    with get_session() as session:
        candidate = session.query(Candidate).filter(Candidate.id == candidate_id).first()
        if not candidate:
            return jsonify({"error": "Candidate application not found"}), 404
        
        # Check if application is already approved
        if candidate.is_approved:
            return jsonify({"error": "Cannot modify approved applications"}), 400
        
        # Check if request contains form data (file upload) or JSON
        if request.content_type and 'multipart/form-data' in request.content_type:
            # Handle file upload
            platform_statement = request.form.get('platform_statement', '').strip()
            photo_file = request.files.get('photo')
            
            if platform_statement:
                candidate.platform_statement = platform_statement
            
            if photo_file:
                # Delete old photo if exists
                if candidate.photo_url:
                    old_filename = candidate.photo_url.split('/')[-1]
                    upload_folder = current_app.config.get('UPLOAD_FOLDER')
                    if not upload_folder:
                        upload_folder = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads', 'candidates')
                    old_file_path = os.path.join(upload_folder, old_filename)
                    if os.path.exists(old_file_path):
                        try:
                            os.remove(old_file_path)
                        except:
                            pass
                
                # Save new photo
                new_photo_url = save_uploaded_file(photo_file)
                if new_photo_url:
                    candidate.photo_url = new_photo_url
        else:
            # Handle JSON request (for backward compatibility)
            data = request.get_json() or {}
            platform_statement = data.get('platform_statement', '').strip()
            photo_url = data.get('photo_url', '').strip()
            
            if platform_statement:
                candidate.platform_statement = platform_statement
            if photo_url:
                candidate.photo_url = photo_url
        
        return jsonify({
            "message": "Application updated successfully",
            "candidate_id": candidate.id
        }), 200


@candidate_bp.route('/<candidate_id>', methods=['DELETE'])
def withdraw_application(candidate_id):
    """Withdraw a candidate application (only if not approved yet)."""
    with get_session() as session:
        candidate = session.query(Candidate).filter(Candidate.id == candidate_id).first()
        if not candidate:
            return jsonify({"error": "Candidate application not found"}), 404
        
        # Check if application is already approved
        if candidate.is_approved:
            return jsonify({"error": "Cannot withdraw approved applications"}), 400
        
        session.delete(candidate)
        
        return jsonify({
            "message": "Application withdrawn successfully"
        }), 200


# Admin-only routes
@candidate_bp.route('/admin/pending', methods=['GET'])
def get_pending_applications():
    """Get all pending candidate applications (admin only)."""
    with get_session() as session:
        # Get all pending applications
        pending_applications = session.query(Candidate).options(
            joinedload(Candidate.student).joinedload(Student.user),
            joinedload(Candidate.student).joinedload(Student.department),
            joinedload(Candidate.position).joinedload(Position.election)
        ).filter(Candidate.is_approved == False).all()
        
        applications_data = []
        for app in pending_applications:
            applications_data.append({
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
            "pending_applications": applications_data,
            "total": len(applications_data)
        }), 200


@candidate_bp.route('/admin/<candidate_id>/approve', methods=['POST'])
def approve_candidate(candidate_id):
    """Approve a candidate application (admin only)."""
    with get_session() as session:
        candidate = session.query(Candidate).filter(Candidate.id == candidate_id).first()
        if not candidate:
            return jsonify({"error": "Candidate application not found"}), 404
        
        if candidate.is_approved:
            return jsonify({"error": "Application already approved"}), 400
        
        candidate.is_approved = True
        
        return jsonify({
            "message": "Candidate application approved successfully",
            "candidate_id": candidate.id
        }), 200


@candidate_bp.route('/admin/<candidate_id>/reject', methods=['POST'])
def reject_candidate(candidate_id):
    """Reject a candidate application (admin only)."""
    data = request.get_json() or {}
    reason = data.get('reason', '').strip()
    
    with get_session() as session:
        candidate = session.query(Candidate).filter(Candidate.id == candidate_id).first()
        if not candidate:
            return jsonify({"error": "Candidate application not found"}), 404
        
        if candidate.is_approved:
            return jsonify({"error": "Cannot reject approved applications"}), 400
        
        # Delete the application (rejection)
        session.delete(candidate)
        
        return jsonify({
            "message": "Candidate application rejected successfully",
            "reason": reason
        }), 200


@candidate_bp.route('/admin/statistics', methods=['GET'])
def get_candidate_statistics():
    """Get candidate application statistics (admin only)."""
    with get_session() as session:
        # Get total applications
        total_applications = session.query(Candidate).count()
        
        # Get approved applications
        approved_applications = session.query(Candidate).filter(Candidate.is_approved == True).count()
        
        # Get pending applications
        pending_applications = session.query(Candidate).filter(Candidate.is_approved == False).count()
        
        # Get applications by election
        elections_stats = session.query(
            Election.id,
            Election.title,
            Election.election_year,
            Election.status
        ).join(Candidate, Election.id == Candidate.election_id).distinct().all()
        
        election_stats = []
        for election in elections_stats:
            app_count = session.query(Candidate).filter(Candidate.election_id == election.id).count()
            approved_count = session.query(Candidate).filter(
                and_(Candidate.election_id == election.id, Candidate.is_approved == True)
            ).count()
            
            election_stats.append({
                "election_id": election.id,
                "title": election.title,
                "election_year": election.election_year,
                "status": election.status,
                "total_applications": app_count,
                "approved_applications": approved_count,
                "pending_applications": app_count - approved_count
            })
        
        return jsonify({
            "overview": {
                "total_applications": total_applications,
                "approved_applications": approved_applications,
                "pending_applications": pending_applications
            },
            "by_election": election_stats
        }), 200
