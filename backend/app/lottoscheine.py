# app/lottoscheine.py
import numpy as np
import pandas as pd
from .database import save_lottoscheine_examples_to_db

# Funktion zur Generierung von 1000 Lottoscheinen, jeder Schein enthält 6 zufällige Zahlen von 1 bis 49
def generate_lotto_tickets(num_tickets=1000, num_numbers=6, range_start=1, range_end=49):
    # Jede Zeile entspricht einem Lottoschein, jede Zahl wird aus dem Bereich 1-49 gezogen und nur einmal ausgewählt
    tickets = [np.sort(np.random.choice(range(range_start, range_end + 1), num_numbers, replace=False)) 
               for _ in range(num_tickets)]
    return pd.DataFrame(tickets, columns=[f'Nummer_{i+1}' for i in range(num_numbers)])

# Generiere 1000 Lottoscheine
lotto_tickets = generate_lotto_tickets()
save_lottoscheine_examples_to_db(lotto_tickets)