from flask import Flask, request, jsonify, session, redirect, url_for
from flask_cors import CORS
from flask_mail import Mail, Message
from dotenv import load_dotenv
import random
import string
import json
import os

app = Flask(__name__)
CORS(app)  # Enable CORS to allow cross-origin requests

# Konfiguration für Flask-Mail
load_dotenv()
app.config['MAIL_SERVER'] = 'sandbox.smtp.mailtrap.io' 
app.config['MAIL_PORT'] = 2525
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
mail = Mail(app)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

SETTINGS_FILE = 'settings.json'

# Load settings from the JSON file
def load_settings():
    if os.path.exists(SETTINGS_FILE):
        with open(SETTINGS_FILE, 'r') as file:
            return json.load(file)
    return {}

# Save settings to the JSON file
def save_settings(settings):
    with open(SETTINGS_FILE, 'w') as file:
        json.dump(settings, file, indent=4)

@app.route('/settings', methods=['GET'])
def get_settings():
    settings = load_settings()
    return jsonify(settings)

@app.route('/settings', methods=['POST'])
def update_settings():
    new_settings = request.json
    save_settings(new_settings)
    return jsonify({'message': 'Settings saved successfully'}), 200

@app.route('/contact', methods=['POST'])
def contact():
    try:
        # Formulardaten abrufen
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        subject = data.get('subject')
        message = data.get('message')

        # Ensure no field is empty
        if not all([name, email, subject, message]):
            return jsonify({'error': 'All fields are required'}), 400

        # Erstelle die E-Mail-Nachricht
        msg = Message(subject=subject,
                      sender=email,
                      recipients=['lottoscheinanalyse@rub.de'],  
                      body=f"Name: {name}\nE-Mail: {email}\nBetreff: {subject}\n\nNachricht:\n{message}")

        # E-Mail senden
        mail.send(msg)
        return jsonify({'message': 'Nachricht erfolgreich gesendet'}), 200
    
    except Exception as e:
        print(f"Fehler beim Senden der Nachricht: {e}")  # Ausgabe im Terminal für Fehleranalyse
        return jsonify({'error': 'Fehler beim Senden der Nachricht'}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)  # Start the server on port 5000