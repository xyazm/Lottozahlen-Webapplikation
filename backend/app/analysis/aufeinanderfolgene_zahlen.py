import pandas as pd
from flask import request, jsonify
import json
import plotly.express as px
from . import analysis_routes, login_required_admin
from ..database import get_scheinexamples_from_db


reihenlaenge_labels = {
    'Reihe_2': 'Zwilling(e)',
    'Reihe_3': 'Drilling(e)',
    'Reihe_4': 'Vierling(e)',
    'Reihe_5': 'Fünfling(e)',
    'Reihe_6': 'Sechsling(e)',
}

# Hilfsfunktion: Sequenzen zählen
def count_sequences(numbers, sequence_lengths):
    """
    Zählt Sequenzen bestimmter Längen in einer Liste von Zahlen.
    Nur die längste Sequenz wird gezählt.
    Kürzere Sequenzen, die Teil einer längeren sind, werden ignoriert.
    """
    sorted_numbers = sorted(numbers)
    sequence_counts = {f'Reihe_{length}': 0 for length in sequence_lengths}

    used_indices = set()  # Verwendete Indizes merken, um Überlappungen zu vermeiden

    for length in sorted(sequence_lengths, reverse=True):  # Von längsten zu kürzesten Sequenzen
        for i in range(len(sorted_numbers) - length + 1):
            if i in used_indices:  # Überspringe bereits verwendete Zahlen
                continue
            if all(sorted_numbers[i + j] == sorted_numbers[i] + j for j in range(length)):
                sequence_counts[f'Reihe_{length}'] += 1
                # Markiere die Indizes dieser Sequenz als verwendet
                used_indices.update(range(i, i + length))

    return sequence_counts

# Hilfsfunktion: Feedback generieren
def generate_feedback(results):
    """
    Generiert textbasiertes Feedback für die Ergebnisse der Analyse.
    """
    feedback = []

    for index, result in enumerate(results, start=1):
        if 'error' in result:
            feedback.append(f"Schein {index}: {result['error']}")
            continue

        feedback.append(f"Schein {index}: ")
        text = []
        for key, count in result.items():
            if key.startswith('Reihe') and count > 0: 
                label = reihenlaenge_labels.get(key, key)
                text.append(f"{count} {label}")
        if len(text) > 1:
            feedback.append(", ".join(text))
        else:
            feedback.append(" Keine aufeinanderfolgende Zahlen.")
        feedback.append('\n')

    return feedback


# Route: User-spezifische Analyse
# @analysis_routes.route('/user_aufeinanderfolgende_reihen', methods=['POST'])
def user_aufeinanderfolgende_reihen_route(user_scheine):
    """
    Analysiert die aufeinanderfolgenden Reihen in den vom User abgegebenen Scheinen.
    """
    try:
        # Hole die Scheine des Users aus der Anfrage
        # user_scheine = request.json.get('scheine', [])
        if not user_scheine:
            return jsonify({'error': 'Keine Lottoscheine übergeben.'}), 400

        # Analyse durchführen
        results = []
        for index, schein in enumerate(user_scheine):
            zahlen = schein.get('numbers', [])
            if len(zahlen) != 6:
                results.append({'Schein_Index': index + 1, 'error': 'Ungültige Anzahl von Zahlen.'})
                continue
            sequence_counts = count_sequences(zahlen, range(2, 7))
            results.append({'Schein_Index': index + 1, **sequence_counts})

        feedback = generate_feedback(results)
        #return jsonify({'feedback': feedback})
        return feedback
    except Exception as e:
        print(f"Fehler in der User-Analyse aufeinanderfolgender Zahlen: {e}")
        return jsonify({'error': str(e)}), 500


# Route: Globale Analyse mit Visualisierung
@analysis_routes.route('/aufeinanderfolgende_reihen')
@login_required_admin
def aufeinanderfolgende_reihen_route():
    """
    Analysiert die aufeinanderfolgenden Reihen in allen Scheinen der Datenbank.
    """
    try:
        scheine = get_scheinexamples_from_db()

        # Analyse durchführen
        results = []
        for schein in scheine:
            zahlen = [schein.lottozahl1, schein.lottozahl2, schein.lottozahl3,
                      schein.lottozahl4, schein.lottozahl5, schein.lottozahl6]
            sequence_counts = count_sequences(zahlen, range(2, 7))
            results.append({'Schein_ID': schein.id, **sequence_counts})

        # DataFrame erstellen
        df = pd.DataFrame(results)
        summary = df.drop(columns=['Schein_ID']).mean().reset_index()
        summary.columns = ['Reihenlänge', 'Durchschnitt']

        summary['Reihenlänge'] = summary['Reihenlänge'].map(reihenlaenge_labels)

        # Visualisierung erstellen
        fig = px.bar(
            summary,
            x='Reihenlänge',
            y='Durchschnitt',
            title='Durchschnittliche Anzahl aufeinanderfolgender Zahlen nach Reihenlänge',
            labels={'Reihenlänge': 'Reihenlänge (Anzahl aufeinanderfolgender Zahlen)', 'Durchschnitt': 'Durchschnittliche Anzahl'},
            text='Durchschnitt'
        )
        fig.update_traces(textposition='outside')
        fig.update_layout(title_x=0.5)

        return jsonify({'aufeinanderfolgende_reihen_plot': json.loads(fig.to_json())})
    except Exception as e:
        print(f"Fehler in der Analyse aufeinanderfolgender Zahlen: {e}")
        return jsonify({'error': str(e)}), 500