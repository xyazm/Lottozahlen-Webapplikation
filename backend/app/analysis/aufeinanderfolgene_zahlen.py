import pandas as pd
from flask import request, jsonify
import json
import plotly.express as px
from . import analysis_routes, login_required_admin
from ..database import get_scheinexamples_from_db, get_lottoscheine_from_db, get_lottohistoric_from_db
from .chi_quadrat import chi_quadrat_reihen


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
            # Prüfen, ob alle Indizes dieser Sequenz schon verwendet wurden
            if any(i + j in used_indices for j in range(length)):
                continue
            # Prüfen, ob eine gültige Sequenz gefunden wird
            if all(sorted_numbers[i + j] == sorted_numbers[i] + j for j in range(length)):
                sequence_counts[f'Reihe_{length}'] += 1
                # Markiere alle Indizes dieser Sequenz als verwendet
                used_indices.update(i + j for j in range(length))
            print("Numbers:", numbers)
            print("Sorted Numbers:", sorted_numbers)
            print("Sequence Counts:", sequence_counts)

    return sequence_counts

# Hilfsfunktion: Feedback generieren
def generate_feedback(results):
    """
    Generiert textbasiertes Feedback für die Ergebnisse der Analyse.
    """
    feedback = []
    print("Results:", results)

    for index, result in enumerate(results, start=1):
        if 'error' in result:
            feedback.append(f"Schein {index}: {result['error']}")
            continue

        # Feedback für diesen Schein vorbereiten
        text = [
            f"{count} {reihenlaenge_labels.get(key, key)}"
            for key, count in result.items()
            if key.startswith('Reihe') and count > 0
        ]

        feedback.append(
            f"Schein {index}: " + (", ".join(text) if text else "Keine aufeinanderfolgende Zahlen.")
        )
        feedback.append('\n')  # Zeilenumbruch für Übersichtlichkeit

    return feedback


# Route: User-spezifische Analyse
# @analysis_routes.route('/user_aufeinanderfolgende_reihen', methods=['POST'])
def user_aufeinanderfolgende_reihen_route(user_scheine):
    """
    Analysiert die aufeinanderfolgenden Reihen in den vom User abgegebenen Scheinen.
    """
    try:
        if not user_scheine:
            return jsonify({'error': 'Keine Lottoscheine übergeben.'}), 400

        # Analyse durchführen
        results = []
        print("User Scheine Input:", user_scheine)
        total_reihen_counts = {f'Reihe_{i}': 0 for i in range(2, 7)}
        total_reihen_counts['Keine_Reihe'] = 0
        for index, schein in enumerate(user_scheine):
            if len(schein) != 6:
                results.append({'Schein_Index': index + 1, 'error': 'Ungültige Anzahl von Zahlen.'})
                continue
            sequence_counts = count_sequences(schein, range(2, 7))
            results.append({'Schein_Index': index + 1, **sequence_counts})

            # Zähle Fälle ohne Reihen
            if not any(sequence_counts.values()):
                total_reihen_counts['Keine_Reihe'] += 1
            else:
                for key, count in sequence_counts.items():
                    total_reihen_counts[key] += count
        
        chi_test = chi_quadrat_reihen(total_reihen_counts, len(user_scheine))
        feedback = generate_feedback(results)

        feedback.append(f"\nChi-Test Ergebnisse:\n{chi_test.replace("<br>", "")}")
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
        source = request.args.get('source', 'user')  # Standard ist 'user'

        if source == 'historic':

            scheine = get_lottohistoric_from_db()
        elif source == 'random':
            scheine= get_scheinexamples_from_db()
        else:
            scheine = get_lottoscheine_from_db()

        # Analyse durchführen
        results = []
        total_reihen_counts = {f'Reihe_{i}': 0 for i in range(2, 7)}

        for schein in scheine:
            zahlen = [schein.lottozahl1, schein.lottozahl2, schein.lottozahl3,
                      schein.lottozahl4, schein.lottozahl5, schein.lottozahl6]
            sequence_counts = count_sequences(zahlen, range(2, 7))
            for key, count in sequence_counts.items():
                total_reihen_counts[key] += count
            results.append({'Schein_ID': schein.id, **sequence_counts})

        # DataFrame erstellen
        df = pd.DataFrame(results)
        totals = df.drop(columns=['Schein_ID']).sum().reset_index()
        totals.columns = ['Reihenlänge', 'Total']
        averages = df.drop(columns=['Schein_ID']).mean().reset_index()
        averages.columns = ['Reihenlänge', 'Durchschnitt']
        summary = pd.merge(totals, averages, on='Reihenlänge')
        summary['Reihenlänge'] = summary['Reihenlänge'].map(reihenlaenge_labels)
        summary.fillna(0, inplace=True)

        chi_test = chi_quadrat_reihen(total_reihen_counts, len(scheine))

        # Visualisierung erstellen
        fig = px.bar(
            summary,
            x='Reihenlänge',
            y='Total',
            title=f'Anzahl und Durchschnitt aufeinanderfolgender Zahlen nach Reihenlänge<br><sub>{chi_test}</sub>',
            labels={'Reihenlänge': 'Reihenlänge (Anzahl aufeinanderfolgender Zahlen)', 'Total': 'Gesamtanzahl'},
            text='Total',
            hover_data={'Durchschnitt': ':.2f'},
        )
        fig.update_traces(textposition='outside')
        fig.update_layout(
            height = 600,
            )

        return jsonify({f'aufeinanderfolgende_reihen_plot_{source}': json.loads(fig.to_json())})
    except Exception as e:
        print(f"Fehler in der Analyse aufeinanderfolgender Zahlen: {e}")
        return jsonify({'error': str(e)}), 500