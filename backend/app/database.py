# app/database.py
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Student(db.Model):
    __tablename__ = 'student'
    id = db.Column(db.Integer, primary_key=True)
    nachname = db.Column(db.String(50), nullable=False)
    vorname = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)

class Lottoscheine(db.Model):
    __tablename__ = 'lottoscheine'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    lottozahl1 = db.Column(db.Integer, nullable=False)
    lottozahl2 = db.Column(db.Integer, nullable=False)
    lottozahl3 = db.Column(db.Integer, nullable=False)
    lottozahl4 = db.Column(db.Integer, nullable=False)
    lottozahl5 = db.Column(db.Integer, nullable=False)
    lottozahl6 = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    student = db.relationship('Student', backref='lottoscheine')

class examples_Lottoscheine(db.Model):
    __tablename__ = 'lottoscheine_examples'
    id = db.Column(db.Integer, primary_key=True)
    lottozahl1 = db.Column(db.Integer, nullable=False)
    lottozahl2 = db.Column(db.Integer, nullable=False)
    lottozahl3 = db.Column(db.Integer, nullable=False)
    lottozahl4 = db.Column(db.Integer, nullable=False)
    lottozahl5 = db.Column(db.Integer, nullable=False)
    lottozahl6 = db.Column(db.Integer, nullable=False)

class Settings(db.Model):
    __tablename__ = 'settings'
    id = db.Column(db.Integer, primary_key=True)
    anzahlLottoscheine = db.Column(db.Integer, nullable=False)
    feedbackEnabled = db.Column(db.Boolean, default=False)
    personalData = db.Column(db.Boolean, default=False)

class AccessCode(db.Model):
    __tablename__ = 'access_code'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    code = db.Column(db.String(6), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=False)
    student = db.relationship('Student', backref='access_codes')

def add_student_to_db(nachname, vorname, email):
    """Fügt einen neuen Studenten zur Datenbank hinzu."""
    new_student = Student(nachname=nachname, vorname=vorname, email=email)
    db.session.add(new_student)
    db.session.commit()

def get_student_from_db(email):
    """Holt die Benutzer-ID anhand der E-Mail-Adresse."""
    student = Student.query.filter_by(email=email).first()
    return student if student else None

def get_scheinexamples_from_db():
    scheine = examples_Lottoscheine.query.all()
    return scheine if scheine else None

def save_lottoschein_to_db(student_id, lottozahlen):
    # Beispiel für Lottozahlen: [1, 5, 12, 23, 34, 45]
    if len(lottozahlen) != 6:
        raise ValueError("Lottozahlen müssen genau 6 Zahlen enthalten.")
    
    new_schein = Lottoscheine(
        student_id=student_id,
        lottozahl1=lottozahlen[0],
        lottozahl2=lottozahlen[1],
        lottozahl3=lottozahlen[2],
        lottozahl4=lottozahlen[3],
        lottozahl5=lottozahlen[4],
        lottozahl6=lottozahlen[5]
    )
    db.session.add(new_schein)
    db.session.commit()

def save_lottoscheine_examples_to_db(lottoscheine_df):
    for _, lottozahlen in lottoscheine_df.iterrows():
        new_schein = examples_Lottoscheine(
            lottozahl1=int(lottozahlen['Nummer_1']),
            lottozahl2=int(lottozahlen['Nummer_2']),
            lottozahl3=int(lottozahlen['Nummer_3']),
            lottozahl4=int(lottozahlen['Nummer_4']),
            lottozahl5=int(lottozahlen['Nummer_5']),
            lottozahl6=int(lottozahlen['Nummer_6'])
        )
        db.session.add(new_schein)
    db.session.commit()

def get_lottoscheine_from_db():
    """Holt alle Lottoscheine aus der Datenbank."""
    scheine = Lottoscheine.query.all()
    return scheine if scheine else None

def get_lottoscheine_from_student_db(student_id):
    """Holt alle Lottoscheine eines Studenten aus der Datenbank."""
    scheine = Lottoscheine.query.filter_by(student_id=student_id).all()
    return scheine if scheine else None

def get_code_from_db(id):
    """Holt den Zugangscode aus der Datenbank."""
    access_code = AccessCode.query.filter_by(student_id=id).first()
    return access_code if access_code else None

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