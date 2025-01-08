import pandas as pd
import json
from collections import Counter
from flask import request, jsonify
from . import analysis_routes, login_required_admin
from ..database import get_scheinexamples_from_db, get_lottoscheine_from_db, get_lottoscheine_letzte_woche
import plotly.express as px


def berechne_haeufigkeit(scheine):
    """
    Berechnet die Häufigkeit jeder Lottozahl in den gegebenen Scheinen.
    """
    zahlen = []
    for schein in scheine:
        if len(schein) != 6:
            raise ValueError("Jeder Schein muss genau 6 Zahlen enthalten.")
        zahlen.extend(schein)

    haeufigkeit = Counter(zahlen)
    return haeufigkeit

@analysis_routes.route('/dashboardStatics')
@login_required_admin
def beliebsteste_zahl():
    scheine = get_lottoscheine_letzte_woche()
    allescheine = get_lottoscheine_from_db()

    if not scheine:
        return jsonify({ "beliebtestezahl": "Null", "unbeliebteste" : "Null"})

    haeufigkeit = berechne_haeufigkeit(scheine)

    meistgewaehlte = max(haeufigkeit, key=haeufigkeit.get)
    wenigstegewaehlte = min(haeufigkeit, key=haeufigkeit.get)
    anzahl_scheine = len(scheine)
    anzahl_scheine_insgesamt = len(allescheine)
    
    return jsonify({ "beliebtestezahl": meistgewaehlte, "unbeliebteste" : wenigstegewaehlte, "anzahlScheineWoche" : anzahl_scheine, "scheineInsgesamt" : anzahl_scheine_insgesamt })

# Hilfsfunktion: Häufigkeitsdaten vorbereiten
def vorbereiten_haeufigkeitsdaten(haeufigkeit, gitter_size=7):
    """
    Bereitet die Häufigkeitsdaten für die Analyse und Visualisierung vor.
    """
    gitter_data = []
    for zahl, freq in haeufigkeit.items():
        zeile = (zahl - 1) // gitter_size
        spalte = (zahl - 1) % gitter_size
        gitter_data.append({'Zahl': zahl, 'Zeile': zeile + 1, 'Spalte': spalte + 1, 'Häufigkeit': freq})
    return pd.DataFrame(gitter_data)


# Hilfsfunktion: Feedback generieren
def generate_haeufigkeit_feedback(haeufigkeit):
    """
    Generiert ein textbasiertes Feedback basierend auf der Häufigkeit.
    """
    feedback = []
    if not haeufigkeit:
        return ["Keine Zahlen wurden ausgewählt."]
    meistgewaehlte = max(haeufigkeit, key=haeufigkeit.get)
    feedback.append(f"Die meistgewählte Zahl ist {meistgewaehlte} mit {haeufigkeit[meistgewaehlte]} Wahlen.\n")
    return feedback


# Route: User-spezifische Häufigkeitsanalyse
# @analysis_routes.route('/user_haeufigkeit', methods=['POST'])
def user_haeufigkeit_route(user_scheine):
    """
    Führt eine Häufigkeitsanalyse für die Lottoscheine eines Users durch.
    """
    try:
        # User-Daten abrufen
        # user_scheine = request.json.get('scheine', [])
        if not user_scheine:
            return jsonify({'error': 'Keine Lottoscheine übergeben.'}), 400
        
        haeufigkeit = berechne_haeufigkeit(user_scheine)

        # Feedback generieren
        feedback = generate_haeufigkeit_feedback(haeufigkeit)
        #return jsonify({'feedback': feedback})
        return feedback
    except Exception as e:
        print(f"Fehler in der User-Häufigkeitsanalyse: {e}")
        return jsonify({'error': str(e)}), 500


# Route: Globale Häufigkeitsanalyse mit Visualisierung
@analysis_routes.route('/haeufigkeit')
@login_required_admin
def lotto_haeufigkeit_route():
    """
    Führt eine globale Häufigkeitsanalyse durch und erstellt eine Visualisierung.
    """
    try:
        scatter_json = get_lottozahlen_haeufigkeit()
        return jsonify({'haeufigkeit_plot': scatter_json})
    except Exception as e:
        print(f"Fehler in der Häufigkeitsanalyse: {e}")
        return jsonify({'error': str(e)}), 500


def get_lottozahlen_haeufigkeit():
    """
    Führt eine globale Häufigkeitsanalyse durch und erstellt eine Visualisierung.
    """
    #scheine = get_scheinexamples_from_db() #Nur zum testen solange keine Studenten scheien abgegeben haben
    scheine = get_lottoscheine_from_db()

    # Häufigkeit berechnen
    haeufigkeit = berechne_haeufigkeit(scheine)

    # Häufigkeitsdaten vorbereiten
    gitter_data = vorbereiten_haeufigkeitsdaten(haeufigkeit)

    # Scatterplot erstellen
    scatter_fig = px.scatter(
        gitter_data,
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