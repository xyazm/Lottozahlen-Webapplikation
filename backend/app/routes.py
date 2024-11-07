from datetime import datetime as dt, timedelta
from flask import Blueprint, request, jsonify
from .database import *
from .mail import send_access_code, send_contact_email
from .jwt_helper import *
import random
import string

settings_routes = Blueprint('settings', __name__)

def generate_access_code():
    return ''.join(random.choices(string.ascii_letters + string.digits, k=6))


@settings_routes.route('/login', methods=['POST'])
def student_login():
    email = request.json.get('email')
    if email.endswith('@rub.de'):
        student = get_student_from_db(email)

        if not student:
            name_part = email.split('@')[0]
            vorname, nachname = name_part.split('.')
            add_student_to_db(nachname, vorname, email)

        access_code = generate_access_code()
        expires_at = dt.utcnow() + timedelta(minutes=30) 
        existing_code = get_code_from_db(student.id)
        if existing_code:
            existing_code.code = access_code
            existing_code.expires_at = expires_at
        else:
            new_access_code = AccessCode(student_id=student.id, code=access_code, expires_at=expires_at)
            db.session.add(new_access_code)

        db.session.commit()
        send_access_code(email, access_code)  # E-Mail senden
        return jsonify({'message': 'Zugangscode wurde gesendet.'}), 200
    else:
        return jsonify({'error': 'Nur E-Mail-Adressen der RUB sind erlaubt.'}), 400

@settings_routes.route('/validate_code', methods=['POST'])
def validate_access_code():
    submitted_code = request.json.get('access_code')
    email = request.json.get('email') 
    student = get_student_from_db(email)
    access_record = get_code_from_db(student.id)

    if access_record and access_record.code == submitted_code:
        # Überprüfen, ob der Zugangscode abgelaufen ist
        if dt.utcnow() > access_record.expires_at:
            return jsonify({'error': 'Zugangscode ist abgelaufen.'}), 401
        
        db.session.delete(access_record)
        db.session.commit()

        token = generate_jwt(student.id)
        return jsonify({'token': token}), 200
    else:
        return jsonify({'error': 'Ungültiger Zugangscode.'}), 401
    
@settings_routes.route('/protected', methods=['GET'])
@login_required
def protected():
    token = request.headers.get('Authorization')
    print(f"Token: {token}")
    if token:
        token = token.split(" ")[1] if " " in token else token
        user_id = decode_jwt(token)
        if user_id is None:
            return jsonify({'error': 'Token ungültig oder abgelaufen'}), 401
        return jsonify({'logged_in_as': user_id}), 200
    else:
        return jsonify({'error': 'Token nicht bereitgestellt'}), 401


@settings_routes.route('/contact', methods=['POST'])
def contact():
    try:
        # Formulardaten abrufen
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        subject = data.get('subject')
        message = data.get('message')

        # Sicherstellen, dass kein Feld leer ist
        if not all([name, email, subject, message]):
            return jsonify({'error': 'All fields are required'}), 400

        send_contact_email(name, email, subject, message)  # E-Mail senden
        
        return jsonify({'message': 'Nachricht erfolgreich gesendet'}), 200
    
    except Exception as e:
        print(f"Fehler beim Senden der Nachricht: {e}")  # Ausgabe im Terminal für Fehleranalyse
        return jsonify({'error': 'Fehler beim Senden der Nachricht'}), 500


@settings_routes.route('/settings', methods=['GET'])
@login_required_admin
def get_settings():
    settings = load_settings()
    if settings:
        return jsonify(settings), 200
    else:
        return jsonify({'error': 'Keine Einstellungen gefunden.'}), 404


@settings_routes.route('/settings', methods=['POST'])
@login_required_admin
def update_settings():
    new_settings = request.json
    
    # Sicherstellen, dass alle erforderlichen Felder vorhanden sind
    required_fields = ['anzahlLottoscheine', 'feedbackEnabled', 'personalData']
    if not all(field in new_settings for field in required_fields):
        return jsonify({'error': 'Alle Felder sind erforderlich.'}), 400
    
    save_settings(new_settings)
    return jsonify({'message': 'Einstellungen erfolgreich gespeichert.'}), 200