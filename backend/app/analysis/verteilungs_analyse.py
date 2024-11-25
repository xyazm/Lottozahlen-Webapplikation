import pandas as pd
import numpy as np
from flask import jsonify
import json
import plotly.express as px
from . import analysis_routes
from ..database import get_scheinexamples_from_db

@analysis_routes.route('/verteilungsanalyse')
def verteilungsanalyse():
    try:
        plot_data = analyse_verteilung_und_distanz()
        return jsonify({'verteilungsanalyse_plot': plot_data})
    except Exception as e:
        print(f"Fehler in der Verteilungsanalyse: {e}")
        return jsonify({'error': str(e)}), 500

def analyse_verteilung_und_distanz():
    scheine = get_scheinexamples_from_db()

    # Ergebnis für alle Scheine
    ergebnisse = []

    for schein in scheine:
        zahlen = [schein.lottozahl1, schein.lottozahl2, schein.lottozahl3, 
                  schein.lottozahl4, schein.lottozahl5, schein.lottozahl6]
        
        # Gitter erstellen und Positionen berechnen
        gitter = np.zeros((7, 7), dtype=int)
        positionen = []
        for zahl in zahlen:
            zeile = (zahl - 1) // 7
            spalte = (zahl - 1) % 7
            gitter[zeile, spalte] = 1
            positionen.append((zeile, spalte))

        # Zeilen- und Spaltenauswertung
        zeilen_count = gitter.sum(axis=1)
        spalten_count = gitter.sum(axis=0)
        
        # Standardabweichung der Verteilung
        zeilen_std = np.std(zeilen_count)
        spalten_std = np.std(spalten_count)

        # Paarweise Distanzen berechnen (euklidisch)
        paarweise_distanzen = []
        for i, (z1, s1) in enumerate(positionen):
            for j, (z2, s2) in enumerate(positionen):
                if i < j:
                    distanz = np.sqrt((z2 - z1)**2 + (s2 - s1)**2)
                    paarweise_distanzen.append(distanz)

        durchschnittliche_distanz = np.mean(paarweise_distanzen) if paarweise_distanzen else 0

        # Quadrantenanalyse
        quadranten = {
            'Q1': 0, 'Q2': 0, 'Q3': 0, 'Q4': 0
        }
        for z, s in positionen:
            if z < 3 and s < 3:
                quadranten['Q1'] += 1
            elif z < 3 and s >= 3:
                quadranten['Q2'] += 1
            elif z >= 3 and s < 3:
                quadranten['Q3'] += 1
            else:
                quadranten['Q4'] += 1

        quadranten_std = np.std(list(quadranten.values()))

        ergebnisse.append({
            'Zeilen_STD': zeilen_std,
            'Spalten_STD': spalten_std,
            'Durchschnittliche_Distanz': durchschnittliche_distanz,
            'Quadranten_STD': quadranten_std
        })

    # Durchschnittswerte über alle Scheine berechnen
    df = pd.DataFrame(ergebnisse)
    summary = df.mean().reset_index()
    summary.columns = ['Metrik', 'Durchschnittswert']

    # Kurze Hover-Beschreibungen für die Metriken
    hover_texts = {
        'Zeilen_STD': 'Standardabweichung der Zahlen auf Zeilen (niedrig = gleichmäßige Verteilung)',
        'Spalten_STD': 'Standardabweichung der Zahlen auf Spalten (niedrig = gleichmäßige Verteilung)',
        'Durchschnittliche_Distanz': 'Mittlere Distanz zwischen gewählten Zahlen (hoch = weit verstreut)',
        'Quadranten_STD': 'Standardabweichung der Zahlen in Quadranten (niedrig = gleichmäßig verteilt)'
    }
    summary['Beschreibung'] = summary['Metrik'].map(hover_texts)

    # Visualisierung mit Plotly
    fig = px.bar(
        summary,
        x='Metrik',
        y='Durchschnittswert',
        title='Analyse der Verteilung und Distanz der Zahlen auf dem Gitter',
        labels={'Metrik': 'Metrik', 'Durchschnittswert': 'Wert'},
        text='Durchschnittswert',
        hover_data={'Beschreibung': True}  # Fügt die Beschreibung beim Hover hinzu
    )
    fig.update_traces(textposition='outside')
    fig.update_layout(title_x=0.5)

    return json.loads(fig.to_json())


# Titel: Analyse der Verteilung und Distanz der Zahlen auf dem Gitter

# Ziel der Analyse:

# Diese Analyse untersucht, wie die Zahlen in den Lottoscheinen auf dem 7x7-Gitter verteilt sind. Dabei werden verschiedene Metriken betrachtet, um zu analysieren, ob die Spieler dazu tendieren, ihre Zahlen gleichmäßig zu verteilen oder ob Muster wie Cluster (enger beieinanderliegende Zahlen) entstehen.

