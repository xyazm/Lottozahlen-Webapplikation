# app/lottomanagement.py
from flask import Blueprint, request, jsonify
from .database import *
from .jwt_helper import *

management_routes = Blueprint('lottomanagement', __name__)

@management_routes.route('/admin/getlottoscheine', methods=['POST'])
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


# SELECT 
#     f.id AS feedback_id,
#     GROUP_CONCAT(CONCAT(
#         l.lottozahl1, ',', l.lottozahl2, ',', 
#         l.lottozahl3, ',', l.lottozahl4, ',', 
#         l.lottozahl5, ',', l.lottozahl6
#     )) AS lottoscheine,
#     f.feedback_text AS feedback,
#     CONCAT(s.vorname, ' ', s.nachname) AS student_name
# FROM 
#     feedback f
# JOIN 
#     lottoscheine l ON f.id = l.feedback_id
# JOIN 
#     student s ON l.student_id = s.id
# GROUP BY 
#     f.id, f.feedback_text, s.vorname, s.nachname;