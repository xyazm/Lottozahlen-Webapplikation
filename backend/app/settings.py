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

@settings_routes.route('/save-feedback-and-lottoscheine', methods=['POST'])
@login_required
def save_feedback(user_id):
    """Speichere Feedback und verknüpfe es mit den Lottoscheinen."""
    data = request.get_json()
    student_id = get_jwt_identity()
    feedback_text = data.get('feedback_text')
    scheine = data.get('scheine')
    
    if not feedback_text or not isinstance(feedback_text, str):
        return jsonify({'status': 'error', 'message': 'Feedback-Text ist erforderlich.'}), 400

    if not scheine or not isinstance(scheine, list):
        return jsonify({'status': 'error', 'message': 'Eine Liste von Lottoschein-IDs ist erforderlich.'}), 400
    
    # Speichere das Feedback in der Feedback-Tabelle
    save_feedback_and_lottoscheine(student_id, scheine, feedback_text)

    return jsonify({'status': 'success', 'message': 'Feedback erfolgreich gespeichert und verknüpft.'}), 200

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