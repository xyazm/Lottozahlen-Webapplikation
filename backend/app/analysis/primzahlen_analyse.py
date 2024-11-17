import pandas as pd
import plotly.express as px
import json
import numpy as np
from sympy import primerange
from . import analysis_routes
from flask import jsonify
from ..database import get_scheinexamples_from_db

@analysis_routes.route('/zahlenanalyse')
def zahlenanalyse():
    try:
        plot_data = primzahlen()
        return jsonify({'zahlenanalyse_plot': plot_data})
    except Exception as e:
        print(f"Fehler in der Zahlenanalyse: {e}")
        return jsonify({'error': str(e)}), 500

def primzahlen():
    scheine = get_scheinexamples_from_db()
    zahlen = [zahl for schein in scheine for zahl in [
        schein.lottozahl1, schein.lottozahl2, schein.lottozahl3,
        schein.lottozahl4, schein.lottozahl5, schein.lottozahl6
    ]]

    zahlen_array = np.array(zahlen)
    primzahlen_set = set(primerange(1, 51))

    primzahlen_count = np.isin(zahlen_array, list(primzahlen_set)).sum()
    gerade_count = (zahlen_array % 2 == 0).sum()
    ungerade_count = (zahlen_array % 2 == 1).sum()

    total_count = len(zahlen)
    daten = {
        'Kategorie': ['Primzahlen', 'Gerade Zahlen', 'Ungerade Zahlen'],
        'Anzahl': [primzahlen_count, gerade_count, ungerade_count],
        'Prozent': [100 * primzahlen_count / total_count, 
                    100 * gerade_count / total_count, 
                    100 * ungerade_count / total_count]
    }

    df = pd.DataFrame(daten)

    fig = px.bar(
        df, 
        x='Kategorie', 
        y=['Anzahl', 'Prozent'], 
        title="Häufigkeit und prozentuale Verteilung der Prim-, Geraden und Ungeraden Zahlen",
        labels={'value': 'Häufigkeit', 'variable': 'Metrik'}, 
        barmode='stack'
    )

    return json.loads(fig.to_json())