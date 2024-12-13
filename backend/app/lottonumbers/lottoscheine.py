# app/lottoscheine.py
import numpy as np
import pandas as pd
from flask import jsonify
from ..database import save_lottoscheine_examples_to_db
from . import lotto_db
from ..jwt_helper import login_required_admin

@lotto_db.route('/admin/generate-lotto-tickets', methods=['POST'])
@login_required_admin
def generate_lotto_tickets():
    """
    API-Endpoint zur Generierung und Speicherung von Lottoscheinen.
    Generiert 100 Lottoscheine mit je 6 zufälligen Zahlen von 1 bis 49.
    """
    try:
        # Feste Parameter
        num_tickets = 100
        num_numbers = 6
        range_start = 1
        range_end = 49

        # Generierung der Lottoscheine
        tickets = [
            np.sort(np.random.choice(range(range_start, range_end + 1), num_numbers, replace=False))
            for _ in range(num_tickets)
        ]
        lotto_tickets = pd.DataFrame(tickets, columns=[f'Nummer_{i+1}' for i in range(num_numbers)])

        # Speicherung der Lottoscheine in der Datenbank
        save_lottoscheine_examples_to_db(lotto_tickets)

        return jsonify({
            'status': 'success',
            'message': f'{num_tickets} Lottoscheine erfolgreich generiert und gespeichert.'
        }), 200
    except Exception as e:
        # Fehlerbehandlung
        return jsonify({
            'status': 'error',
            'message': f'Ein Fehler ist aufgetreten: {str(e)}'
        }), 500