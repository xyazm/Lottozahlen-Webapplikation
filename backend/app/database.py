# app/database.py
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash

db = SQLAlchemy()

# Student
class Student(db.Model):
    __tablename__ = 'student'
    id = db.Column(db.Integer, primary_key=True)
    nachname = db.Column(db.String(50), nullable=False)
    vorname = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    terms_accepted = db.Column(db.Boolean, default=False) 

def add_student_to_db(nachname, vorname, email):
    """Fügt einen neuen Studenten zur Datenbank hinzu."""
    new_student = Student(nachname=nachname, vorname=vorname, email=email)
    db.session.add(new_student)
    db.session.commit()

def get_student_from_db(identifier):
    """Holt den Benutzer anhand der E-Mail-Adresse oder ID."""
    if isinstance(identifier, int):  # Wenn die ID übergeben wird
        student = Student.query.filter_by(id=identifier).first()
    elif isinstance(identifier, str):  # Wenn die E-Mail übergeben wird
        student = Student.query.filter_by(email=identifier).first()
    
    return student if student else None


#Admin
class Admin(db.Model):
    __tablename__ = 'admins'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)  # Gehashedes Passwort

def get_admin_from_db(identifier):
    """Holt den Benutzer anhand der E-Mail-Adresse oder ID."""
    if isinstance(identifier, int): 
        admin = Admin.query.filter_by(id=identifier).first()
    elif isinstance(identifier, str): 
        admin = Admin.query.filter_by(email=identifier).first()
    return admin if admin else None

def add_admin(name, email, password):
    """
    Fügt einen neuen Admin zur Datenbank hinzu.
    :param name: Name des Admins
    :param email: Login-ID (E-Mail-Adresse des Admins)
    :param password: Klartextpasswort, das gehasht wird
    """
    # Überprüfen, ob der Admin bereits existiert
    existing_admin = Admin.query.filter_by(email=email).first()
    if existing_admin:
        print(f"Ein Admin mit der LoginID '{email}' existiert bereits.")
        return

    # Passwort hashen
    hashed_password = generate_password_hash(password, method='pbkdf2:sha256', salt_length=16)

    # Admin hinzufügen
    new_admin = Admin(name=name, email=email, password=hashed_password)
    db.session.add(new_admin)
    db.session.commit()

    print(f"Admin '{name}' wurde erfolgreich mit der Login-ID '{email}' hinzugefügt.")


