import pandas as pd
import json
from collections import Counter
from flask import request, jsonify
from . import analysis_routes, login_required_admin
from ..database import get_scheinexamples_from_db
import plotly.graph_objects as go


# Hilfsfunktion: Kleine und große Zahlen berechnen
def berechne_kleine_grosse_kombination(schein):
    """
    Berechnet die Anzahl kleiner (≤25) und großer Zahlen (>25) in einem Lottoschein.
    """
    kleine = sum(1 for zahl in schein if zahl <= 25)
    grosse = len(schein) - kleine
    return (kleine, grosse)


# Hilfsfunktion: Häufigkeitsdaten vorbereiten
def vorbereiten_kleine_grosse_daten(kombinationen, kombinationen_prozent):
    """
    Bereitet die Daten für die Visualisierung vor.
    """
    return pd.DataFrame([
        {
            "Label": f"{k[0]} kleine, {k[1]} große",
            "kleine": k[0],
            "grosse": k[1],
            "Prozent": kombinationen_prozent.get(k, 0),
            "Häufigkeit": kombinationen.get(k, 0),
        }
        for k in sorted(kombinationen.keys())
    ])


# Hilfsfunktion: Feedback generieren
def generate_kleine_grosse_feedback(kombinationen):
    """
    Generiert Feedback basierend auf den Kombinationen kleiner und großer Zahlen.
    """
    feedback = []
    if not kombinationen:
        return ["Es wurden keine Zahlen ausgewählt."]
    meistgewaehlte = max(kombinationen, key=kombinationen.get)
    feedback.append(f"Die häufigste Kombination ist {meistgewaehlte[0]} kleine und {meistgewaehlte[1]} große Zahlen mit {kombinationen[meistgewaehlte]} Scheinen.\n")
    return feedback


# Route: User-spezifische Analyse
# @analysis_routes.route('/user_kleingrossanalyse', methods=['POST'])
def user_kleingrossanalyse_route(user_scheine):
    """
    Führt eine Analyse kleiner und großer Zahlen für die Lottoscheine eines Users durch.
    """
    try:
        # User-Daten abrufen
        # user_scheine = request.json.get('scheine', [])
        if not user_scheine:
            return jsonify({'error': 'Keine Lottoscheine übergeben.'}), 400

        # Ergebnisse berechnen
        kombinationen = Counter()
        for schein in user_scheine:
            if len(schein) != 6:
                return jsonify({'error': f"Ungültiger Schein: {schein}"}), 400
            kombination = berechne_kleine_grosse_kombination(schein)
            kombinationen[kombination] += 1

        # Feedback generieren
        feedback = generate_kleine_grosse_feedback(kombinationen)
        #return jsonify({'feedback': feedback})
        return feedback
    except Exception as e:
        print(f"Fehler in der User-Kleingroßanalyse: {e}")
        return jsonify({'error': str(e)}), 500


# Route: Globale Analyse mit Visualisierung
@analysis_routes.route('/kleingrossanalyse')
@login_required_admin
def kleine_grosse_analyse_route():
    """
    Führt eine globale Analyse kleiner und großer Zahlen durch und erstellt eine Visualisierung.
    """
    try:
        plot_json = get_kleine_grosse_combined_plot()
        return jsonify({'kleingrossanalyse_plot': plot_json})
    except Exception as e:
        print(f"Fehler in der Analyse von kleinen und großen Zahlen: {e}")
        return jsonify({'error': str(e)}), 500


def get_kleine_grosse_combined_plot():
    """
    Führt eine globale Analyse kleiner und großer Zahlen durch und erstellt eine Visualisierung.
    """
    scheine = get_scheinexamples_from_db()

    # Ergebnisse berechnen
    kombinationen = Counter()
    total_scheine = len(scheine)

    for schein in scheine:
        zahlen = [schein.lottozahl1, schein.lottozahl2, schein.lottozahl3,
                  schein.lottozahl4, schein.lottozahl5, schein.lottozahl6]
        kombination = berechne_kleine_grosse_kombination(zahlen)
        kombinationen[kombination] += 1

    # Ergebnisse in Prozent umwandeln
    kombinationen_prozent = {
        kombi: (count / total_scheine) * 100 if total_scheine > 0 else 0
        for kombi, count in kombinationen.items()
    }

    # Daten für die Visualisierung vorbereiten
    kombinationen_df = vorbereiten_kleine_grosse_daten(kombinationen, kombinationen_prozent)

    # Balkendiagramm erstellen
    fig = go.Figure()
    for _, row in kombinationen_df.iterrows():
        fig.add_trace(go.Bar(
            x=[row["Label"]],
            y=[row["Prozent"]],
            name=row["Label"],
            hovertemplate=f"Kombination: {row['Label']}<br>Häufigkeit: {row['Häufigkeit']}<br>Prozent: {row['Prozent']:.2f}%<extra></extra>",
        ))

    # Layout des Plots
    fig.update_layout(
        title="Verteilung von kleinen (≤25) und großen (>25) Zahlen in Lottoscheinen",
        xaxis=dict(title="Kombinationen kleine/große Zahlen", showgrid=False),
        yaxis=dict(title="Prozent (%)", showgrid=True),
        template="plotly_white",
        showlegend=False
    )

    return json.loads(fig.to_json())