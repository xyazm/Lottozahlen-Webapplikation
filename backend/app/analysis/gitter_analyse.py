import pandas as pd
import plotly.express as px
import json
import numpy as np
from . import analysis_routes
from flask import jsonify
from ..database import get_scheinexamples_from_db

@analysis_routes.route('/gitteranalyse')
def gitteranalyse():
    try:
        plot_json = get_gitteranalyse()
        return jsonify({'gitterplot': plot_json})
    except Exception as e:
        print(f"Fehler in der Gitteranalyse: {e}")
        return jsonify({'error': str(e)}), 500

def get_gitteranalyse():
    ergebnisse = []
    scheine = get_scheinexamples_from_db()

    for schein in scheine:
        zahlen = [schein.lottozahl1, schein.lottozahl2, schein.lottozahl3, 
                  schein.lottozahl4, schein.lottozahl5, schein.lottozahl6] 
        
        gitter = np.zeros((7, 7), dtype=int)
        for zahl in zahlen:
            zeile = (zahl - 1) // 7
            spalte = (zahl - 1) % 7
            gitter[zeile, spalte] = 1
        
        zeilen_count = gitter.sum(axis=1)
        spalten_count = gitter.sum(axis=0)
        
        for i in range(7):
            ergebnisse.append({
                'Zeile': f'Zeile_{i+1}',
                'Anzahl_Gewählte_Zahlen': zeilen_count[i],
                'Art': 'Zeile',
                'Index': i + 1
            })
            ergebnisse.append({
                'Spalte': f'Spalte_{i+1}',
                'Anzahl_Gewählte_Zahlen': spalten_count[i],
                'Art': 'Spalte',
                'Index': i + 1
            })

    df = pd.DataFrame(ergebnisse)
    trend_data = df.groupby(['Index', 'Art'])['Anzahl_Gewählte_Zahlen'].mean().reset_index()

    combined_fig = px.scatter(
        trend_data, 
        x='Index', 
        y='Anzahl_Gewählte_Zahlen',
        color='Art',
        title="Durchschnittliche Anzahl ausgewählter Zahlen pro Zeile und Spalte",
        labels={'Index': 'Position', 'Anzahl_Gewählte_Zahlen': 'Durchschnittliche Anzahl gewählter Zahlen'}
    )

    return json.loads(combined_fig.to_json())