#Lottoscheine von Studenten 
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
    feedback_id = db.Column(db.Integer, db.ForeignKey('feedback.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    student = db.relationship('Student', backref='lottoscheine')
    feedback = db.relationship('Feedback', uselist=False, backref='schein') 

def save_lottoschein_to_db(student_id, lottozahlen):
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
    db.session.flush()  # IDs vor Commit erhalten
    return new_schein

def get_lottoscheine_from_db():
    """Holt alle Lottoscheine aus der Datenbank."""
    scheine = Lottoscheine.query.all()
    return scheine if scheine else None

def get_lottoscheine_from_student_db(student_id):
    """Holt alle Lottoscheine eines Studenten aus der Datenbank."""
    scheine = Lottoscheine.query.filter_by(student_id=student_id).all()
    return scheine if scheine else None

def get_lottoscheine_letzte_woche():
    """
    Diese Funktion gibt alle Lottoscheine der letzten Woche zurück.
    """
    heute = datetime.utcnow()
    vor_7_tagen = heute - timedelta(days=7)
    lottoscheine_letzte_woche = Lottoscheine.query.filter(Lottoscheine.created_at >= vor_7_tagen).all()
    
    return lottoscheine_letzte_woche

# Programmierter Feedback für die abgegeben Lottoscheine der Studenten
class Feedback(db.Model):
    __tablename__ = 'feedback'
    id = db.Column(db.Integer, primary_key=True) 
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    feedback_text = db.Column(db.Text, nullable=False)  # Der Feedback-Text

    # Beziehungen
    student = db.relationship('Student', backref='feedbacks')

def save_feedback_to_lottoschein(student_id, schein_ids, feedback_text):
    """
    Speichert ein Feedback und verknüpft es mit einem Lottoschein.
    """
    # Feedback erstellen
    new_feedback = Feedback(
        student_id=student_id,
        feedback_text=feedback_text
    )
    db.session.add(new_feedback)
    db.session.commit()  # Speichern, um Feedback-ID zu erhalten

    # Lottoschein aktualisieren
    for schein in schein_ids:
        schein = Lottoscheine.query.filter_by(id=schein).first()
        if schein:
            schein.feedback_id = new_feedback.id
    db.session.commit()

def get_feedback_for_schein(schein_id):
    """
    Holt das Feedback für einen Lottoschein.
    """
    schein = Lottoscheine.query.filter_by(id=schein_id).first()
    if schein and schein.feedback:
        return {
            'feedback_id': schein.feedback.id,
            'feedback_text': schein.feedback.feedback_text,
        }
    return None


# Von Python 'zufaellig' generierte Beispiel Lottoscheine
class examples_Lottoscheine(db.Model):
    __tablename__ = 'lottoscheine_examples'
    id = db.Column(db.Integer, primary_key=True)
    lottozahl1 = db.Column(db.Integer, nullable=False)
    lottozahl2 = db.Column(db.Integer, nullable=False)
    lottozahl3 = db.Column(db.Integer, nullable=False)
    lottozahl4 = db.Column(db.Integer, nullable=False)
    lottozahl5 = db.Column(db.Integer, nullable=False)
    lottozahl6 = db.Column(db.Integer, nullable=False)

def get_scheinexamples_from_db():
    scheine = examples_Lottoscheine.query.all()
    return scheine if scheine else None

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


# Historische Lottozahlen (gezogene Lottozahlen aus Lotto 6aus49)
class LottoHistoric(db.Model):
    __tablename__ = 'lotto_historic'
    id = db.Column(db.Integer, primary_key=True)
    ziehungsdatum = db.Column(db.Date, nullable=False)
    lottozahl1 = db.Column(db.Integer, nullable=False)
    lottozahl2 = db.Column(db.Integer, nullable=False)
    lottozahl3 = db.Column(db.Integer, nullable=False)
    lottozahl4 = db.Column(db.Integer, nullable=False)
    lottozahl5 = db.Column(db.Integer, nullable=False)
    lottozahl6 = db.Column(db.Integer, nullable=False)

def save_lottohistoric_to_db(lottoscheine_df):
    for entry in lottoscheine_df:
        print(entry)
        ziehungsdatum = datetime.strptime(entry['date'], '%d.%m.%Y').date()

        # Prüfen, ob der Eintrag bereits existiert
        exists = db.session.query(LottoHistoric).filter_by(ziehungsdatum=ziehungsdatum).first()
        if exists:
            continue

        # Neuen Eintrag hinzufügen
        new_schein = LottoHistoric(
            id=entry['id'],
            ziehungsdatum=ziehungsdatum,
            lottozahl1=entry['Lottozahl'][0],
            lottozahl2=entry['Lottozahl'][1],
            lottozahl3=entry['Lottozahl'][2],
            lottozahl4=entry['Lottozahl'][3],
            lottozahl5=entry['Lottozahl'][4],
            lottozahl6=entry['Lottozahl'][5],
        )
        db.session.add(new_schein)
    db.session.commit()

def get_latest_lottohistoric_from_db():
    """Holt die neuesten Lottozahlen aus der Datenbank."""
    lottohistoric = LottoHistoric.query.order_by(LottoHistoric.ziehungsdatum.desc()).first()
    return lottohistoric.ziehungsdatum if lottohistoric else None


#Einstellungen für Lottoscheine
class Settings(db.Model):
    __tablename__ = 'settings'
    id = db.Column(db.Integer, primary_key=True)
    anzahlLottoscheine = db.Column(db.Integer, nullable=False)
    feedbackEnabled = db.Column(db.Boolean, default=False)
    personalData = db.Column(db.Boolean, default=False)

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


# temporärer Zugangscode für den Studenten
class AccessCode(db.Model):
    __tablename__ = 'access_code'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    code = db.Column(db.String(6), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=False)
    student = db.relationship('Student', backref='access_codes')

def get_code_from_db(id):
    """Holt den Zugangscode aus der Datenbank."""
    access_code = AccessCode.query.filter_by(student_id=id).first()
    return access_code if access_code else None