import pandas as pd
import numpy as np
import json
from flask import request, jsonify
from . import analysis_routes, login_required_admin
from ..database import get_scheinexamples_from_db, get_lottoscheine_from_db, get_lottohistoric_from_db
import plotly.express as px
from .chi_quadrat import chi_quadrat_gitter


# Hilfsfunktion: Gitter erstellen
def erstelle_gitter(zahlen, gitter_size=7):
    """
    Erstellt ein 7x7-Gitter basierend auf den gegebenen Zahlen.
    """
    gitter = np.zeros((gitter_size, gitter_size), dtype=int)
    for zahl in zahlen:
        zeile = (zahl - 1) // gitter_size
        spalte = (zahl - 1) % gitter_size
        gitter[zeile, spalte] = 1
    return gitter


# Hilfsfunktion: Zeilen- und Spaltenanalyse
def analysiere_gitter(gitter):
    """
    Analysiert die Anzahl der ausgewählten Zahlen in den Zeilen und Spalten des Gitters.
    """
    zeilen_count = gitter.sum(axis=1)
    spalten_count = gitter.sum(axis=0)
    return zeilen_count, spalten_count


# Hilfsfunktion: Feedback generieren
def generate_gitter_feedback(results, zeilen_count, spalten_count):
    """
    Generiert Feedback für die User-Gitteranalyse.
    Gibt nur die Zeilen und Spalten mit den meisten gewählten Zahlen aus.
    """
    feedback = []
    for index, result in enumerate(results, start=1):
        # Fehler abfangen
        if 'error' in result:
            feedback.append(f"Schein {index}: {result['error']}\n")
            continue

       # Maximale Anzahl in Zeilen und Spalten finden
        max_zeilen = max(result['zeilen'])
        max_spalten = max(result['spalten'])

        # Ignoriere geringe Maximalwerte (1 oder 2)
        if max_zeilen <= 2:
            zeilen_text = []  # Keine relevanten Zeilen
        else:
            # Zeilen mit maximaler Anzahl auswählen
            zeilen_text = [
                f"Zeile {i + 1}: {anzahl} gewählte Zahl(en)\n"
                for i, anzahl in enumerate(result['zeilen'])
                if anzahl == max_zeilen
            ]

        if max_spalten <= 2:
            spalten_text = []  # Keine relevanten Spalten
        else:
            # Spalten mit maximaler Anzahl auswählen
            spalten_text = [
                f"Spalte {i + 1}: {anzahl} gewählte Zahl(en)\n"
                for i, anzahl in enumerate(result['spalten'])
                if anzahl == max_spalten
            ]

        # Feedback für den Schein nur hinzufügen, wenn relevante Daten existieren
        if zeilen_text or spalten_text:
            feedback.append(
                f"Schein {index}:\n" +
                "".join(zeilen_text + spalten_text)
            )
    feedback.append(chi_quadrat_gitter(zeilen_count, spalten_count).replace("<br>", ""))
    return feedback


# Route: User-spezifische Gitteranalyse
# @analysis_routes.route('/user_gitteranalyse', methods=['POST'])
def user_gitteranalyse_route(user_scheine):
    """
    Führt eine Gitteranalyse für die Lottoscheine eines Users durch.
    """
    try:
        # User-Daten abrufen
        # user_scheine = request.json.get('scheine', [])
        if not user_scheine:
            return jsonify({'error': 'Keine Lottoscheine übergeben.'}), 400

        # Ergebnisse berechnen
        results = []
        for schein in user_scheine:
            if len(schein) != 6:
                results.append({'error': 'Ungültige Anzahl von Zahlen.'})
                continue

            gitter = erstelle_gitter(schein)
            zeilen_count, spalten_count = analysiere_gitter(gitter)
            results.append({'zeilen': zeilen_count.tolist(), 'spalten': spalten_count.tolist()})

        # Feedback generieren
        feedback = generate_gitter_feedback(results, zeilen_count, spalten_count)
        #return jsonify({'feedback': feedback})
        return feedback
    except Exception as e:
        print(f"Fehler in der User-Gitteranalyse: {e}")
        return jsonify({'error': str(e)}), 500

@analysis_routes.route('/gitteranalyse')
@login_required_admin
def get_gitteranalyse():
    """
    Führt die Gitteranalyse für alle Scheine in der Datenbank durch und erstellt eine Visualisierung.
    """
    source = request.args.get('source', 'user')
    if source == 'historic':
        scheine = get_lottohistoric_from_db()
    elif source == 'random':
        scheine= get_scheinexamples_from_db()
    else:
        scheine = get_lottoscheine_from_db()
    ergebnisse = []
    gesamt_zeilen_count = np.zeros(7, dtype=int)
    gesamt_spalten_count = np.zeros(7, dtype=int)

    for schein in scheine:
        zahlen = [schein.lottozahl1, schein.lottozahl2, schein.lottozahl3, 
                  schein.lottozahl4, schein.lottozahl5, schein.lottozahl6]
        gitter = erstelle_gitter(zahlen)
        zeilen_count, spalten_count = analysiere_gitter(gitter)

        gesamt_zeilen_count += zeilen_count
        gesamt_spalten_count += spalten_count

        for i in range(7):
            ergebnisse.append({
                'Zeile': f'Zeile_{i + 1}',
                'Anzahl_Gewählte_Zahlen': zeilen_count[i],
                'Art': 'Zeile',
                'Index': i + 1
            })
            ergebnisse.append({
                'Spalte': f'Spalte_{i + 1}',
                'Anzahl_Gewählte_Zahlen': spalten_count[i],
                'Art': 'Spalte',
                'Index': i + 1
            })

    # Ergebnisse in DataFrame umwandeln
    df = pd.DataFrame(ergebnisse)
    trend_data = df.groupby(['Index', 'Art'])['Anzahl_Gewählte_Zahlen'].mean().reset_index()

    chi_test = chi_quadrat_gitter(gesamt_zeilen_count, gesamt_spalten_count)

    # Visualisierung erstellen
    combined_fig = px.scatter(
        trend_data, 
        x='Index', 
        y='Anzahl_Gewählte_Zahlen',
        color='Art',
        title="Durchschnittliche Anzahl ausgewählter Zahlen pro Zeile und Spalte<br><sub>{}</sub>".format(chi_test),
        labels={'Index': 'Position', 'Anzahl_Gewählte_Zahlen': 'Durchschnittliche Anzahl gewählter Zahlen'}
    )

    return jsonify({f'gitteranalyse_plot_{source}': json.loads(combined_fig.to_json())})