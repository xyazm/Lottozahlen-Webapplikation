import pandas as pd
from flask import jsonify
import json
import plotly.express as px
from . import analysis_routes
from ..database import get_scheinexamples_from_db

@analysis_routes.route('/aufeinanderfolgende_reihen')
def aufeinanderfolgende_reihen_route():
    try:
        plot_json = analyse_aufeinanderfolgende_reihen()
        return jsonify({'aufeinanderfolgende_reihen_plot': plot_json})
    except Exception as e:
        print(f"Fehler in der Analyse aufeinanderfolgender Zahlen: {e}")
        return jsonify({'error': str(e)}), 500

def analyse_aufeinanderfolgende_reihen():
    scheine = get_scheinexamples_from_db()

    ergebnisse = []

    for schein in scheine:
        zahlen = [schein.lottozahl1, schein.lottozahl2, schein.lottozahl3,
                  schein.lottozahl4, schein.lottozahl5, schein.lottozahl6]
        
        # Sortiere die Zahlen, um Reihenfolge zu garantieren
        sortierte_zahlen = sorted(zahlen)
        
        # Zähle Sequenzen von Länge 2 bis 6
        reihen_counts = {}
        for reihenlaenge in range(2, 7):  # Reihenlängen von 2 bis 6
            count = 0
            for i in range(len(sortierte_zahlen) - reihenlaenge + 1):
                if all(sortierte_zahlen[i + j] == sortierte_zahlen[i] + j for j in range(reihenlaenge)):
                    count += 1
            reihen_counts[f'Reihe_{reihenlaenge}'] = count
        
        ergebnisse.append({'Schein_ID': schein.id, **reihen_counts})

    # Ergebnisse in ein DataFrame umwandeln
    df = pd.DataFrame(ergebnisse)

    # Durchschnittswerte berechnen
    summary = df.drop(columns=['Schein_ID']).mean().reset_index()
    summary.columns = ['Reihenlänge', 'Durchschnitt']

    # Umbenennung der Reihenlängen
    reihenlaenge_mapping = {
        'Reihe_2': 'Zwillinge',
        'Reihe_3': 'Drillinge',
        'Reihe_4': 'Vierlinge',
        'Reihe_5': 'Fünflinge',
        'Reihe_6': 'Sechslinge'
    }
    summary['Reihenlänge'] = summary['Reihenlänge'].map(reihenlaenge_mapping)

    # Visualisierung
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

    return json.loads(fig.to_json())