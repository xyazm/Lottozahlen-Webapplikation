# app/__init__.py
from flask import Flask
from flask_cors import CORS
from flask_mail import Mail
from flask_migrate import Migrate
from dotenv import load_dotenv
from config import Config  
from .database import db
from .settings import settings_routes
from .jwt_helper import jwt, jwt_routes
from .login import login_routes
from .mail import mail_routes
from .analysis import analysis_routes

load_dotenv()  
mail = Mail()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, resources={r"/*": {"origins": "http://localhost:3000", "supports_credentials": True}})

    app.register_blueprint(settings_routes)
    app.register_blueprint(jwt_routes)
    app.register_blueprint(login_routes)
    app.register_blueprint(mail_routes)
    app.register_blueprint(analysis_routes)

    # Initialisiere die SQLAlchemy-Datenbank mit der App
    db.init_app(app)  
    mail.init_app(app)  # Initialisiere das Mail-Objekt mit der App
    jwt.init_app(app)  # Initialisiere das JWT-Objekt mit der App
    migrate = Migrate(app, db)

    return app

# Rufe create_app auf, um die App zu erstellen
app = create_app()
