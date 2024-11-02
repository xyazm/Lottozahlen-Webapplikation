import jwt
import datetime
from flask import current_app

def generate_jwt(user_id):
    expiration_time = datetime.datetime.utcnow() + datetime.timedelta(minutes=30)
    token = jwt.encode({'sub': user_id, 'exp': expiration_time}, current_app.config['JWT_SECRET'], algorithm='HS256')
    return token

def decode_jwt(token):
    try:
        payload = jwt.decode(token, current_app.config['JWT_SECRET'], algorithms=['HS256'])
        return payload['sub']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None