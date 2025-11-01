import os
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

from database import create_all_tables
from routes.auth_routes import auth_bp
from routes.candidate_routes import candidate_bp
from routes.voting_routes import voting_bp
from routes.result_routes import result_bp


def create_app() -> Flask:
    # Load environment variables from backend/.env if present
    load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"), override=False)
    app = Flask(__name__)

    allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
    CORS(
        app,
        resources={r"/api/*": {"origins": [origin.strip() for origin in allowed_origins]}},
    )

    # Create uploads directory if it doesn't exist
    uploads_dir = os.path.join(os.path.dirname(__file__), "uploads", "candidates")
    os.makedirs(uploads_dir, exist_ok=True)

    # Configure upload settings
    app.config['UPLOAD_FOLDER'] = uploads_dir
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
    app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

    # Serve uploaded files
    @app.route('/uploads/candidates/<filename>')
    def uploaded_file(filename):
        return send_from_directory(uploads_dir, filename)

    create_all_tables()

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok"})

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(candidate_bp)
    app.register_blueprint(voting_bp)
    app.register_blueprint(result_bp)

    return app


if __name__ == "__main__":
    app = create_app()
    port = int(os.getenv("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=False)


