# app/analyse.py
import itertools
import math
from .database import *
from collections import Counter
import plotly.express as px
import plotly.graph_objects as go
import pandas as pd
import numpy as np
from sympy import primerange
import json
from flask import jsonify, Blueprint

analysis_routes = Blueprint('analysis', __name__)

# Häufigkeit der Lottozahlen
def get_lottozahlen_haeufigkeit():
    scheine = get_scheinexamples_from_db()
    zahlen = [zahl for schein in scheine for zahl in [
        schein.lottozahl1, schein.lottozahl2, schein.lottozahl3,
        schein.lottozahl4, schein.lottozahl5, schein.lottozahl6
    ]]
    haeufigkeit_df = pd.DataFrame(Counter(zahlen).items(), columns=['Zahl', 'Häufigkeit'])

    # Erstellen des Plotly-Balkendiagramms
    fig_haeufigkeit = px.bar(haeufigkeit_df, x='Zahl', y='Häufigkeit', title='Häufigkeit der Lottozahlen',
                labels={'Zahl': 'Lottozahl', 'Häufigkeit': 'Anzahl der Vorkommen'})
    
    haeufigkeit = Counter(zahlen)
    gitter_data = []
    for zahl, haeufigkeit in haeufigkeit.items():
        zeile = (zahl - 1) // 7  # Berechnet die Zeile im 7x7 Gitter
        spalte = (zahl - 1) % 7  # Berechnet die Spalte im 7x7 Gitter
        gitter_data.append({'Zahl': zahl, 'Zeile': zeile + 1, 'Spalte': spalte + 1, 'Häufigkeit': haeufigkeit})

    # In DataFrame umwandeln für einfache Visualisierung
    gitter_df = pd.DataFrame(gitter_data)

    # 2. Scatterplot zur Darstellung der Häufigkeit der Lottozahlen auf dem 7x7-Gitter
    scatter_fig = px.scatter(
        gitter_df, 
        x='Spalte', 
        y='Zeile', 
        size='Häufigkeit', 
        color='Häufigkeit', 
        text='Zahl', 
        title='Beliebtheit der Felder im 7x7-Gitter (Scatterplot)',
        labels={'Spalte': 'Spalte (1-7)', 'Zeile': 'Zeile (1-7)', 'Häufigkeit': 'Anzahl der Wahlen'},
        color_continuous_scale='Viridis'
    )
    scatter_fig.update_yaxes(autorange="reversed")  # Gitter von oben nach unten ausrichten
    scatter_fig.update_traces(
        textposition='middle center',
        hovertemplate='<b>Zahl %{text}</b><br>Häufigkeit: %{marker.size}<extra></extra>' 
    ) 

    return json.loads(scatter_fig.to_json()), json.loads(fig_haeufigkeit.to_json())


@analysis_routes.route('/haeufigkeit')
def lotto_haeufigkeit():
    try:
        haeufigkeit_json, scatter_json = get_lottozahlen_haeufigkeit()
        return jsonify({
            'haeufigkeit_plot': haeufigkeit_json,
            'scatter_plot': scatter_json
            })
    except Exception as e:
        print(f"Fehler in der Häufigkeitsanalyse: {e}")
        return jsonify({'error': str(e)}), 500


# Runde Zahlen
def anzahl_runder_zahlen(schein):
    return sum(1 for zahl in schein['zahlen'] if zahl % 10 == 0)

# Primzahlen, gerade und ungerade Zahlen
def primzahlen():
    scheine = get_scheinexamples_from_db()  
    zahlen = [zahl for schein in scheine for zahl in [
        schein.lottozahl1, schein.lottozahl2, schein.lottozahl3,
        schein.lottozahl4, schein.lottozahl5, schein.lottozahl6
    ]]

    zahlen_array = np.array(zahlen)

    # 1. Primzahlen bis 50 bestimmen
    primzahlen_set = set(primerange(1, 51))

    # 2. Ermittlung der Kategorien
    primzahlen_count = np.isin(zahlen_array, list(primzahlen_set)).sum()
    gerade_count = (zahlen_array % 2 == 0).sum()
    ungerade_count = (zahlen_array % 2 == 1).sum()

    # 3. Gesamtsumme für Prozentwerte
    total_count = len(zahlen)
    daten = {
        'Kategorie': ['Primzahlen', 'Gerade Zahlen', 'Ungerade Zahlen'],
        'Anzahl': [primzahlen_count, gerade_count, ungerade_count],
        'Prozent': [100 * primzahlen_count / total_count, 
                    100 * gerade_count / total_count, 
                    100 * ungerade_count / total_count]
    }

    df = pd.DataFrame(daten)

    # Stacked Bar Chart mit Plotly
    fig = px.bar(df, x='Kategorie', y=['Anzahl', 'Prozent'], title="Häufigkeit und prozentuale Verteilung der Prim-, Geraden und Ungeraden Zahlen",
                 labels={'value': 'Häufigkeit', 'variable': 'Metrik'}, barmode='stack')

    return json.loads(fig.to_json())

