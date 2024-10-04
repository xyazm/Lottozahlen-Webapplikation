from flask import Flask, request, jsonify, session, redirect, url_for
from flask_cors import CORS
from flask_mail import Mail, Message
from dotenv import load_dotenv
import random
import string
import json
import os
import mysql.connector
from mysql.connector import Error

app = Flask(__name__)
CORS(app)  # Enable CORS to allow cross-origin requests

# Flask-Mail for Contact.js
load_dotenv()
app.config['MAIL_SERVER'] = 'sandbox.smtp.mailtrap.io' 
app.config['MAIL_PORT'] = 2525
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
mail = Mail(app)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

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


# Settings for Admin
SETTINGS_FILE = 'settings.json'

def load_settings():
    if os.path.exists(SETTINGS_FILE):
        with open(SETTINGS_FILE, 'r') as file:
            return json.load(file)
    return {}

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


# temporary access code for student login
def generate_access_code():
    return ''.join(random.choices(string.ascii_letters + string.digits, k=6))

@app.route('/login', methods=['POST'])
def student_login():
    email = request.json.get('email')

    if email.endswith('@rub.de'):  
        access_code = generate_access_code()  
        session['access_code'] = access_code  
        
        msg = Message('Ihr Zugangscode', recipients=[email])
        msg.body = f"Ihr Zugangscode lautet: {access_code}. Bitte verwenden Sie diesen, um sich einzuloggen."
        
        try:
            mail.send(msg)
            return jsonify({'message': 'Zugangscode wurde gesendet.'}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    else:
        return jsonify({'error': 'Nur E-Mail-Adressen der RUB sind erlaubt.'}), 400

@app.route('/validate_code', methods=['POST'])
def validate_access_code():
    submitted_code = request.json.get('access_code')
    
    if session.get('access_code') == submitted_code:
        return jsonify({'message': 'Erfolgreich eingeloggt.'}), 200
    else:
        return jsonify({'error': 'Ungültiger Zugangscode.'}), 401
    
# Funktion zur Herstellung der Verbindung zur Datenbank
def create_connection():
    connection = None
    try:
        connection = mysql.connector.connect(
            host='localhost',
            user='dein_benutzername',  # Ersetze mit deinem MySQL-Benutzernamen
            password='dein_passwort',   # Ersetze mit deinem MySQL-Passwort
            database='deine_datenbank'   # Ersetze mit dem Namen deiner Datenbank
        )
        if connection.is_connected():
            print("Verbindung zur MySQL-Datenbank erfolgreich!")
    except Error as e:
        print(f"Fehler: '{e}'")
    return connection

@app.route('/add_user', methods=['POST'])
def add_user():
    data = request.get_json()
    username = data['username']
    email = data['email']
    
    connection = create_connection()
    cursor = connection.cursor()
    
    try:
        cursor.execute("INSERT INTO users (username, email) VALUES (%s, %s)", (username, email))
        connection.commit()
        return jsonify({'message': 'Benutzer erfolgreich hinzugefügt!'}), 201
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/users', methods=['GET'])
def get_users():
    connection = create_connection()
    cursor = connection.cursor(dictionary=True)
    users = []
    
    try:
        cursor.execute("SELECT * FROM users")
        users = cursor.fetchall()
        return jsonify(users), 200
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()


if __name__ == '__main__':
    app.run(debug=True, port=5000)  # Start the server on port 5000