import pandas as pd
import numpy as np
import plotly.graph_objects as go
import json
from collections import Counter
from . import analysis_routes
from flask import jsonify
from ..database import get_scheinexamples_from_db

@analysis_routes.route('/diagonaleanalyse')
def diagonaleanalyse():
    try:
        plot_json = get_diagonale_combined_plot()
        return jsonify({'diagonaleanalyse_plot': plot_json})
    except Exception as e:
        print(f"Fehler in der Diagonaleanalyse: {e}")
        return jsonify({'error': str(e)}), 500

def get_diagonale_combined_plot():
    scheine = get_scheinexamples_from_db()

    # 7x7 Gittergröße
    gitter_size = 7
    gitter = np.arange(1, gitter_size**2 + 1).reshape(gitter_size, gitter_size)

    # Farben für Diagonalenlängen definieren
    color_map = {
        3: "purple",
        4: "green",
        5: "orange",
        6: "blue",
        7: "red"
    }

    # Diagonalen kategorisieren
    def diagonalen_kategorisieren(matrix):
        n = matrix.shape[0]
        diagonalen = {k: [] for k in range(3, 8)}  # 3er bis 7er Diagonalen
        # Haupt- und Nebendiagonalen (7er)
        diagonalen[7].append([matrix[i, i] for i in range(n)])  # Hauptdiagonale
        diagonalen[7].append([matrix[i, n - i - 1] for i in range(n)])  # Nebendiagonale
        # Parallele Diagonalen (ab 3er)
        for k in range(1, n):
            if n - k >= 3:  # Ignoriere Diagonalen kleiner als 3
                diagonalen[n - k].extend([
                    [matrix[i, i + k] for i in range(n - k)],  # Oben rechts von Hauptdiagonale
                    [matrix[i + k, i] for i in range(n - k)],  # Unten links von Hauptdiagonale
                    [matrix[i, n - i - 1 - k] for i in range(n - k)],  # Oben links von Nebendiagonale
                    [matrix[i + k, n - i - 1] for i in range(n - k)]  # Unten rechts von Nebendiagonale
                ])
        return diagonalen

    # Funktion zum Berechnen von Sequenzen mit mindestens 2 aufeinanderfolgenden Zahlen
    def berechne_sequenzen(schein, diagonalen):
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

    # Diagonalen kategorisieren
    diagonalen = diagonalen_kategorisieren(gitter)

    # Ergebnisse sammeln
    gesamt_resultate = Counter()
    total_scheine = len(scheine)

    for schein in scheine:
        zahlen = [schein.lottozahl1, schein.lottozahl2, schein.lottozahl3,
                  schein.lottozahl4, schein.lottozahl5, schein.lottozahl6]
        gesamt_resultate += berechne_sequenzen(zahlen, diagonalen)

    # Durchschnittswerte berechnen
    durchschnitt = {k: gesamt_resultate[k] / total_scheine if total_scheine > 0 else 0 for k in range(3, 8)}

    # Scatter-Daten vorbereiten
    scatter_data = pd.DataFrame.from_dict(durchschnitt, orient='index', columns=['average'])
    scatter_data.reset_index(inplace=True)
    scatter_data.rename(columns={'index': 'length'}, inplace=True)

    # Subplots erstellen
    fig = go.Figure()

    # Balkendiagramm (links)
    for length in scatter_data['length']:
        avg = scatter_data.loc[scatter_data['length'] == length, 'average'].values[0]
        fig.add_trace(go.Bar(
            x=[f"{length}er"],
            y=[avg],
            marker=dict(color=color_map[length]),  # Farbe basierend auf der Länge
            name=f"{length}er-Diagonalen",
            hovertemplate=f"Länge: {length}<br>Durchschnitt: {avg:.2f}<extra></extra>",
            xaxis="x1",
            yaxis="y1"
        ))

    # Gitter-Plot (rechts)
    for laenge, diag_list in diagonalen.items():
        for diag in diag_list:
            x = [(zahl - 1) % gitter_size + 1 for zahl in diag]
            y = [(zahl - 1) // gitter_size + 1 for zahl in diag]
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

    # JSON für Plot zurückgeben
    return json.loads(fig.to_json())