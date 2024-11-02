# app/database.py
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Student(db.Model):
    __tablename__ = 'student'
    id = db.Column(db.Integer, primary_key=True)
    nachname = db.Column(db.String(50), nullable=False)
    vorname = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)

class Settings(db.Model):
    __tablename__ = 'settings'
    id = db.Column(db.Integer, primary_key=True)
    anzahlLottoscheine = db.Column(db.Integer, nullable=False)
    feedbackEnabled = db.Column(db.Boolean, default=False)
    personalData = db.Column(db.Boolean, default=False)

def create_connection(app):
    """Initialisiert die Datenbank mit der Flask-App."""
    db.init_app(app)

def add_student_to_db(nachname, vorname, email):
    """Fügt einen neuen Studenten zur Datenbank hinzu."""
    new_student = Student(nachname=nachname, vorname=vorname, email=email)
    db.session.add(new_student)
    db.session.commit()

def get_user_id_from_db(email):
    """Holt die Benutzer-ID anhand der E-Mail-Adresse."""
    student = Student.query.filter_by(email=email).first()
    return student.id if student else None

def load_settings():
    """Lädt die Einstellungen aus der Datenbank."""
    settings = Settings.query.filter_by(id=1).first()
    return settings if settings else None

def save_settings(settings):
    """Speichert die Einstellungen in der Datenbank."""
    existing_settings = Settings.query.filter_by(id=1).first()
    if existing_settings:
        existing_settings.anzahlLottoscheine = settings['anzahlLottoscheine']
        existing_settings.feedbackEnabled = settings['feedbackEnabled']
        existing_settings.personalData = settings['personalData']
    else:
        new_settings = Settings(
            anzahlLottoscheine=settings['anzahlLottoscheine'],
            feedbackEnabled=settings['feedbackEnabled'],
            personalData=settings['personalData']
        )
        db.session.add(new_settings)
    
    db.session.commit()