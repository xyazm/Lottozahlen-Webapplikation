# app/analyse.py
import itertools
import math
from .database import *
from collections import Counter
import plotly.express as px
import pandas as pd
import json
from flask import jsonify, Blueprint

analysis_routes = Blueprint('analysis', __name__)

# Häufigkeit der Lottozahlen
def get_lottozahlen_haeufigkeit():
    # Alle Lottozahlen aus der Datenbank abfragen
    scheine = get_lottoscheine_from_db()
    
    # Alle Zahlen in einer einzigen Liste sammeln
    zahlen = []
    for schein in scheine:
        zahlen.extend([
            schein.lottozahl1, schein.lottozahl2, schein.lottozahl3,
            schein.lottozahl4, schein.lottozahl5, schein.lottozahl6
        ])
    
    # Häufigkeit der Zahlen mit Counter ermitteln
    haeufigkeit = Counter(zahlen)

    # DataFrame für die Plotly-Visualisierung erstellen
    df = pd.DataFrame({
        'Zahl': list(haeufigkeit.keys()),
        'Häufigkeit': list(haeufigkeit.values())
    })

    # Erstellen des Plotly-Balkendiagramms
    fig = px.bar(df, x='Zahl', y='Häufigkeit', title='Häufigkeit der Lottozahlen',
                 labels={'Zahl': 'Lottozahl', 'Häufigkeit': 'Anzahl der Vorkommen'})

    return fig.to_json()

@analysis_routes.route('/haeufigkeit')
def lotto_haeufigkeit():
    plot_json = get_lottozahlen_haeufigkeit()
    return jsonify(plot_json)


# Breits gezogene Zahlen, vergangene Gewinnzahlen
historische_gewinnzahlen = [
    {4, 15, 23, 36, 42, 48},  # Set für jede Ziehung
    # Weitere Gewinnzahlen...
]

def ist_gewinnzahl(schein, historische_gewinnzahlen):
    gezogene_zahlen = set(schein['zahlen'])
    return any(gezogene_zahlen == gewinnzahlen for gewinnzahlen in historische_gewinnzahlen)

# Gitteranalyse (gleichmäßige Verteilung)
def zeilen_und_spalten_verteilung(schein):
    zeilen = [(zahl - 1) // 7 for zahl in schein['zahlen']]
    spalten = [(zahl - 1) % 7 for zahl in schein['zahlen']]
    return len(set(zeilen)), len(set(spalten))

# Runde Zahlen
def anzahl_runder_zahlen(schein):
    return sum(1 for zahl in schein['zahlen'] if zahl % 10 == 0)

# Primzahlen
# Hilfsfunktion zur Bestimmung von Primzahlen
def ist_primzahl(n):
    if n < 2:
        return False
    for i in range(2, int(n ** 0.5) + 1):
        if n % i == 0:
            return False
    return True

def anzahl_primzahlen(schein):
    return sum(1 for zahl in schein['zahlen'] if ist_primzahl(zahl))

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
