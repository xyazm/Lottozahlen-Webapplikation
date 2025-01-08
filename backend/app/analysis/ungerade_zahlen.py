import pandas as pd
import numpy as np
import json
from collections import Counter
from flask import request, jsonify
from . import analysis_routes, login_required_admin
from ..database import get_scheinexamples_from_db
import plotly.graph_objects as go


# Hilfsfunktion: Gerade/Ungerade Kombinationen berechnen
def berechne_gerade_ungerade_kombinationen(schein):
    """
    Berechnet die Anzahl der geraden und ungeraden Zahlen in einem Lottoschein.
    """
    gerade = sum(1 for zahl in schein if zahl % 2 == 0)
    ungerade = len(schein) - gerade
    return (gerade, ungerade)


# Hilfsfunktion: Prozentsätze berechnen
def berechne_prozente(scheine):
    """
    Berechnet die Prozentsätze gerader und ungerader Zahlen für eine Liste von Scheinen.
    """
    gerade_prozente = []
    ungerade_prozente = []

    for schein in scheine:
        gerade, ungerade = berechne_gerade_ungerade_kombinationen(schein)
        gerade_prozente.append((gerade / len(schein)) * 100)
        ungerade_prozente.append((ungerade / len(schein)) * 100)

    return np.mean(gerade_prozente) if gerade_prozente else 0, np.mean(ungerade_prozente) if ungerade_prozente else 0


# Hilfsfunktion: Daten für Visualisierung vorbereiten
def vorbereiten_gerade_ungerade_daten(kombinationen, total_scheine):
    """
    Bereitet die Daten für die Visualisierung der Kombinationen vor.
    """
    kombinationen_prozent = {
        kombi: (count / total_scheine) * 100 if total_scheine > 0 else 0
        for kombi, count in kombinationen.items()
    }
    return pd.DataFrame([
        {'label': f"{k[0]}/{k[1]}", 'prozent': v}
        for k, v in kombinationen_prozent.items()
    ]).sort_values(by='label')


# Hilfsfunktion: Feedback generieren
def generate_gerade_ungerade_feedback(kombinationen):
    """
    Generiert Feedback basierend auf der Analyse von geraden und ungeraden Zahlen.
    """
    if not kombinationen:
        return ["Es wurden keine Kombinationen gefunden."]
    häufigste_kombination = max(kombinationen, key=kombinationen.get)
    häufigkeit = kombinationen[häufigste_kombination]
    return [f"Die häufigste Kombination ist {häufigste_kombination[0]} gerade und {häufigste_kombination[1]} ungerade mit {häufigkeit} Scheinen.\n"]


# Route: User-spezifische Gerade/Ungerade-Analyse
#@analysis_routes.route('/user_ungeradeanalyse', methods=['POST'])
def user_ungeradeanalyse_route(user_scheine):
    """
    Führt eine Gerade/Ungerade-Analyse für die Lottoscheine eines Users durch.
    """
    try:
        # User-Daten abrufen
        if not user_scheine:
            return jsonify({'error': 'Keine Lottoscheine übergeben.'}), 400

        # Ergebnisse berechnen
        kombinationen = Counter()
        for schein in user_scheine:
            if len(schein) != 6:
                return jsonify({'error': f"Ungültiger Schein: {schein}"}), 400
            kombination = berechne_gerade_ungerade_kombinationen(schein)
            kombinationen[kombination] += 1

        # Feedback generieren
        feedback = generate_gerade_ungerade_feedback(kombinationen)
        #return jsonify({'feedback': feedback})
        return feedback
    except Exception as e:
        print(f"Fehler in der User-Gerade/Ungerade-Analyse: {e}")
        return jsonify({'error': str(e)}), 500


# Route: Globale Gerade/Ungerade-Analyse mit Visualisierung
@analysis_routes.route('/ungeradeanalyse')
@login_required_admin
def gerade_ungerade_analyse_route():
    """
    Führt eine globale Gerade/Ungerade-Analyse durch und erstellt eine Visualisierung.
    """
    try:
        plot_json = get_gerade_ungerade_plot()
        return jsonify({'ungeradeanalyse_plot': plot_json})
    except Exception as e:
        print(f"Fehler in der Analyse für gerade und ungerade Zahlen: {e}")
        return jsonify({'error': str(e)}), 500


def get_gerade_ungerade_plot():
    """
    Führt eine globale Gerade/Ungerade-Analyse durch und erstellt eine Visualisierung.
    """
    scheine = get_scheinexamples_from_db()
    total_scheine = len(scheine)

    # Kombinationen berechnen
    kombinationen = Counter()
    for schein in scheine:
        zahlen = [schein.lottozahl1, schein.lottozahl2, schein.lottozahl3,
                  schein.lottozahl4, schein.lottozahl5, schein.lottozahl6]
        kombination = berechne_gerade_ungerade_kombinationen(zahlen)
        kombinationen[kombination] += 1

    # Durchschnittswerte berechnen
    durchschnitt_gerade, durchschnitt_ungerade = berechne_prozente(
        [[schein.lottozahl1, schein.lottozahl2, schein.lottozahl3,
          schein.lottozahl4, schein.lottozahl5, schein.lottozahl6]
         for schein in scheine]
    )

    # Daten für Visualisierung vorbereiten
    kombinationen_df = vorbereiten_gerade_ungerade_daten(kombinationen, total_scheine)

    # Balkendiagramm erstellen
    fig = go.Figure()
    for _, row in kombinationen_df.iterrows():
        fig.add_trace(go.Bar(
            x=[row['label']],
            y=[row['prozent']],
            name=f"{row['label']}",
            hovertemplate=f"Kombination: {row['label']}<br>Prozent: {row['prozent']:.2f}%<extra></extra>",
        ))

    # Durchschnittswerte hinzufügen
    fig.add_trace(go.Bar(
        x=["Durchschnitt Gerade"],
        y=[durchschnitt_gerade],
        name="Durchschnitt Gerade",
        marker=dict(color="blue"),
        hovertemplate=f"Durchschnitt Gerade: {durchschnitt_gerade:.2f}%<extra></extra>",
    ))

    fig.add_trace(go.Bar(
        x=["Durchschnitt Ungerade"],
        y=[durchschnitt_ungerade],
        name="Durchschnitt Ungerade",
        marker=dict(color="orange"),
        hovertemplate=f"Durchschnitt Ungerade: {durchschnitt_ungerade:.2f}%<extra></extra>",
    ))

    # Layout des Plots
    fig.update_layout(
        title="Analyse der Kombination von geraden und ungeraden Zahlen",
        xaxis=dict(title="Kombination gerade/ungerade", showgrid=False),
        yaxis=dict(title="Prozent (%)", showgrid=True),
        template="plotly_white",
        showlegend=False
    )

    return json.loads(fig.to_json())