import pandas as pd
import plotly.graph_objects as go
import json
from collections import Counter
from . import analysis_routes
from flask import jsonify
from ..database import get_scheinexamples_from_db

@analysis_routes.route('/kleingrossanalyse')
def kleine_grosse_analyse():
    try:
        plot_json = get_kleine_grosse_combined_plot()
        return jsonify({'kleingrossanalyse_plot': plot_json})
    except Exception as e:
        print(f"Fehler in der Analyse von kleinen und großen Zahlen: {e}")
        return jsonify({'error': str(e)}), 500

def get_kleine_grosse_combined_plot():
    scheine = get_scheinexamples_from_db()

    # Funktion zur Bestimmung der kleinen und großen Zahlen
    def kleine_grosse_kombination(schein):
        kleine = sum(1 for zahl in schein if zahl <= 25)  # Zahlen bis 25
        grosse = len(schein) - kleine  # Rest sind große Zahlen
        return (kleine, grosse)

    # Ergebnisse sammeln
    kombinationen = Counter()
    total_scheine = len(scheine)

    for schein in scheine:
        zahlen = [schein.lottozahl1, schein.lottozahl2, schein.lottozahl3,
                  schein.lottozahl4, schein.lottozahl5, schein.lottozahl6]
        kombination = kleine_grosse_kombination(zahlen)
        kombinationen[kombination] += 1

    # Ergebnisse in Prozent umwandeln
    kombinationen_prozent = {
        kombi: (count / total_scheine) * 100 if total_scheine > 0 else 0
        for kombi, count in kombinationen.items()
    }

    # Daten für die Visualisierung vorbereiten
    kombinationen_df = pd.DataFrame([
        {
            "Label": f"{k[0]} kleine, {k[1]} große",
            "kleine": k[0],
            "grosse": k[1],
            "Prozent": kombinationen_prozent.get(k, 0),
            "Häufigkeit": kombinationen.get(k, 0),
        }
        for k in sorted(kombinationen.keys())
    ])

    # Subplots erstellen
    fig = go.Figure()

    # Balkendiagramm für Kombinationen
    for _, row in kombinationen_df.iterrows():
        fig.add_trace(go.Bar(
            x=[row["Label"]],
            y=[row["Prozent"]],
            name=row["Label"],
            hovertemplate=f"Kombination: {row['Label']}<br>Häufigkeit: {row['Häufigkeit']}<br>Prozent: {row['Prozent']:.2f}%<extra></extra>",
            xaxis="x1",
            yaxis="y1"
        ))

    # Layout des Plots
    fig.update_layout(
        title="Verteilung von kleinen (≤25) und großen (>25) Zahlen in Lottoscheinen",
        xaxis=dict(title="Kombinationen kleine/große Zahlen", showgrid=False),
        yaxis=dict(title="Prozent (%)", showgrid=True),
        template="plotly_white",
        showlegend=False
    )

    # JSON für Plot zurückgeben
    return json.loads(fig.to_json())