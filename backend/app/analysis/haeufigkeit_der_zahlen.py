import pandas as pd
import plotly.express as px
import json
from collections import Counter
from . import analysis_routes
from flask import jsonify
from ..database import get_scheinexamples_from_db

@analysis_routes.route('/haeufigkeit')
def lotto_haeufigkeit():
    try:
        scatter_json = get_lottozahlen_haeufigkeit()
        return jsonify({'scatter_plot': scatter_json})
    except Exception as e:
        print(f"Fehler in der Häufigkeitsanalyse: {e}")
        return jsonify({'error': str(e)}), 500

def get_lottozahlen_haeufigkeit():
    scheine = get_scheinexamples_from_db()
    zahlen = [zahl for schein in scheine for zahl in [
        schein.lottozahl1, schein.lottozahl2, schein.lottozahl3,
        schein.lottozahl4, schein.lottozahl5, schein.lottozahl6
    ]]
    
    haeufigkeit = Counter(zahlen)
    gitter_data = []
    for zahl, haeufigkeit in haeufigkeit.items():
        zeile = (zahl - 1) // 7
        spalte = (zahl - 1) % 7
        gitter_data.append({'Zahl': zahl, 'Zeile': zeile + 1, 'Spalte': spalte + 1, 'Häufigkeit': haeufigkeit})

    gitter_df = pd.DataFrame(gitter_data)

    scatter_fig = px.scatter(
        gitter_df, 
        x='Spalte', 
        y='Zeile', 
        size='Häufigkeit', 
        color='Häufigkeit', 
        text='Zahl', 
        title='Beliebtheit der Felder im 7x7-Gitter (Scatterplot)',
        labels={'Spalte': 'Spalte (1-7)', 'Zeile': 'Zeile (1-7)', 'Häufigkeit': 'Anzahl der Wahlen'},
        color_continuous_scale='Viridis'
    )
    scatter_fig.update_yaxes(autorange="reversed")
    scatter_fig.update_traces(
        textposition='middle center',
        hovertemplate='<b>Zahl %{text}</b><br>Häufigkeit: %{marker.size}<extra></extra>'
    )

    return json.loads(scatter_fig.to_json())