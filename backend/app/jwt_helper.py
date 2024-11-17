# app/jwt_helper.py
import datetime
from flask import jsonify, Blueprint
from functools import wraps
import random
import string
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, get_jwt

jwt_routes = Blueprint('jwt', __name__)

jwt = JWTManager()

def generate_access_code():
    return ''.join(random.choices(string.ascii_letters + string.digits, k=6))

def create_jwt_token(user_id, is_admin=False):
    expiration_time = datetime.timedelta(minutes=30)
    token = create_access_token(identity=user_id, additional_claims={"is_admin": is_admin}, expires_delta=expiration_time)
    return token
    
def login_required(f):
    """Dekorator für Routen, die eine gültige JWT-Anmeldung erfordern."""
    @wraps(f)
    @jwt_required()  # Erfordert ein gültiges JWT
    def decorated_function(*args, **kwargs):
        user_id = get_jwt_identity()  # Ruft die Benutzer-ID aus dem Token ab
        return f(user_id=user_id, *args, **kwargs)  # Übergibt die Benutzer-ID an die Route
    return decorated_function

def login_required_admin(f):
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        claims = get_jwt()
        if claims.get("is_admin"):
            return f(*args, **kwargs)
        return jsonify({'error': 'Unauthorized access. Admin privileges required.'}), 403
    return decorated_function

@jwt_routes.route('/verify-token', methods=['POST'])
@jwt_required()
def verify_token():
    user_id = get_jwt_identity()
    if user_id:
        return jsonify({'isValid': True}), 200
    else:
        return jsonify({'isValid': False}), 401