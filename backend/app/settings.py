# app/settings.py
from flask import Blueprint, request, jsonify
from .database import *
from .jwt_helper import *

settings_routes = Blueprint('settings', __name__)


@settings_routes.route('/get-lottoschein-settings', methods=['GET'])
def get_lottoschein_settings():
    settings = load_settings()
    if settings:
        return jsonify(settings.anzahlLottoscheine), 200
    else:
        return jsonify({'error': 'Keine Einstellungen gefunden.'}), 404
    
@settings_routes.route('/save-lottoscheine', methods=['POST'])
@jwt_required()
def save_lottoschein():
    data = request.get_json()
    student_id = get_jwt_identity() 
    scheine = data.get('scheine')  

    if not scheine:
        return jsonify({'status': 'error', 'message': 'Keine gültigen Scheine erhalten.'}), 400

    # Jeden Schein für den Benutzer speichern
    for schein in scheine:
        lottoschein = schein.get('numbers')
        if not lottoschein or len(lottoschein) != 6: 
            return jsonify({'status': 'error', 'message':'Jeder Lottoschein muss genau 6 Zahlen enthalten.'}), 400
        
        save_lottoschein_to_db(student_id=student_id, lottozahlen=lottoschein)

    return jsonify({'status': 'success', 'message': 'Alle Lottoscheine wurden erfolgreich gespeichert.'}), 200

@settings_routes.route('/settings', methods=['GET'])
@login_required_admin
def get_settings():
    settings = load_settings()
    return jsonify(settings), 200 if settings else jsonify({'status': 'error', 'message': 'Keine Einstellungen gefunden.'}), 404

@settings_routes.route('/settings', methods=['POST'])
@login_required_admin
def update_settings():
    new_settings = request.json
    required_fields = ['anzahlLottoscheine', 'feedbackEnabled', 'personalData']
    if not all(field in new_settings for field in required_fields):
        return jsonify({'status': 'error', 'message': 'Alle Felder sind erforderlich.'}), 400
    
    save_settings(new_settings)
    return jsonify({'status': 'success', 'message': 'Einstellungen erfolgreich gespeichert.'}), 200