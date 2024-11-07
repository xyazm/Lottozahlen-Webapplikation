import jwt
import datetime
from flask import current_app, request, jsonify
from functools import wraps

def generate_jwt(user_id, is_admin=False):
    expiration_time = datetime.datetime.utcnow() + datetime.timedelta(minutes=30)
    token = jwt.encode({'sub': user_id, 'exp': expiration_time,  'is_admin': is_admin},current_app.config['JWT_SECRET'], algorithm='HS256')
    return token

def decode_jwt(token):
    try:
        payload = jwt.decode(token, current_app.config['JWT_SECRET'], algorithms=['HS256'])
        return payload['sub']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
    
def login_required(f):
    """Decorator to protect routes that require a valid JWT token."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        if token:
            token = token.split(" ")[1] if " " in token else token  # Remove "Bearer" prefix
            user_id = decode_jwt(token)
            if user_id:
                return f(*args, **kwargs)
        return jsonify({'error': 'Unauthorized access. Please provide a valid token.'}), 401
    return decorated_function

def login_required_admin(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        if token:
            token = token.split(" ")[1] if " " in token else token
            payload = decode_jwt(token)
            if payload and payload.get('is_admin'):
                return f(*args, **kwargs)
        return jsonify({'error': 'Unauthorized access. Admin privileges required.'}), 403
    return decorated_function