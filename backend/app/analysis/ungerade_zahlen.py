import pandas as pd
import plotly.graph_objects as go
import numpy as np
import json
from collections import Counter
from . import analysis_routes
from flask import jsonify
from ..database import get_scheinexamples_from_db

@analysis_routes.route('/ungeradeanalyse')
def gerade_ungerade_analyse():
    try:
        plot_json = get_gerade_ungerade_plot()
        return jsonify({'ungeradeanalyse_plot': plot_json})
    except Exception as e:
        print(f"Fehler in der Analyse für gerade und ungerade Zahlen: {e}")
        return jsonify({'error': str(e)}), 500

def get_gerade_ungerade_plot():
    scheine = get_scheinexamples_from_db()

    # Funktion zur Analyse von geraden und ungeraden Zahlen
    def gerade_ungerade_kombinationen(schein):
        gerade = sum(1 for zahl in schein if zahl % 2 == 0)
        ungerade = len(schein) - gerade
        return (gerade, ungerade)

    # Ergebnisse sammeln
    kombinationen = Counter()
    total_scheine = len(scheine)

    # Zähle Gesamtanzahl von geraden und ungeraden Zahlen
    # gesamt_gerade = 0
    # gesamt_ungerade = 0

    # for schein in scheine:
    #     zahlen = [schein.lottozahl1, schein.lottozahl2, schein.lottozahl3,
    #               schein.lottozahl4, schein.lottozahl5, schein.lottozahl6]
    #     kombination = gerade_ungerade_kombinationen(zahlen)
    #     kombinationen[kombination] += 1

    #     # Summiere gerade und ungerade Zahlen für die Gesamtanalyse
    #     gesamt_gerade += kombination[0]
    #     gesamt_ungerade += kombination[1]

    # Berechnung der Durchschnittswerte
    gerade_prozente = []
    ungerade_prozente = []

    for schein in scheine:
        zahlen = [schein.lottozahl1, schein.lottozahl2, schein.lottozahl3,
                  schein.lottozahl4, schein.lottozahl5, schein.lottozahl6]
        kombination = gerade_ungerade_kombinationen(zahlen)
        kombinationen[kombination] += 1

        # Prozentsatz der geraden und ungeraden Zahlen im aktuellen Schein
        gerade_anteil = (kombination[0] / 6) * 100
        ungerade_anteil = (kombination[1] / 6) * 100

        gerade_prozente.append(gerade_anteil)
        ungerade_prozente.append(ungerade_anteil)

    # Durchschnitt der Prozentsätze berechnen
    durchschnitt_gerade = np.mean(gerade_prozente) if gerade_prozente else 0
    durchschnitt_ungerade = np.mean(ungerade_prozente) if ungerade_prozente else 0

    # Ergebnisse in Prozent umwandeln
    kombinationen_prozent = {
        kombi: (count / total_scheine) * 100 if total_scheine > 0 else 0
        for kombi, count in kombinationen.items()
    }

    # Durchschnitt der geraden und ungeraden Zahlen pro Schein berechnen
    # durchschnitt_gerade = (gesamt_gerade / (total_scheine * 6)) * 100 if total_scheine > 0 else 0
    # durchschnitt_ungerade = (gesamt_ungerade / (total_scheine * 6)) * 100 if total_scheine > 0 else 0

    # Daten für Balkendiagramm vorbereiten
    kombinationen_df = pd.DataFrame([
        {'label': f"{k[0]}/{k[1]}", 'prozent': v}
        for k, v in kombinationen_prozent.items()
    ])
    kombinationen_df.sort_values(by='label', inplace=True)  # Nach Label sortieren

    # Subplots erstellen
    fig = go.Figure()

    # Balkendiagramm für gerade/ungerade Kombinationen
    for _, row in kombinationen_df.iterrows():
        fig.add_trace(go.Bar(
            x=[row['label']],
            y=[row['prozent']],
            name=f"{row['label']}",
            hovertemplate=f"Kombination: {row['label']}<br>Prozent: {row['prozent']:.2f}%<extra></extra>",
            xaxis="x1",
            yaxis="y1"
        ))

    # Zusätzliche Balken für den Durchschnitt von geraden und ungeraden Zahlen
    fig.add_trace(go.Bar(
        x=["Durchschnitt Gerade"],
        y=[durchschnitt_gerade],
        name="Durchschnitt Gerade",
        marker=dict(color="blue"),
        hovertemplate=f"Durchschnitt Gerade: {durchschnitt_gerade:.2f}%<extra></extra>",
        xaxis="x1",
        yaxis="y1"
    ))

    fig.add_trace(go.Bar(
        x=["Durchschnitt Ungerade"],
        y=[durchschnitt_ungerade],
        name="Durchschnitt Ungerade",
        marker=dict(color="orange"),
        hovertemplate=f"Durchschnitt Ungerade: {durchschnitt_ungerade:.2f}%<extra></extra>",
        xaxis="x1",
        yaxis="y1"
    ))

    # Layout des Plots
    fig.update_layout(
        title="Analyse der Kombination von geraden und ungeraden Zahlen",
        xaxis=dict(title="Kombination gerade/ungerade", showgrid=False),
        yaxis=dict(title="Prozent (%)", showgrid=True),
        template="plotly_white",
        showlegend=False
    )

    # JSON für Plot zurückgeben
    return json.loads(fig.to_json())