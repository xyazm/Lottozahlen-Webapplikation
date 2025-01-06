# app/settings.py
from flask import Blueprint, request, jsonify
from .database import *
from .jwt_helper import *

settings_routes = Blueprint('settings', __name__)

def validate_terms_accepted(student_id):
    """
    Prüft, ob ein Student den Nutzungshinweis akzeptiert hat.
    """
    student = get_student_from_db(student_id)
    return student.terms_accepted if student else False

@settings_routes.route('/get-lottoschein-settings', methods=['GET'])
@login_required
def get_lottoschein_settings(user_id):
    """Hole die Lottoschein-Einstellungen für reguläre Benutzer."""
    settings = load_settings()
    if settings:
        return jsonify({'anzahl': settings.anzahlLottoscheine, 'feedback': settings.feedbackEnabled}), 200
    else:
        return jsonify({'status': 'error', 'message': 'Keine Einstellungen gefunden.'}), 404

@settings_routes.route('/save-lottoscheine', methods=['POST'])
@login_required
def save_lottoschein(user_id):
    """Speichere Lottoscheine für einen Benutzer."""
    data = request.get_json()
    student_id = get_jwt_identity()
    scheine = data.get('scheine')

    # Zustimmung prüfen
    if not validate_terms_accepted(student_id):
        return jsonify({'status': 'error', 'message': 'Bitte stimmen Sie zuerst den Nutzungshinweisen zu.'}), 403

    if not scheine:
        return jsonify({'status': 'error', 'message': 'Keine gültigen Scheine erhalten.'}), 400
    
    saved_scheine = []

    # Jeden Schein für den Benutzer speichern
    for schein in scheine:
        lottoschein = schein.get('numbers')
        if not lottoschein or len(lottoschein) != 6:
            return jsonify({'status': 'error', 'message': 'Jeder Lottoschein muss genau 6 Zahlen enthalten.'}), 400
        new_schein = save_lottoschein_to_db(student_id=student_id, lottozahlen=lottoschein)
        saved_scheine.append({'id': new_schein.id, 'numbers': lottoschein})

    return jsonify({'status': 'success', 'message': 'Alle Lottoscheine wurden erfolgreich gespeichert.', 'scheine' : saved_scheine}), 200

@settings_routes.route('/admin/settings', methods=['GET'])
@login_required_admin
def admin_get_settings():
    """Hole Einstellungen speziell für Admins."""
    settings = load_settings()
    if settings:
        return jsonify({"anzahlLottoscheine": settings.anzahlLottoscheine,"feedbackEnabled": settings.feedbackEnabled, "personalData": settings.personalData}), 200
    return jsonify({'status': 'error', 'message': 'Keine Einstellungen gefunden.'}), 404

@settings_routes.route('/admin/settings', methods=['POST'])
@login_required_admin
def admin_update_settings():
    """Aktualisiere die Einstellungen als Admin."""
    new_settings = request.json
    required_fields = ['anzahlLottoscheine', 'feedbackEnabled', 'personalData']

    # Validierung der Felder
    if not all(field in new_settings for field in required_fields):
        return jsonify({'status': 'error', 'message': 'Alle Felder sind erforderlich.'}), 400

    save_settings(new_settings)
    return jsonify({'status': 'success', 'message': 'Einstellungen erfolgreich gespeichert.'}), 200