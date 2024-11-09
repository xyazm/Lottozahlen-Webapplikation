from datetime import datetime as dt, timedelta
from flask import Blueprint, request, jsonify, make_response
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

        access_token = create_jwt_token(student.id)
        return jsonify({'message': 'Login erfolgreich!','access_token': access_token}), 200
    else:
        return jsonify({'error': 'Ungültiger Zugangscode.'}), 401
    
@settings_routes.route('/protected', methods=['GET'])
@login_required
def protected(user_id):
    return jsonify({'logged_in_as': user_id}), 200
    
@settings_routes.route('/verify-token', methods=['POST'])
@jwt_required()
def verify_token():
    user_id = get_jwt_identity()
    if user_id:
        return jsonify({'isValid': True}), 200
    else:
        return jsonify({'isValid': False}), 401

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

@settings_routes.route('/get-lottoschein-settings', methods=['GET'])
def get_lottoschein_settings():
    settings = load_settings()
    if settings:
        return jsonify(settings.anzahlLottoscheine), 200
    else:
        return jsonify({'error': 'Keine Einstellungen gefunden.'}), 404

@settings_routes.route('/settings', methods=['GET'])
@login_required_admin
def get_settings():
    settings = load_settings()
    return jsonify(settings), 200 if settings else jsonify({'error': 'Keine Einstellungen gefunden.'}), 404

@settings_routes.route('/settings', methods=['POST'])
@login_required_admin
def update_settings():
    new_settings = request.json
    required_fields = ['anzahlLottoscheine', 'feedbackEnabled', 'personalData']
    if not all(field in new_settings for field in required_fields):
        return jsonify({'error': 'Alle Felder sind erforderlich.'}), 400
    
    save_settings(new_settings)
    return jsonify({'message': 'Einstellungen erfolgreich gespeichert.'}), 200