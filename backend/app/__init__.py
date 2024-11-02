from flask import Flask, session
from flask_cors import CORS
from flask_mail import Mail
from dotenv import load_dotenv
import os
from config import Config  # Importiere die Konfiguration
from .database import db  # Importiere die Datenbankinitialisierung
from .routes import settings_routes  # Importiere die Routen

load_dotenv()  # Lade Umgebungsvariablen aus der .env-Datei

# Initialisiere das Mail-Objekt
mail = Mail()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)  # Läd die Konfiguration

    CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})  # Anpassung auf Frontend-Port

    # Mail-Konfiguration
    app.config['MAIL_SERVER'] = 'sandbox.smtp.mailtrap.io'
    app.config['MAIL_PORT'] = 2525
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USE_SSL'] = False
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER')
    app.secret_key = os.getenv('SECRET_KEY')
    app.config['JWT_SECRET'] = os.getenv('JWT_SECRET')

    db.init_app(app)  # Initialisiert die SQLAlchemy-Datenbank mit der App
    mail.init_app(app)  # Initialisiere das Mail-Objekt mit der App

    # Registriere die Routen
    app.register_blueprint(settings_routes)

    return app

# Rufe create_app auf, um die App zu erstellen
app = create_app()
