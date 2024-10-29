from flask import Flask, request, jsonify, session
from flask_cors import CORS
from flask_mail import Mail, Message
from dotenv import load_dotenv
import random
import string
import json
import os
import mysql.connector
from mysql.connector import Error
import jwt
import datetime

# Lade Umgebungsvariablen aus der .env-Datei
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS to allow cross-origin requests

# Flask-Mail für Kontaktanfragen konfigurieren
app.config['MAIL_SERVER'] = 'sandbox.smtp.mailtrap.io' 
app.config['MAIL_PORT'] = 2525
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')

# Secret Key aus Umgebungsvariablen setzen
app.secret_key = os.getenv('SECRET_KEY')  # Hier wird der Secret Key gesetzt

# JWT-Konfiguration
app.config['JWT_SECRET'] = os.getenv('JWT_SECRET', 'dein_geheimer_schluessel')

# Helper-Funktion zum Generieren von JWT
def generate_jwt(user_id):
    expiration_time = datetime.datetime.utcnow() + datetime.timedelta(minutes=30)  # Token gilt 30 Minuten
    token = jwt.encode({'sub': user_id, 'exp': expiration_time}, app.config['JWT_SECRET'], algorithm='HS256')
    return token

# Helper-Funktion zum Dekodieren von JWT
def decode_jwt(token):
    try:
        payload = jwt.decode(token, app.config['JWT_SECRET'], algorithms=['HS256'])
        return payload['sub']  # Gibt die Benutzer-ID zurück
    except jwt.ExpiredSignatureError:
        return None  # Token ist abgelaufen
    except jwt.InvalidTokenError:
        return None  # Token ist ungültig

@app.route('/contact', methods=['POST'])
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

        # E-Mail-Nachricht erstellen
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

# Einstellungen für Admin
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

# Temporärer Zugangscode für das Student-Login
def generate_access_code():
    return ''.join(random.choices(string.ascii_letters + string.digits, k=6))

@app.route('/login', methods=['POST'])
def student_login():
    email = request.json.get('email')

    if email.endswith('@rub.de'):  
        access_code = generate_access_code()  
        session['access_code'] = access_code  # Zugangscode in der Session speichern
        
        msg = Message('Ihr Zugangscode', recipients=[email])
        msg.body = f"Ihr Zugangscode lautet: {access_code}. Bitte verwenden Sie diesen, um sich einzuloggen."
        
        try:
            mail.send(msg)
            return jsonify({'message': 'Zugangscode wurde gesendet.'}), 200
        except Exception as e:
            return jsonify({'error': 'Fehler beim Senden des Zugangscodes!'}), 500
    else:
        return jsonify({'error': 'Nur E-Mail-Adressen der RUB sind erlaubt.'}), 400

@app.route('/validate_code', methods=['POST'])
def validate_access_code():
    submitted_code = request.json.get('access_code')
    
    if session.get('access_code') == submitted_code:
        user_id = 'ein_eindeutiger_benutzer_id'  # Hier solltest du die Benutzer-ID aus deiner Datenbank abrufen
        token = generate_jwt(user_id)
        return jsonify({'token': token}), 200
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

# Beispielroute für geschützte Ressourcen
@app.route('/protected', methods=['GET'])
def protected_route():
    token = request.headers.get('Authorization').split(" ")[1]  # Erwartet: Bearer <token>
    user_id = decode_jwt(token)

    if user_id is not None:
        return jsonify({'message': f'Willkommen, Benutzer {user_id}!'}), 200
    else:
        return jsonify({'error': 'Ungültiger oder abgelaufener Token.'}), 401

if __name__ == '__main__':
    app.run(debug=True, port=5000)  