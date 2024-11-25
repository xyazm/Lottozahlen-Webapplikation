import pandas as pd
import json
import plotly.express as px
from sympy import primerange
from flask import jsonify
from . import analysis_routes
from ..database import get_scheinexamples_from_db

@analysis_routes.route('/primzahlenanalyse')
def primzahlenanalyse():
    try:
        plot_data = analyse_primzahlen_pro_schein()
        return jsonify({'primzahlenanalyse_plot': plot_data})
    except Exception as e:
        print(f"Fehler in der Zahlenanalyse: {e}")
        return jsonify({'error': str(e)}), 500

def analyse_primzahlen_pro_schein():
    # Lottoscheine aus der Datenbank abrufen
    scheine = get_scheinexamples_from_db()
    
    # Liste der Primzahlen im Bereich 1 bis 49
    primzahlen_set = set(primerange(1, 50))
    
    # Berechnung der Anzahl der Primzahlen pro Schein
    anzahl_primzahlen_pro_schein = []
    for schein in scheine:
        zahlen = [
            schein.lottozahl1, schein.lottozahl2, schein.lottozahl3,
            schein.lottozahl4, schein.lottozahl5, schein.lottozahl6
        ]
        # Zähle, wie viele Zahlen im Schein Primzahlen sind
        primzahlen_count = sum(1 for zahl in zahlen if zahl in primzahlen_set)
        anzahl_primzahlen_pro_schein.append(primzahlen_count)
    
    # Verteilung der Primzahlenanzahl berechnen
    verteilung = pd.Series(anzahl_primzahlen_pro_schein).value_counts().sort_index()
    x_achse = range(0, 7)  # Werte von 0 bis 6
    df = pd.DataFrame({
        'Anzahl_Primzahlen': x_achse,
        'Häufigkeit': [verteilung.get(x, 0) for x in x_achse]
    })


    # Visualisierung mit Plotly
    fig = px.bar(
        df,
        x='Anzahl_Primzahlen',
        y='Häufigkeit',
        title='Verteilung der Anzahl der Primzahlen in Lottoscheinen',
        labels={'Anzahl_Primzahlen': 'Anzahl der Primzahlen', 'Häufigkeit': 'Häufigkeit'},
        text='Häufigkeit'
    )
    fig.update_traces(textposition='outside')
    fig.update_layout(
        xaxis=dict(tickmode='linear', tick0=0, dtick=1),
        yaxis_title='Häufigkeit',
        xaxis_title='Anzahl der Primzahlen pro Schein',
        title_x=0.5
    )

    # Rückgabe der Plotly-Figur als JSON
    return json.loads(fig.to_json())