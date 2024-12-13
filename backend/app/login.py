# app/login.py
from .mail import send_access_code
from .database import *
from .jwt_helper import *
from flask import Blueprint, request, jsonify
from datetime import datetime as dt, timedelta
from werkzeug.security import check_password_hash

login_routes = Blueprint('login', __name__)

@login_routes.route('/login', methods=['POST'])
def student_login():
    email = request.json.get('email')
    accept_terms = request.json.get('accept_terms', False)

    if not email.endswith('@rub.de'):
        return jsonify({'status': 'error', 'message': 'Nur E-Mail-Adressen der RUB sind erlaubt.'}), 400

    student = get_student_from_db(email)

    if student:
        # Nutzer existiert bereits, prüfen ob Terms akzeptiert wurden
        if not student.terms_accepted:
            if accept_terms:
                # Terms akzeptieren und Nutzer aktualisieren
                student.terms_accepted = True
                db.session.commit()
                return _generate_and_send_access_code(student)
            else:
                return jsonify({
                    'status': 'terms_not_accepted',
                    'message': 'Bitte akzeptieren Sie die Nutzungsbedingungen, um fortzufahren.'
                }), 403

        # Zugangscode generieren und senden, da Terms akzeptiert sind
        return _generate_and_send_access_code(student)

    # Neuer Nutzer - prüfen, ob Nutzungsbedingungen akzeptiert wurden
    if not accept_terms:
        return jsonify({
            'status': 'terms_not_accepted',
            'message': 'Bitte akzeptieren Sie die Nutzungsbedingungen, um fortzufahren.'
        }), 403

    # Nutzer speichern, da Terms akzeptiert wurden
    name_part = email.split('@')[0]
    vorname, nachname = name_part.split('.')

    new_student = Student(
        nachname=nachname,
        vorname=vorname,
        email=email,
        terms_accepted=True  # Nutzungsbedingungen akzeptiert
    )
    db.session.add(new_student)
    db.session.commit()

    # Zugangscode generieren und senden
    return _generate_and_send_access_code(new_student)

@login_routes.route('/accept_terms', methods=['POST'])
def accept_terms():
    email = request.json.get('email')

    # Sicherstellen, dass die E-Mail-Adresse vorhanden ist
    if not email:
        return jsonify({'status': 'error', 'message': 'E-Mail-Adresse fehlt.'}), 400

    # Nutzer in der DB finden
    student = get_student_from_db(email)
    if not student:
        return jsonify({'status': 'error', 'message': 'Nutzer nicht gefunden.'}), 404

    # Nutzungsbedingungen als akzeptiert speichern
    student.terms_accepted = True
    db.session.commit()

    return jsonify({'status': 'success', 'message': 'Nutzungsbedingungen akzeptiert.'}), 200
    
def _generate_and_send_access_code(student):
    """Generiert und sendet den Zugangscode."""
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
    send_access_code(student.email, access_code)

    return jsonify({'status': 'success', 'message': 'Zugangscode wurde gesendet.'}), 200

@login_routes.route('/validate_code', methods=['POST'])
def validate_access_code():
    submitted_code = request.json.get('access_code')
    email = request.json.get('email') 

    # Versuch 1: Student mit Zugangscode einloggen
    student = get_student_from_db(email)
    if student:
        access_record = get_code_from_db(student.id)
        if access_record and access_record.code == submitted_code:
            # Überprüfen, ob der Zugangscode abgelaufen ist
            if dt.utcnow() > access_record.expires_at:
                return jsonify({'status': 'error', 'message': 'Zugangscode ist abgelaufen.'}), 401
            
            # Zugangscode löschen und Token generieren
            db.session.delete(access_record)
            db.session.commit()

            access_token = create_jwt_token(student.id)
            return jsonify({'status': 'success', 'message': 'Login erfolgreich!', 'access_token': access_token}), 200

    # Versuch 2: Admin mit Passwort einloggen
    admin = get_admin_from_db(email)
    if admin:
        if check_password_hash(admin.password, submitted_code): 
            admin_token = create_jwt_token(admin.id, is_admin=True)
            return jsonify({'status': 'success', 'message': 'Admin-Login erfolgreich!', 'access_token': admin_token}), 200
        else:
            return jsonify({'status': 'error', 'message': 'Ungültiges Passwort für Admin.'}), 401

    # Kein gültiger Zugangscode oder Admin-Passwort gefunden
    return jsonify({'status': 'error', 'message': 'Ungültiger Zugangscode oder Passwort.'}), 401    
    
@login_routes.route('/protected', methods=['GET'])
@login_required
def protected(user_id):
    return jsonify({'logged_in_as': user_id}), 200
    