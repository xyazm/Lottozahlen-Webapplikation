from flask_mail import Message
from flask import current_app, request, jsonify, Blueprint

mail_routes = Blueprint('mail', __name__)

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