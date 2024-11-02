from flask import Blueprint, request, jsonify, session
from .database import *
from .mail import send_access_code, send_contact_email
from .jwt_helper import generate_jwt
import random
import string

settings_routes = Blueprint('settings', __name__)

def generate_access_code():
    return ''.join(random.choices(string.ascii_letters + string.digits, k=6))


@settings_routes.route('/login', methods=['POST'])
def student_login():
    email = request.json.get('email')
    if email.endswith('@rub.de'):
        student = Student.query.filter_by(email=email).first()

        if not student:
            name_part = email.split('@')[0]
            vorname, nachname = name_part.split('.')
            add_student_to_db(nachname, vorname, email)

        access_code = generate_access_code()
        session['access_code'] = access_code
        session['email'] = email
        print(f"Access Code: {access_code} and Email: {email}")
        print(f"Access Code: {session.get('access_code')} and Email: {session.get('email') }")
        send_access_code(email, access_code)  # E-Mail senden
        return jsonify({'message': 'Zugangscode wurde gesendet.'}), 200
    else:
        return jsonify({'error': 'Nur E-Mail-Adressen der RUB sind erlaubt.'}), 400

@settings_routes.route('/validate_code', methods=['POST'])
def validate_access_code():
    submitted_code = request.json.get('access_code')
    email = session.get('email') 
    saved_code = session.get('access_code')

    # Debug-Ausgaben, um die Sitzung zu überprüfen
    print(f"Submitted Code: {submitted_code}, Saved Code in Session: {saved_code}, Email in Session: {email}")

    if saved_code == submitted_code:
        user_id = get_user_id_from_db(email)
        token = generate_jwt(user_id)
        return jsonify({'token': token}), 200
    else:
        return jsonify({'error': 'Ungültiger Zugangscode.'}), 401


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
def get_settings():
    settings = load_settings()
    if settings:
        return jsonify(settings), 200
    else:
        return jsonify({'error': 'Keine Einstellungen gefunden.'}), 404


@settings_routes.route('/settings', methods=['POST'])
def update_settings():
    new_settings = request.json
    
    # Sicherstellen, dass alle erforderlichen Felder vorhanden sind
    required_fields = ['anzahlLottoscheine', 'feedbackEnabled', 'personalData']
    if not all(field in new_settings for field in required_fields):
        return jsonify({'error': 'Alle Felder sind erforderlich.'}), 400
    
    save_settings(new_settings)
    return jsonify({'message': 'Einstellungen erfolgreich gespeichert.'}), 200