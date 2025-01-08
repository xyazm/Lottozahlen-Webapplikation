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
#     s.id AS student_id,
#     CONCAT(s.nachname, ', ', s.vorname) AS student_name,
#     f.id AS feedback_id,
#     f.feedback_text,
#     GROUP_CONCAT(l.id ORDER BY l.id SEPARATOR ', ') AS lottoschein_ids,
#     GROUP_CONCAT(
#         CONCAT(l.lottozahl1, '-', l.lottozahl2, '-', l.lottozahl3, '-', l.lottozahl4, '-', l.lottozahl5, '-', l.lottozahl6)
#         ORDER BY l.id
#         SEPARATOR '; '
#     ) AS lottoscheine
# FROM 
#     feedback f
# JOIN 
#     student s ON f.student_id = s.id
# LEFT JOIN 
#     lottoscheine l ON l.feedback_id = f.id
# GROUP BY 
#     f.id
# ORDER BY 
#     s.id, f.id;