from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables FIRST
load_dotenv()

# Imports AFTER env loaded
from services.db import get_db, init_db
from routes.auth_routes import auth_bp
from routes.property_routes import property_bp
from routes.chat_routes import chat_bp


def create_app():
    app = Flask(__name__)
    
    # Enable CORS for all local and production origins
    CORS(app, origins=[
        r"https://.*\.vercel\.app",
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://52.66.79.240",
        "http://52.66.79.240:3000"
    ], supports_credentials=True)

    # Start Database Connection (SQLite Initialization)
    init_db()

    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(property_bp, url_prefix="/properties")
    app.register_blueprint(chat_bp)

    @app.route("/")
    def home():
        return {"msg": "RealEstate Triage Backend Running"}

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5016, debug=True)
