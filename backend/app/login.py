from .mail import send_access_code
from .database import *
from .jwt_helper import *
from flask import Blueprint, request, jsonify
from datetime import datetime as dt, timedelta

login_routes = Blueprint('login', __name__)

@login_routes.route('/login', methods=['POST'])
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

@login_routes.route('/validate_code', methods=['POST'])
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
    
@login_routes.route('/protected', methods=['GET'])
@login_required
def protected(user_id):
    return jsonify({'logged_in_as': user_id}), 200
    