# Flask-Route zur Häufigkeitsanalyse
@analysis_routes.route('/zahlenanalyse')
def zahlenanalyse():
    plot_data = primzahlen()
    return jsonify({'zahlenanalyse_plot': plot_data})

# Zwillinge, Drillinge
def aufeinanderfolgende(schein):
    sortierte_zahlen = sorted(schein['zahlen'])
    zwillinge = sum(1 for i in range(1, len(sortierte_zahlen)) if sortierte_zahlen[i] == sortierte_zahlen[i-1] + 1)
    drillinge = sum(1 for i in range(2, len(sortierte_zahlen)) if sortierte_zahlen[i] == sortierte_zahlen[i-2] + 2)
    return zwillinge, drillinge

# Vermeidung von Kombinationen 
beliebte_kombinationen = [
    {1, 2, 3, 4, 5, 6},
    {7, 14, 21, 28, 35, 42},
    # Weitere Kombinationen...
]

def vermeidung_beliebter_kombinationen(schein, beliebte_kombinationen):
    gezogene_zahlen = set(schein['zahlen'])
    return not any(gezogene_zahlen == kombination for kombination in beliebte_kombinationen)

# Distanz/Zerstreuung
def durchschnittliche_distanz(schein):
    zahlen = [(zahl - 1) // 7 for zahl in schein['zahlen']]
    paarweise_distanzen = [abs(x - y) for x, y in itertools.combinations(zahlen, 2)]
    return sum(paarweise_distanzen) / len(paarweise_distanzen)

# Diagonale
def ist_diagonal(schein):
    differenzen = [j - i for i, j in zip(sorted(schein['zahlen']), sorted(schein['zahlen'])[1:])]
    return all(d == 8 or d == 6 for d in differenzen)

# Breits gezogene Zahlen, vergangene Gewinnzahlen
historische_gewinnzahlen = [
    {4, 15, 23, 36, 42, 48},  # Set für jede Ziehung
    # Weitere Gewinnzahlen...
]

def ist_gewinnzahl(schein, historische_gewinnzahlen):
    gezogene_zahlen = set(schein['zahlen'])
    return any(gezogene_zahlen == gewinnzahlen for gewinnzahlen in historische_gewinnzahlen)

# Gitteranalyse (gleichmäßige Verteilung)
def get_gitteranalyse():
    ergebnisse = []
    scheine = get_scheinexamples_from_db()

    for schein in scheine:
        schein_id = schein.id
        zahlen = [schein.lottozahl1, schein.lottozahl2, schein.lottozahl3, 
                  schein.lottozahl4, schein.lottozahl5, schein.lottozahl6] 
        
        # Erstelle ein 7x7-Gitter und markiere ausgewählte Zahlen
        gitter = np.zeros((7, 7), dtype=int)
        
        for zahl in zahlen:
            zeile = (zahl - 1) // 7
            spalte = (zahl - 1) % 7
            gitter[zeile, spalte] = 1
        
        # Zähle ausgewählte Zahlen in jeder Zeile und Spalte
        zeilen_count = gitter.sum(axis=1)
        spalten_count = gitter.sum(axis=0)
        
        # Speichere die Anzahl der ausgewählten Zahlen pro Zeile und Spalte für jeden Schein
        for i in range(7):
            ergebnisse.append({
                'Schein_ID': schein_id,
                'Zeile': f'Zeile_{i+1}',
                'Anzahl_Gewählte_Zahlen': zeilen_count[i],
                'Art': 'Zeile',
                'Index': i + 1
            })
            ergebnisse.append({
                'Schein_ID': schein_id,
                'Spalte': f'Spalte_{i+1}',
                'Anzahl_Gewählte_Zahlen': spalten_count[i],
                'Art': 'Spalte',
                'Index': i + 1
            })

    # In ein DataFrame umwandeln für einfache Analyse und Visualisierung
    df = pd.DataFrame(ergebnisse)
    
     # Durchschnittliche Anzahl gewählter Zahlen pro Position berechnen (Zeile und Spalte)
    trend_data = df.groupby(['Index', 'Art'])['Anzahl_Gewählte_Zahlen'].mean().reset_index()

    # Linien-Diagramm für Zeilen und Spalten in einem Diagramm
    combined_fig = px.line(
        trend_data, 
        x='Index', 
        y='Anzahl_Gewählte_Zahlen',
        color='Art',
        title="Durchschnittliche Anzahl ausgewählter Zahlen pro Zeile und Spalte",
        labels={'Index': 'Position', 'Anzahl_Gewählte_Zahlen': 'Durchschnittliche Anzahl gewählter Zahlen'}
    )

    return json.loads(combined_fig.to_json())

# Flask-Route zur Gitteranalyse
@analysis_routes.route('/gitteranalyse')
def gitteranalyse():
    try:
        plot_json = get_gitteranalyse()
        return jsonify({
            'gitterplot': plot_json
        })
    except Exception as e:
        # Fehlerbehandlung, falls ein Fehler auftritt
        print(f"Fehler in der Gitteranalyse: {e}")
        return jsonify({'error': str(e)}), 500