# Bachelorarbeit - Lottoscheinanalyse

## Projektsetup

### 1. Virtuelle Umgebung erstellen und Abhängigkeiten installieren
Im `backend`-Verzeichnis:

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

---

### 2. `.env` Datei erstellen
Im `backend`-Verzeichnis eine Datei `.env` mit folgendem Inhalt erstellen:

```env
JWT_SECRET=your_jwt_secret_here
SECRET_KEY=your_secret_key_here
MAIL_USERNAME=your_mail_username_here
MAIL_PASSWORD=your_mail_password_here
MAIL_DEFAULT_SENDER=your_email@example.com
FLASK_APP=app:create_app
FLASK_ENV=development
FLASK_RUN_PORT=5000
GROQ_API_KEY=your_groq_api_key_here
```

> **Hinweis:** Ersetze die Platzhalter (`your_*_here`) durch deine echten Werte.

---

### 3. Datenbank erstellen
Erstelle in MySQL eine Datenbank mit dem Namen `Bachelorarbeit_Lottoscheinanalyse`:

```sql
CREATE DATABASE Bachelorarbeit_Lottoscheinanalyse;
```

---

### 4. Migrationsordner löschen und Migration neu ausführen
Im `backend`-Verzeichnis:

```bash
rm -rf migrations
python -m flask db init
python -m flask db migrate -m "Initial migration"
python -m flask db upgrade
```

---

### 5. Admin-Benutzer erstellen
Erstelle in der Tabelle `admin` einen neuen Admin-Benutzer mit einem gehashten Passwort (`pdkdf2:sha256`). Nutze dafür ein Python-Skript oder führe es in der Flask Shell aus:

```python
from werkzeug.security import generate_password_hash
hashed_password = generate_password_hash("dein_passwort", method="pbkdf2:sha256")
print(hashed_password)
```

Speichere das generierte Passwort in der `admin`-Tabelle.

---

### 6. Submodul initialisieren und aktualisieren
Im Projektverzeichnis:

```bash
git submodule init
git submodule update --recursive --remote
```

---

### 7. Frontend installieren und starten
Wechsle in das `frontend`-Verzeichnis:

```bash
npm install
npm start
```

---

### 8. Backend starten
Wechsle zurück in das `backend`-Verzeichnis und starte die Anwendung:

```bash
python -m flask run
```

---

## Anwendung starten
- Das **Frontend** läuft auf `http://localhost:3000`.
- Das **Backend** läuft auf `http://localhost:5000`.
