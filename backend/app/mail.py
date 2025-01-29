from flask_mail import Message
from flask import current_app, request, jsonify, Blueprint
import html
import re
import logging

# Logging konfigurieren
logging.basicConfig(level=logging.ERROR)
logger = logging.getLogger(__name__)

mail_routes = Blueprint('mail', __name__)

def is_valid_email(email):
    email_regex = r'^[^@]+@[^@]+\.[^@]+$'
    return re.match(email_regex, email) is not None

def sanitize_and_validate(data):
    sanitized_data = {key: html.escape(value) for key, value in data.items() if value}
    if not all(sanitized_data.values()):
        raise ValueError("Alle Felder müssen ausgefüllt sein.")
    if not is_valid_email(sanitized_data.get('email', '')):
        raise ValueError("Ungültige E-Mail-Adresse.")
    return sanitized_data

def send_access_code(email, access_code):
    msg = Message('Ihr Zugangscode',
                  sender=current_app.config['MAIL_DEFAULT_SENDER'],
                  recipients=[email])
    msg.body = f"Ihr Zugangscode lautet: {access_code}. Bitte verwenden Sie diesen, um sich einzuloggen."
    with current_app.app_context():
        current_app.extensions['mail'].send(msg)

def send_contact_email(name, email, subject, message):
    msg = Message(subject=subject,
                  sender=email,
                  recipients=['lottoscheinanalyse@rub.de'])
    msg.body = f"Name: {name}\nE-Mail: {email}\nBetreff: {subject}\n\nNachricht:\n{message}"
    with current_app.app_context():
        current_app.extensions['mail'].send(msg)

@mail_routes.route('/contact', methods=['POST'])
def contact():
    try:
        # Formulardaten abrufen und validieren
        data = request.get_json()
        sanitized_data = sanitize_and_validate(data)

        # E-Mail senden
        send_contact_email(
            sanitized_data['name'], sanitized_data['email'],
            sanitized_data['subject'], sanitized_data['message']
        )

        return jsonify({'status': 'success', 'message': 'Nachricht erfolgreich gesendet'}), 200

    except ValueError as ve:
        return jsonify({'status': 'error', 'message': str(ve)}), 400
    except Exception as e:
        logger.error(f"Fehler beim Senden der Nachricht: {e}")
        return jsonify({'status': 'error', 'message': 'Die Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es später erneut.'}), 500