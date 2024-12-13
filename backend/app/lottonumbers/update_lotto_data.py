import os
import json
import subprocess
from datetime import datetime
from flask import jsonify
from ..database import save_lottohistoric_to_db, get_latest_lottohistoric_from_db
from ..jwt_helper import login_required_admin
from . import lotto_db

@lotto_db.route('/admin/latest-lotto-data', methods=['GET'])
@login_required_admin
def latest_lotto_route():
    try:
        latest_date = get_latest_lottohistoric_from_db()
        latest_date = latest_date.strftime('%a, %d.%m.%Y')
        return jsonify({'latestdate': latest_date})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@lotto_db.route('/admin/update-lotto', methods=['POST'])
@login_required_admin
def update_lotto_route():
    """
    API-Endpoint, um die Lotto-Datenbank zu aktualisieren.
    """
    try:
        update_lotto_data()  # Führt das Update aus
        return jsonify({'status': 'success', 'message': 'Lotto-Datenbank erfolgreich aktualisiert!'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


def pull_latest_repo():
    """
    Holt die neuesten Änderungen des geklonten Git-Repositories.
    """
    repo_path = os.path.join(os.path.dirname(__file__), 'LottoNumberArchive')
    try:
        # Führt 'git pull' im Repository aus
        result = subprocess.run(
            ['git', '-C', repo_path, 'pull', 'origin', 'master'],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        if result.returncode == 0:
            print("Repo erfolgreich aktualisiert.")
        else:
            print(f"Fehler beim Aktualisieren des Repos: {result.stderr}")
    except Exception as e:
        print(f"Fehler beim Pull des Repos: {e}")

def update_lotto_data():
    """
    Aktualisiert die Datenbank mit den Lottozahlen aus der JSON-Datei.
    """
    # Repository auf den neuesten Stand bringen
    pull_latest_repo()
    # Pfad zur JSON-Datei im geklonten Repo
    json_path = os.path.join(os.path.dirname(__file__), 'LottoNumberArchive', 'Lottonumbers_complete.json')
    
    try:
        with open(json_path, 'r', encoding='utf-8') as file:
            lotto_data = json.load(file)['data']  # Lade den "data"-Schlüssel aus der JSON-Datei
    except FileNotFoundError:
        print(f"Die Datei {json_path} wurde nicht gefunden.")
        return
    except json.JSONDecodeError:
        print(f"Fehler beim Lesen der JSON-Datei: {json_path}")
        return

    # Jüngstes Datum aus der Datenbank abrufen
    latest_date = get_latest_lottohistoric_from_db()

    if latest_date is None:
        # Wenn die Tabelle leer ist, füge alle Daten hinzu
        print("Die Tabelle ist leer. Füge alle Daten aus der JSON-Datei hinzu...")
        save_lottohistoric_to_db(lotto_data)
        print(f"Alle {len(lotto_data)} Einträge wurden erfolgreich gespeichert.")
        return

    # Filtere nur neue Daten aus der JSON-Datei
    new_data = [
        entry for entry in lotto_data
        if datetime.strptime(entry['date'], '%d.%m.%Y').date() > latest_date
    ]

    if not new_data:
        print("Keine neuen Daten zum Hinzufügen.")
        return

    print(f"{len(new_data)} neue Einträge gefunden. Speichere in die Datenbank...")
    save_lottohistoric_to_db(new_data)