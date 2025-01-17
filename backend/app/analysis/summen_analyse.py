import pandas as pd
import json
from collections import Counter
from flask import request, jsonify
from . import analysis_routes, login_required_admin
from ..database import get_scheinexamples_from_db, get_lottoscheine_from_db
import plotly.graph_objects as go


# Hilfsfunktion: Summenkategorien definieren
def summenkategorien_definieren():
    """
    Gibt die Kategorien für die Summenanalyse zurück.
    """
    return [
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


# Hilfsfunktion: Kategorie bestimmen
def kategorie_bestimmen(summe, summenkategorien):
    """
    Bestimmt die Kategorie einer gegebenen Summe basierend auf den Kategorien.
    """
    for kategorie in summenkategorien:
        if kategorie["range"][0] <= summe <= kategorie["range"][1]:
            return kategorie["label"]
    return None


# Hilfsfunktion: Daten für Summenkategorien vorbereiten
def vorbereiten_summen_daten(summen_counter, summenkategorien, total_scheine):
    """
    Bereitet die Daten für die Visualisierung oder Feedback basierend auf Summenkategorien vor.
    """
    summen_prozent = {
        kategorie["label"]: (summen_counter.get(kategorie["label"], 0) / total_scheine) * 100 if total_scheine > 0 else 0
        for kategorie in summenkategorien
    }
    return pd.DataFrame([
        {
            "Kategorie": kategorie["label"],
            "Prozent": summen_prozent.get(kategorie["label"], 0),
            "Häufigkeit": summen_counter.get(kategorie["label"], 0),
        }
        for kategorie in summenkategorien
    ])


# Hilfsfunktion: Feedback generieren
def generate_summen_feedback(summen_counter):
    """
    Generiert Feedback zur Summenanalyse.
    """
    if not summen_counter:
        return ["Keine Summendaten vorhanden."]
    häufigste_kategorie = max(summen_counter, key=summen_counter.get)
    häufigkeit = summen_counter[häufigste_kategorie]
    return [f"Die häufigste Summenkategorie ist '{häufigste_kategorie}' mit {häufigkeit} Scheinen.\n"]


# Route: User-spezifische Summenanalyse
#@analysis_routes.route('/user_summenanalyse', methods=['POST'])
def user_summenanalyse_route(user_scheine):
    """
    Führt eine Summenanalyse für die Lottoscheine eines Users durch.
    """
    try:
        if not user_scheine:
            return jsonify({'error': 'Keine Lottoscheine übergeben.'}), 400

        # Summenkategorien definieren
        summenkategorien = summenkategorien_definieren()

        # Summen berechnen und kategorisieren
        summen_counter = Counter()
        for schein in user_scheine:
            if len(schein) != 6:
                return jsonify({'error': f"Ungültiger Schein: {schein}"}), 400
            summe = sum(schein)
            kategorie = kategorie_bestimmen(summe, summenkategorien)
            if kategorie:
                summen_counter[kategorie] += 1

        # Feedback generieren
        feedback = generate_summen_feedback(summen_counter)
        #return jsonify({'feedback': feedback})
        return feedback
    except Exception as e:
        print(f"Fehler in der User-Summenanalyse: {e}")
        return jsonify({'error': str(e)}), 500


# Route: Globale Summenanalyse mit Visualisierung
@analysis_routes.route('/summenanalyse')
@login_required_admin
def summenanalyse_route():
    """
    Führt eine globale Summenanalyse durch und erstellt eine Visualisierung.
    """
    try:
        plot_json = get_summen_combined_plot()
        return jsonify({'summenanalyse_plot': plot_json})
    except Exception as e:
        print(f"Fehler in der Summenanalyse: {e}")
        return jsonify({'error': str(e)}), 500


def get_summen_combined_plot():
    """
    Führt eine globale Summenanalyse durch und erstellt eine Visualisierung.
    """
    scheine = get_lottoscheine_from_db()

    # Summenkategorien definieren
    summenkategorien = summenkategorien_definieren()

    # Summen berechnen und kategorisieren
    summen_counter = Counter()
    total_scheine = len(scheine)

    for schein in scheine:
        zahlen = [schein.lottozahl1, schein.lottozahl2, schein.lottozahl3,
                  schein.lottozahl4, schein.lottozahl5, schein.lottozahl6]
        summe = sum(zahlen)
        kategorie = kategorie_bestimmen(summe, summenkategorien)
        if kategorie:
            summen_counter[kategorie] += 1

    # Daten vorbereiten
    summen_df = vorbereiten_summen_daten(summen_counter, summenkategorien, total_scheine)

    # Balkendiagramm erstellen
    fig = go.Figure()
    for _, row in summen_df.iterrows():
        fig.add_trace(go.Bar(
            x=[row["Kategorie"]],
            y=[row["Prozent"]],
            name=row["Kategorie"],
            hovertemplate=f"Kategorie: {row['Kategorie']}<br>Häufigkeit: {row['Häufigkeit']}<br>Prozent: {row['Prozent']:.2f}%<extra></extra>",
        ))

    # Layout des Plots
    fig.update_layout(
        title="Summenwerte der Lottoscheine",
        xaxis=dict(title="Summenkategorien", showgrid=False),
        yaxis=dict(title="Prozent (%)", showgrid=True),
        template="plotly_white",
        showlegend=False
    )

    return json.loads(fig.to_json())