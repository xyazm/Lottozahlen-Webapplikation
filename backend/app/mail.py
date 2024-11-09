from flask_mail import Message
from flask import current_app

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