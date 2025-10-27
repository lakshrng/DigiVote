import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv

from database import create_all_tables
from routes.auth_routes import auth_bp
from routes.candidate_routes import candidate_bp
from routes.voting import voting_bp
from routes.results import results_bp


def create_app() -> Flask:
    # Load environment variables from backend/.env if present
    load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"), override=False)
    app = Flask(__name__)

    allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
    CORS(
        app,
        resources={r"/api/*": {"origins": [origin.strip() for origin in allowed_origins]}},
    )

    create_all_tables()

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok"})

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(candidate_bp)
    app.register_blueprint(voting_bp, url_prefix='/api')
    app.register_blueprint(results_bp, url_prefix='/api')

    return app


if __name__ == "__main__":
    app = create_app()
    port = int(os.getenv("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=False)