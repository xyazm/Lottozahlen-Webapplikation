from flask import Blueprint
from ..jwt_helper import login_required, login_required_admin

analysis_routes = Blueprint('analysis', __name__)

# Importiere alle Funktionen und Routen aus den Untermodulen
from .haeufigkeit_der_zahlen import *
from .primzahlen_analyse import *
from .gitter_analyse import *
from .verteilungs_analyse import *
from .aufeinanderfolgene_zahlen import *
from .diagonale_analyse import *
from .ungerade_zahlen import *
from .summen_analyse import *
from .kleine_grosse_analyse import *

# Neue Route: Kombinierte Analyse
@analysis_routes.route('/user_analysen', methods=['POST'])
@login_required
def user_analysen_route(user_id):
    """
    Führt alle User-spezifischen Analysen durch und gibt das kombinierte Feedback zurück.
    """
    try:
        # Abrufen der Scheine aus der Anfrage
        user_scheine = request.json.get('scheine')
        if not user_scheine:
            return jsonify({'error': 'Keine Lottoscheine übergeben.'}), 400

        # Liste für das Feedback
        feedback_list = []

        # Aufruf jeder Analyse mit Übergabe der `user_scheine`
        try:
            feedback_list.append("Häufigkeitsanalyse: \n" + ''.join(user_haeufigkeit_route(user_scheine))+'\n')
        except Exception as e:
            feedback_list.append(f"Häufigkeitsanalyse: Fehler: {str(e)}\n")

        try:
            feedback_list.append("Primzahlenanalyse: \n" + ''.join(user_primzahlenanalyse_route(user_scheine))+'\n')
        except Exception as e:
            feedback_list.append(f"Primzahlenanalyse: Fehler: {str(e)}\n")

        try:
            feedback_list.append("Gitteranalyse: \n" + ''.join(user_gitteranalyse_route(user_scheine))+'\n')
        except Exception as e:
            feedback_list.append(f"Gitteranalyse: Fehler: {str(e)}\n")

        try:
            feedback_list.append("Verteilungsanalyse: \n" + ''.join(user_verteilungsanalyse_route(user_scheine))+'\n')
        except Exception as e:
            feedback_list.append(f"Verteilungsanalyse: Fehler: {str(e)}\n")

        try:
            feedback_list.append("Aufeinanderfolgende Zahlen: \n" + ''.join(user_aufeinanderfolgende_reihen_route(user_scheine))+'\n')
        except Exception as e:
            feedback_list.append(f"Aufeinanderfolgende Zahlen: Fehler: {str(e)}\n")

        try:
            feedback_list.append("Diagonalanalyse: \n" + ''.join(user_diagonaleanalyse_route(user_scheine))+'\n')
        except Exception as e:
            feedback_list.append(f"Diagonalanalyse: Fehler: {str(e)}\n")

        try:
            feedback_list.append("Gerade/Ungerade: \n" + ''.join(user_ungeradeanalyse_route(user_scheine))+'\n')
        except Exception as e:
            feedback_list.append(f"Gerade/Ungerade: Fehler: {str(e)}\n")

        try:
            feedback_list.append("Summenanalyse: \n" + ''.join(user_summenanalyse_route(user_scheine))+'\n')
        except Exception as e:
            feedback_list.append(f"Summenanalyse: Fehler: {str(e)}\n")

        try:
            feedback_list.append("Kleine/Große Zahlen: \n" + ''.join(user_kleingrossanalyse_route(user_scheine))+'\n')
        except Exception as e:
            feedback_list.append(f"Kleine/Große Zahlen: Fehler: {str(e)}\n")
        
        try:
            feedback_list.append("Chi-Quadrat-Analyse: \n" + ''.join(user_chiquadrat_route(user_scheine)) + '\n')
        except Exception as e:
            feedback_list.append(f"Chi-Quadrat-Analyse: Fehler: {str(e)}\n")

        # Kombiniertes Feedback als String
        coded_feedback = ''.join(feedback_list)

        # Rückgabe
        return jsonify({'coded_feedback': coded_feedback})

    except Exception as e:
        print(f"Fehler in der kombinierten Analyse: {e}")
        return jsonify({'error': str(e)}), 500