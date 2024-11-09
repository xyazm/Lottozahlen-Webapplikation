from flask import Flask
from flask_cors import CORS
from flask_mail import Mail
from flask_migrate import Migrate
from dotenv import load_dotenv
from config import Config  
from .database import db
from .routes import settings_routes
from .jwt_helper import jwt

load_dotenv()  
mail = Mail()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, resources={r"/*": {"origins": "http://localhost:3000", "supports_credentials": True}})

    app.register_blueprint(settings_routes)

    # Initialisiere die SQLAlchemy-Datenbank mit der App
    db.init_app(app)  
    mail.init_app(app)  # Initialisiere das Mail-Objekt mit der App
    jwt.init_app(app)  # Initialisiere das JWT-Objekt mit der App
    migrate = Migrate(app, db)

    return app

# Rufe create_app auf, um die App zu erstellen
app = create_app()
