import pandas as pd
import plotly.graph_objects as go
import json
from collections import Counter
from . import analysis_routes
from flask import jsonify
from ..database import get_scheinexamples_from_db

@analysis_routes.route('/summenanalyse')
def summenanalyse():
    try:
        plot_json = get_summen_combined_plot()
        return jsonify({'summenanalyse_plot': plot_json})
    except Exception as e:
        print(f"Fehler in der Summenanalyse: {e}")
        return jsonify({'error': str(e)}), 500

def get_summen_combined_plot():
    scheine = get_scheinexamples_from_db()

    # Definiere die Summenkategorien
    summenkategorien = [
        {"range": (0, 81), "label": "<82"},
        {"range": (82, 96), "label": "82-96"},
        {"range": (97, 111), "label": "97-111"},
        {"range": (112, 126), "label": "112-126"},
        {"range": (127, 141), "label": "127-141"},
        {"range": (142, 156), "label": "142-156"},
        {"range": (157, 171), "label": "157-171"},
        {"range": (172, 186), "label": "172-186"},
        {"range": (187, 201), "label": "187-201"},
        {"range": (202, 216), "label": "202-216"},
        {"range": (232, 246), "label": "232-246"},
        {"range": (247, 279), "label": "247-279"},
    ]

    kategorie_labels = [kategorie["label"] for kategorie in summenkategorien]

    # Funktion zur Bestimmung der Kategorie für eine gegebene Summe
    def kategorie_bestimmen(summe):
        for kategorie in summenkategorien:
            if kategorie["range"][0] <= summe <= kategorie["range"][1]:
                return kategorie["label"]
        return None

    # Ergebnisse sammeln
    summen_counter = Counter()
    total_scheine = len(scheine)

    for schein in scheine:
        zahlen = [schein.lottozahl1, schein.lottozahl2, schein.lottozahl3,
                  schein.lottozahl4, schein.lottozahl5, schein.lottozahl6]
        summe = sum(zahlen)
        kategorie = kategorie_bestimmen(summe)
        summen_counter[kategorie] += 1

    # Ergebnisse in Prozent umwandeln
    summen_prozent = {
        kategorie: (count / total_scheine) * 100 if total_scheine > 0 else 0
        for kategorie, count in summen_counter.items()
    }

    # Daten in DataFrame konvertieren
    summen_df = pd.DataFrame([
        {"Kategorie": k, "Prozent": summen_prozent.get(k,0), "Häufigkeit": summen_counter.get(k, 0)}
        for k in kategorie_labels  
    ])

    # Subplots erstellen
    fig = go.Figure()

    # Balkendiagramm für Summenkategorien
    for _, row in summen_df.iterrows():
        fig.add_trace(go.Bar(
            x=[row["Kategorie"]],
            y=[row["Prozent"]],
            name=row["Kategorie"],
            hovertemplate=f"Kategorie: {row['Kategorie']}<br>Häufigkeit: {row['Häufigkeit']}<br>Prozent: {row['Prozent']:.2f}%<extra></extra>",
            xaxis="x1",
            yaxis="y1"
        ))

    # Layout des Plots
    fig.update_layout(
        title="Summenwerte der Lottoscheine",
        xaxis=dict(title="Summenkategorien", showgrid=False),
        yaxis=dict(title="Prozent (%)", showgrid=True),
        template="plotly_white",
        showlegend=False
    )

    # JSON für Plot zurückgeben
    return json.loads(fig.to_json())