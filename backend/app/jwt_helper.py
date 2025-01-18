# app/jwt_helper.py
from flask import jsonify, Blueprint
from functools import wraps
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, get_jwt
import datetime
import random
import string

jwt_routes = Blueprint('jwt', __name__)

jwt = JWTManager()

def generate_access_code():
    """Generiere einen Zufallscode für den Zugang."""
    return ''.join(random.choices(string.ascii_letters + string.digits, k=6))

def create_jwt_token(user_id, is_admin=False):
    """Erstelle einen JWT-Token mit Benutzer-ID und Admin-Status."""
    expiration_time = datetime.timedelta(minutes=30)
    token = create_access_token(identity=user_id, additional_claims={"is_admin": is_admin}, expires_delta=expiration_time)
    return token

def login_required(f):
    """Dekorator für geschützte Routen, die eine gültige JWT benötigen."""
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        user_id = get_jwt_identity()
        return f(user_id=user_id, *args, **kwargs)
    return decorated_function

def login_required_admin(f):
    """Dekorator für Admin-Routen."""
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        claims = get_jwt()
        if not claims.get("is_admin"):
            return jsonify({'status': 'error', 'message': 'Zugriff verweigert: Admin-Berechtigungen erforderlich.'}), 403
        return f(*args, **kwargs)
    return decorated_function

@jwt_routes.route('/verify-token', methods=['POST'])
@jwt_required()
def verify_token():
    """Prüfe, ob der JWT-Token gültig ist."""
    user_id = get_jwt_identity()
    if user_id:
        claims = get_jwt()
        return jsonify({'isValid': True, 'is_admin': claims.get("is_admin", False)}), 200
    else:
        return jsonify({'isValid': False}), 401
    
@jwt_routes.route('/refresh-token', methods=['POST'])
@jwt_required()  # Nur Zugriff mit gültigem Access Token
def refresh_token():
    """Erneuert den Token, wenn er noch gültig ist."""
    try:
        current_user = get_jwt_identity()
        new_token = create_access_token(
            identity=current_user,
            additional_claims={"is_admin": get_jwt().get("is_admin")},
            expires_delta=datetime.timedelta(minutes=30)
        )
        return jsonify({"access_token": new_token}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 422