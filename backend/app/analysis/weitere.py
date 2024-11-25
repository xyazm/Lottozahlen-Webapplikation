# Runde Zahlen
def anzahl_runder_zahlen(schein):
    return sum(1 for zahl in schein['zahlen'] if zahl % 10 == 0)


# Vermeidung von Kombinationen 
beliebte_kombinationen = [
    {1, 2, 3, 4, 5, 6},
    {7, 14, 21, 28, 35, 42},
    # Weitere Kombinationen...
]

def vermeidung_beliebter_kombinationen(schein, beliebte_kombinationen):
    gezogene_zahlen = set(schein['zahlen'])
    return not any(gezogene_zahlen == kombination for kombination in beliebte_kombinationen)



# Breits gezogene Zahlen, vergangene Gewinnzahlen
historische_gewinnzahlen = [
    {4, 15, 23, 36, 42, 48},  # Set für jede Ziehung
    # Weitere Gewinnzahlen...
]

def ist_gewinnzahl(schein, historische_gewinnzahlen):
    gezogene_zahlen = set(schein['zahlen'])
    return any(gezogene_zahlen == gewinnzahlen for gewinnzahlen in historische_gewinnzahlen)

# Malen nach Zahlen