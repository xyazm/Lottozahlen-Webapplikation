import pandas as pd
import json
import plotly.express as px
from sympy import primerange
from flask import request, jsonify
from . import analysis_routes, login_required_admin
from ..database import get_scheinexamples_from_db, get_lottoscheine_from_db, get_lottohistoric_from_db
from .chi_quadrat import chi_quadrat_primzahlen


# Hilfsfunktion: Liste der Primzahlen berechnen
def get_primzahlen_set(max_value=49):
    """
    Gibt eine Menge aller Primzahlen bis max_value zurück.
    """
    return set(primerange(1, max_value + 1))


# Hilfsfunktion: Anzahl der Primzahlen in einem Schein berechnen
def berechne_primzahlen_anzahl(schein, primzahlen_set):
    """
    Zählt die Anzahl der Primzahlen in einem Lottoschein.
    """
    return sum(1 for zahl in schein if zahl in primzahlen_set)


# Hilfsfunktion: Daten für die Visualisierung vorbereiten
def vorbereiten_primzahlen_daten(anzahl_primzahlen_pro_schein):
    """
    Bereitet die Daten für die Visualisierung der Primzahlenverteilung vor.
    """
    verteilung = pd.Series(anzahl_primzahlen_pro_schein).value_counts().sort_index()
    x_achse = range(0, 7)  # Werte von 0 bis 6
    return pd.DataFrame({
        'Anzahl_Primzahlen': x_achse,
        'Häufigkeit': [verteilung.get(x, 0) for x in x_achse]
    })


# Hilfsfunktion: Feedback generieren
def generate_primzahlen_feedback(anzahl_primzahlen_pro_schein):
    """
    Generiert Feedback zur Primzahlenverteilung in den Scheinen.
    """
    feedback = []
    if not anzahl_primzahlen_pro_schein:
        return ["Es wurden keine Scheine analysiert."]
    durchschnitt = sum(anzahl_primzahlen_pro_schein) / len(anzahl_primzahlen_pro_schein)
    feedback.append(f"Der Durchschnitt der Primzahlen pro Schein liegt bei {durchschnitt:.2f}.\n")
    maximale_anzahl = max(anzahl_primzahlen_pro_schein)
    feedback.append(f"Die höchste Anzahl von Primzahlen in einem Schein beträgt {maximale_anzahl}.\n")
    feedback.append(chi_quadrat_primzahlen(anzahl_primzahlen_pro_schein).replace("<br>", ""))
    return feedback


# Route: User-spezifische Primzahlenanalyse
#@analysis_routes.route('/user_primzahlenanalyse', methods=['POST'])
def user_primzahlenanalyse_route(user_scheine):
    """
    Führt eine Primzahlenanalyse für die Lottoscheine eines Users durch.
    """
    try:
        # User-Daten abrufen
        if not user_scheine:
            return jsonify({'error': 'Keine Lottoscheine übergeben.'}), 400

        # Liste der Primzahlen erstellen
        primzahlen_set = get_primzahlen_set()

        # Ergebnisse berechnen
        anzahl_primzahlen_pro_schein = [
            berechne_primzahlen_anzahl(schein, primzahlen_set)
            for schein in user_scheine
        ]

        # Feedback generieren
        feedback = generate_primzahlen_feedback(anzahl_primzahlen_pro_schein)
        #return jsonify({'feedback': feedback})
        return feedback
    except Exception as e:
        print(f"Fehler in der User-Primzahlenanalyse: {e}")
        return jsonify({'error': str(e)}), 500


@analysis_routes.route('/primzahlenanalyse')
@login_required_admin
def analyse_primzahlen_pro_schein():
    """
    Führt eine globale Primzahlenanalyse durch und erstellt eine Visualisierung.
    """
    source = request.args.get('source', 'user')
    if source == 'historic':
        scheine = get_lottohistoric_from_db()
    elif source == 'random':
        scheine= get_scheinexamples_from_db()
    else:
        scheine = get_lottoscheine_from_db()

    # Liste der Primzahlen im Bereich 1 bis 49
    primzahlen_set = get_primzahlen_set()

    # Anzahl der Primzahlen pro Schein berechnen
    anzahl_primzahlen_pro_schein = [
        berechne_primzahlen_anzahl(
            [
                schein.lottozahl1, schein.lottozahl2, schein.lottozahl3,
                schein.lottozahl4, schein.lottozahl5, schein.lottozahl6
            ],
            primzahlen_set
        )
        for schein in scheine
    ]

    chi_test = chi_quadrat_primzahlen(anzahl_primzahlen_pro_schein)

    # Daten für die Visualisierung vorbereiten
    df = vorbereiten_primzahlen_daten(anzahl_primzahlen_pro_schein)

    # Visualisierung erstellen
    fig = px.bar(
        df,
        x='Anzahl_Primzahlen',
        y='Häufigkeit',
        title='Verteilung der Anzahl der Primzahlen in Lottoscheinen<br><sub>{}</sub>'.format(chi_test),
        labels={'Anzahl_Primzahlen': 'Anzahl der Primzahlen', 'Häufigkeit': 'Häufigkeit'},
        text='Häufigkeit'
    )
    fig.update_traces(textposition='outside')
    fig.update_layout(
        xaxis=dict(tickmode='linear', tick0=0, dtick=1),
        yaxis_title='Häufigkeit',
        xaxis_title='Anzahl der Primzahlen pro Schein',
        height=600,
    )

    return jsonify({f'primzahlenanalyse_plot_{source}': json.loads(fig.to_json())})