# app/analyse.py
import itertools
import math
from .database import *
from collections import Counter
import plotly.express as px
import pandas as pd
import numpy as np
from sympy import primerange
import json
from flask import jsonify, Blueprint

analysis_routes = Blueprint('analysis', __name__)

# Häufigkeit der Lottozahlen
def get_lottozahlen_haeufigkeit():
    scheine = get_lottoscheine_from_db()
    zahlen = [zahl for schein in scheine for zahl in [
        schein.lottozahl1, schein.lottozahl2, schein.lottozahl3,
        schein.lottozahl4, schein.lottozahl5, schein.lottozahl6
    ]]
    haeufigkeit_df = pd.DataFrame(Counter(zahlen).items(), columns=['Zahl', 'Häufigkeit'])

    # Erstellen des Plotly-Balkendiagramms
    fig = px.bar(haeufigkeit_df, x='Zahl', y='Häufigkeit', title='Häufigkeit der Lottozahlen',
                labels={'Zahl': 'Lottozahl', 'Häufigkeit': 'Anzahl der Vorkommen'})

    return json.loads(fig.to_json())

@analysis_routes.route('/haeufigkeit')
def lotto_haeufigkeit():
    plot_json = get_lottozahlen_haeufigkeit()
    return jsonify({'haeufigkeit_plot': plot_json})


# Runde Zahlen
def anzahl_runder_zahlen(schein):
    return sum(1 for zahl in schein['zahlen'] if zahl % 10 == 0)

# Primzahlen, gerade und ungerade Zahlen
def primzahlen():
    scheine = get_lottoscheine_from_db()  # Annahme: dies ruft die Lottozahlen ab
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
# Analyse ist noch falsch ! muss noch korrigiert werden, gibt nur häuftigkeit als heatmap zurück
def zeilen_und_spalten_verteilung(schein):
    # Lottozahlen aus dem Schein extrahieren
    zahlen = [schein.lottozahl1, schein.lottozahl2, schein.lottozahl3, 
              schein.lottozahl4, schein.lottozahl5, schein.lottozahl6]
    
    # Zeilen und Spalten berechnen
    zeilen = [(zahl - 1) // 7 for zahl in zahlen]  # Zeile für jede Zahl
    spalten = [(zahl - 1) % 7 for zahl in zahlen]  # Spalte für jede Zahl

    return zeilen, spalten

# Funktion zur Durchführung der Gitteranalyse und Generierung des Scatterplot
def get_gitteranalyse():
    # Alle Scheine abrufen
    scheine = get_lottoscheine_from_db()
    
    # Sicherstellen, dass Scheine vorhanden sind
    if not scheine:
        return {}, {}

    # Leere Matrix für Zeilen- und Spaltenhäufigkeiten erstellen
    gitter_matrix = pd.DataFrame([[0] * 7 for _ in range(7)], columns=range(7), index=range(7))

    # Gitteranalyse für jeden Schein durchführen
    for schein in scheine:
        zeilen, spalten = zeilen_und_spalten_verteilung(schein)
        
        # Häufigkeit der Zahlen in Zeilen und Spalten erhöhen
        for z, s in zip(zeilen, spalten):
            gitter_matrix.iloc[z, s] += 1

    # Heatmap erstellen: Umbenennung der Spalten und Zeilen für bessere Lesbarkeit
    gitter_matrix.columns = [f"Spalte {i+1}" for i in range(7)]
    gitter_matrix.index = [f"Zeile {i+1}" for i in range(7)]

    # Erstellen der Heatmap
    fig = px.imshow(gitter_matrix, color_continuous_scale='Blues', 
                    title="Häufigkeit der Lottozahlen im Gitter", 
                    labels={'x': 'Spalten', 'y': 'Zeilen'})
    
    # Diagramm in JSON umwandeln
    return json.loads(fig.to_json())

# Flask-Route zur Gitteranalyse
@analysis_routes.route('/gitteranalyse')
def gitteranalyse():
    try:
        plot_json = get_gitteranalyse()
        return jsonify({
            'gitter_plot': plot_json
        })
    except Exception as e:
        # Fehlerbehandlung, falls ein Fehler auftritt
        print(f"Fehler in der Gitteranalyse: {e}")
        return jsonify({'error': str(e)}), 500
