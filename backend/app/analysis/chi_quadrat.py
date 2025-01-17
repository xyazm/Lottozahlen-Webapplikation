from scipy.stats import chisquare
import pandas as pd
import numpy as np

def chi_quadrat_primzahlen(anzahl_primzahlen_pro_schein):
    """
    Führt einen Chi-Quadrat-Test für die Primzahlenanalyse durch.
    Vergleicht die beobachteten Häufigkeiten der Primzahlen mit den erwarteten Häufigkeiten.
    """
    # Erwartete Häufigkeit: Gleichmäßige Verteilung auf 0 bis 6 Primzahlen
    total_scheine = len(anzahl_primzahlen_pro_schein)
    erwartete_haeufigkeit = total_scheine / 7  # Erwartung: gleichmäßige Verteilung auf 7 mögliche Werte (0-6)

    # Zähle die Häufigkeit jeder Anzahl von Primzahlen (0 bis 6)
    beobachtete_werte = pd.Series(anzahl_primzahlen_pro_schein).value_counts().sort_index().reindex(range(7), fill_value=0).tolist()
    erwartete_werte = [erwartete_haeufigkeit] * 7

    return chi_quadrat_test(beobachtete_werte, erwartete_werte)

def chi_quadrat_gitter(zeilen_count, spalten_count):
    """
    Führt einen Chi-Quadrat-Test für die Gitteranalyse durch.
    Vergleicht die beobachteten Häufigkeiten der ausgewählten Zahlen in Zeilen und Spalten
    mit einer gleichmäßigen Verteilung.
    """
    beobachtete_werte = np.concatenate([zeilen_count, spalten_count])
    erwartete_haeufigkeit = (sum(zeilen_count) + sum(spalten_count)) / (len(zeilen_count) + len(spalten_count))
    erwartete_werte = [erwartete_haeufigkeit] * len(beobachtete_werte)

    return chi_quadrat_test(beobachtete_werte, erwartete_werte)

def chi_quadrat_kleine_grosse(kombinationen, total_scheine):
    """
    Führt einen Chi-Quadrat-Test für die Verteilung kleiner und großer Zahlen durch.
    Erwartet wird eine gleichmäßige Verteilung (d. h. etwa 3 kleine und 3 große Zahlen pro Schein).
    """
    erwartete_haeufigkeit = total_scheine / len(kombinationen)  # Gleichmäßige Verteilung erwartet
    beobachtete_werte = [count for count in kombinationen.values()]

    erwartete_werte = [erwartete_haeufigkeit] * len(beobachtete_werte)

    return chi_quadrat_test(beobachtete_werte, erwartete_werte)


def chi_quadrat_gerade_ungerade(kombinationen, total_scheine):
    """
    Führt einen Chi-Quadrat-Test für die Verteilung gerader und ungerader Zahlen durch.
    Erwartet wird eine gleichmäßige Verteilung (d.h. 3 gerade und 3 ungerade Zahlen pro Schein).
    """
    erwartete_haeufigkeit = total_scheine / len(kombinationen)  # Gleichmäßige Verteilung erwartet
    beobachtete_werte = [count for count in kombinationen.values()]

    erwartete_werte = [erwartete_haeufigkeit] * len(beobachtete_werte)

    return chi_quadrat_test(beobachtete_werte, erwartete_werte)


def chi_quadrat_verteilung(df):
    """
    Führt einen Chi-Quadrat-Test für die Verteilung der Zahlen auf Zeilen und Spalten durch.
    Erwartet wird eine gleichmäßige Verteilung der Zahlen.
    """
    erwartete_haeufigkeit = df['Durchschnittswert'].mean()  # Erwartete durchschnittliche Häufigkeit
    beobachtete_werte= df['Durchschnittswert'].tolist()

    erwartete_werte = [erwartete_haeufigkeit] * len(beobachtete_werte)

    return chi_quadrat_test(beobachtete_werte, erwartete_werte)


def chi_quadrat_test(beobachtete_werte, erwartete_werte):

    chi_stat, p_value = chisquare(f_obs=beobachtete_werte, f_exp=erwartete_werte)

    #differenzen = [round(b - e, 2) for b, e in zip(beobachtete_werte, erwartete_werte)]
    feedback = f"Chi-Statistik: {chi_stat:.4f}, p-Wert: {p_value:.4f}\n<br>"
    #feedback += f"Differenzen: {differenzen}\n<br>"
    if p_value > 0.05:
        feedback += "Keine signifikante Abweichung.\n<br>"
    else:
        feedback += "Signifikante Abweichung.\n<br>"

    return feedback

def chi_quadrat_haufigkeit(haeufigkeit):
    """
    Führt einen Chi-Quadrat-Test durch, um zu überprüfen,
    ob die Häufigkeiten der Zahlen signifikant von der Zufälligkeit abweichen.
    """
    total_zahlen = sum(haeufigkeit.values())
    erwartete_haeufigkeit = total_zahlen / 49  # Erwartete Häufigkeit bei gleichmäßiger Verteilung

    beobachtete_werte = [haeufigkeit.get(i, 0) for i in range(1, 50)]
    erwartete_werte = [erwartete_haeufigkeit] * 49

    return chi_quadrat_test(beobachtete_werte, erwartete_werte)