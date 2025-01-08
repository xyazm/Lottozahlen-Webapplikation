import pandas as pd
import numpy as np
import json
from collections import Counter
import plotly.graph_objects as go
from flask import request, jsonify
from . import analysis_routes, login_required_admin
from ..database import get_scheinexamples_from_db

# Hilfsfunktion: Diagonalen kategorisieren
def diagonalen_kategorisieren():
    """
    Kategorisiert Diagonalen eines 7x7-Gitters basierend auf ihrer Länge.
    """
    gitter_size = 7
    matrix = np.arange(1, gitter_size**2 + 1).reshape(gitter_size, gitter_size)
    n = matrix.shape[0]
    diagonalen = {k: [] for k in range(3, 8)}  # Diagonalen von Länge 3 bis 7

    # Haupt- und Nebendiagonalen
    diagonalen[7].append([matrix[i, i] for i in range(n)])  # Hauptdiagonale
    diagonalen[7].append([matrix[i, n - i - 1] for i in range(n)])  # Nebendiagonale

    # Parallele Diagonalen
    for k in range(1, n):
        if n - k >= 3:
            diagonalen[n - k].extend([
                [matrix[i, i + k] for i in range(n - k)],  # Oben rechts
                [matrix[i + k, i] for i in range(n - k)],  # Unten links
                [matrix[i, n - i - 1 - k] for i in range(n - k)],  # Oben links
                [matrix[i + k, n - i - 1] for i in range(n - k)]  # Unten rechts
            ])
    return diagonalen


# Hilfsfunktion: Sequenzen berechnen
def berechne_sequenzen(schein, diagonalen):
    """
    Berechnet Treffer von Zahlen in den Diagonalen.
    """
    result = Counter()
    for laenge, diag_list in diagonalen.items():
        for diag in diag_list:
            count = 0
            for i in range(len(diag) - 1):
                if diag[i] in schein and diag[i + 1] in schein:
                    count += 1
            if count > 0:
                result[laenge] += count
    return result


# Hilfsfunktion: Feedback generieren
def generate_user_feedback(results):
    """
    Generiert Feedback für die User-Diagonalenanalyse.
    """
    feedback = []
    for index, result in enumerate(results, start=1):
        if not result:
            feedback.append(f"Schein {index}: Keine Treffer in Diagonalen.")
        else:
            details = [f"{count} Treffer in {length}-er Diagonalen" for length, count in result.items()]
            feedback.append(f"Schein {index}: {', '.join(details)}")
        feedback.append('\n')
    return feedback


# Route: User-spezifische Diagonalenanalyse
# @analysis_routes.route('/user_diagonaleanalyse', methods=['POST'])
def user_diagonaleanalyse_route(user_scheine):
    """
    Analysiert die Diagonalen der Lottoscheine eines Users.
    """
    try:
        # User-Daten abrufen
        # user_scheine = request.json.get('scheine', [])
        if not user_scheine:
            return jsonify({'error': 'Keine Lottoscheine übergeben.'}), 400

        diagonalen = diagonalen_kategorisieren()

        # Ergebnisse berechnen
        results = []
        for schein in user_scheine:
            if len(schein) != 6:
                results.append({})
                continue
            results.append(berechne_sequenzen(schein, diagonalen))

        # Feedback generieren
        feedback = generate_user_feedback(results)
        #return jsonify({'feedback': feedback})
        return feedback
    except Exception as e:
        print(f"Fehler in der User-Diagonalenanalyse: {e}")
        return jsonify({'error': str(e)}), 500


# Route: Globale Diagonalenanalyse mit Visualisierung
@analysis_routes.route('/diagonaleanalyse')
@login_required_admin
def diagonaleanalyse_route():
    """
    Führt die globale Diagonalenanalyse durch und erstellt eine Visualisierung.
    """
    try:
        plot_json = get_diagonale_combined_plot()
        return jsonify({'diagonaleanalyse_plot': plot_json})
    except Exception as e:
        print(f"Fehler in der Diagonaleanalyse: {e}")
        return jsonify({'error': str(e)}), 500


def get_diagonale_combined_plot():
    """
    Erstellt eine Visualisierung der globalen Diagonalenanalyse.
    """
    scheine = get_scheinexamples_from_db()
    diagonalen = diagonalen_kategorisieren()

    # Ergebnisse sammeln
    gesamt_resultate = Counter()
    total_scheine = len(scheine)

    for schein in scheine:
        zahlen = [schein.lottozahl1, schein.lottozahl2, schein.lottozahl3,
                  schein.lottozahl4, schein.lottozahl5, schein.lottozahl6]
        gesamt_resultate += berechne_sequenzen(zahlen, diagonalen)

    # Durchschnittswerte berechnen
    durchschnitt = {k: gesamt_resultate[k] / total_scheine if total_scheine > 0 else 0 for k in range(3, 8)}

    # Balkendiagramm erstellen
    scatter_data = pd.DataFrame.from_dict(durchschnitt, orient='index', columns=['average'])
    scatter_data.reset_index(inplace=True)
    scatter_data.rename(columns={'index': 'length'}, inplace=True)

    color_map = {
        3: "purple",
        4: "green",
        5: "orange",
        6: "blue",
        7: "red"
    }

    fig = go.Figure()

    # Balkendiagramm (links)
    for length in scatter_data['length']:
        avg = scatter_data.loc[scatter_data['length'] == length, 'average'].values[0]
        fig.add_trace(go.Bar(
            x=[f"{length}er"],
            y=[avg],
            marker=dict(color=color_map[length]),
            name=f"{length}er-Diagonalen",
            hovertemplate=f"Länge: {length}<br>Durchschnitt: {avg:.2f}<extra></extra>",
            xaxis="x1",
            yaxis="y1"
        ))

    # Gitter-Plot (rechts)
    for laenge, diag_list in diagonalen.items():
        for diag in diag_list:
            x = [(zahl - 1) % 7 + 1 for zahl in diag]
            y = [(zahl - 1) // 7 + 1 for zahl in diag]
            fig.add_trace(go.Scatter(
                x=x,
                y=y,
                mode='lines',
                line=dict(color=color_map[laenge], width=4),  # Farbe basierend auf der Länge
                xaxis="x2",
                yaxis="y2"
            ))

    # Layout mit zwei Subplots
    fig.update_layout(
        title="Durchschnittlich vollständige Treffer pro Diagonalenlänge",
        xaxis=dict(domain=[0, 0.45], title="Diagonalenlänge", showgrid=False),
        yaxis=dict(title="Durchschnittliche Treffer"),
        xaxis2=dict(domain=[0.55, 1], title="7x7 Gitter", showgrid=False),
        yaxis2=dict(scaleanchor="x2", title="Zeile", showgrid=False),
        template="plotly_white",
        showlegend=False
    )

    return json.loads(fig.to_json())