# Metriken im Diagramm:

# 	1.	Zeilen_STD (Standardabweichung der Zeilenverteilung):
# 	•	Was bedeutet das?
# Diese Metrik misst, wie ungleichmäßig die Zahlen über die Zeilen des Gitters verteilt sind.
# 	•	Eine niedrige Standardabweichung deutet darauf hin, dass die Zahlen gleichmäßig auf die Zeilen verteilt sind.
# 	•	Eine hohe Standardabweichung zeigt, dass einige Zeilen viel häufiger genutzt werden als andere.
# 	•	Wert im Diagramm: 0,78
# 	•	Dieser Wert zeigt eine relativ gleichmäßige Verteilung der Zahlen auf die Zeilen.
# 	2.	Spalten_STD (Standardabweichung der Spaltenverteilung):
# 	•	Was bedeutet das?
# Ähnlich wie bei den Zeilen wird hier gemessen, wie ungleichmäßig die Zahlen auf die Spalten verteilt sind.
# 	•	Eine niedrige Standardabweichung bedeutet, dass die Zahlen gleichmäßig über die Spalten verteilt sind.
# 	•	Eine hohe Standardabweichung deutet darauf hin, dass bestimmte Spalten häufiger genutzt werden.
# 	•	Wert im Diagramm: 0,78
# 	•	Dieser Wert ist ähnlich wie bei den Zeilen und deutet darauf hin, dass die Spieler die Spalten tendenziell gleichmäßig nutzen.
# 	3.	Durchschnittliche_Distanz (Paarweise Distanz):
# 	•	Was bedeutet das?
# Diese Metrik berechnet die durchschnittliche Distanz zwischen allen gewählten Zahlen in einem Schein.
# 	•	Eine hohe Distanz zeigt, dass die Zahlen weit verstreut sind (z. B. gleichmäßige Verteilung).
# 	•	Eine niedrige Distanz deutet darauf hin, dass die Zahlen dichter beieinanderliegen (z. B. Clusterbildung).
# 	•	Wert im Diagramm: 3,68
# 	•	Der relativ hohe Wert deutet darauf hin, dass die Spieler oft versuchen, ihre Zahlen gleichmäßig auf dem Gitter zu verteilen.
# 	4.	Quadranten_STD (Standardabweichung der Quadrantenverteilung):
# 	•	Was bedeutet das?
# Hier wird geprüft, wie die Zahlen auf die vier Quadranten des Gitters verteilt sind.
# 	•	Eine niedrige Standardabweichung bedeutet, dass die Zahlen gleichmäßig auf alle vier Quadranten verteilt sind.
# 	•	Eine hohe Standardabweichung zeigt, dass manche Quadranten häufiger genutzt werden als andere.
# 	•	Wert im Diagramm: 0,97
# 	•	Dieser Wert zeigt eine leichte Ungleichmäßigkeit in der Verteilung der Zahlen auf die Quadranten. Es gibt also Hinweise, dass Spieler bestimmte Quadranten bevorzugen könnten.

# Interpretation der Ergebnisse:

# 	1.	Verteilung auf Zeilen und Spalten:
# 	•	Mit einem Standardabweichungswert von etwa 0,78 zeigt die Analyse, dass Spieler dazu neigen, die Zahlen recht gleichmäßig auf die Zeilen und Spalten des Gitters zu verteilen. Es gibt keine starken Präferenzen für bestimmte Zeilen oder Spalten.
# 	2.	Paarweise Distanz:
# 	•	Die durchschnittliche Distanz von 3,68 zeigt, dass Spieler versuchen, ihre Zahlen im Gitter zu verstreuen, anstatt sie eng beieinander zu platzieren. Dies könnte eine bewusste Strategie sein, um “zufälliger” auszuwählen oder verschiedene Muster abzudecken.
# 	3.	Quadrantenverteilung:
# 	•	Die leichte Ungleichmäßigkeit in der Quadrantenverteilung (0,97) deutet darauf hin, dass manche Quadranten möglicherweise bevorzugt werden. Dies könnte darauf hindeuten, dass Spieler bestimmte Regionen des Gitters visuell oder intuitiv bevorzugen.

# Fazit:

# Die Analyse zeigt, dass Spieler tendenziell versuchen, ihre Zahlen relativ gleichmäßig auf dem Gitter zu verteilen, sowohl in Zeilen, Spalten als auch über größere Distanzen. Es gibt jedoch leichte Tendenzen zur Clusterbildung in bestimmten Quadranten.
