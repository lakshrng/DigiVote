import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from database import create_all_tables
from routes.auth_routes import auth_bp
from routes.candidate_routes import candidate_bp

def create_app():
    # Load environment variables
    load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"), override=False)

    app = Flask(__name__)

    allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
    CORS(app, resources={r"/api/*": {"origins": [o.strip() for o in allowed_origins]}})

    # Initialize DB tables
    create_all_tables()

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok"})

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(candidate_bp)

    return app

if __name__ == "__main__":
    app = create_app()
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
